import time
import os
import re
import json
from dotenv import load_dotenv
from falkordb import FalkorDB
from openai import OpenAI

load_dotenv()

GRAPH_NAME = os.getenv("FALKORDB_GRAPH", "company_brain")
FALKORDB_HOST = os.getenv("FALKORDB_HOST", "localhost")
FALKORDB_PORT = int(os.getenv("FALKORDB_PORT", "6379"))

MODEL = os.getenv(
    "OPENROUTER_MODEL",
    "nvidia/nemotron-3.5-lightning:free"
)
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# Cache the graph snapshot so repeated questions don't rescan the whole graph.
GRAPH_CACHE_TTL = max(10, int(os.getenv("GRAPH_CACHE_TTL", "60")))
_GRAPH_CACHE = {
    "loaded_at": 0.0,
    "nodes": None,
    "relationships": None,
}


# Existing specialist agents
AGENTS = {
    "People & Teams": [
        "employee", "people", "team", "department",
        "manager", "skills", "owner", "owns",
        "who knows", "recruitment"
    ],
    "Projects": [
        "project", "roadmap", "status",
        "deliverable", "works on"
    ],
    "Issues & Telecom": [
        "issue", "ticket", "bug", "incident",
        "telecom", "network", "outage",
        "error", "resolved"
    ],
    "Documents": [
        "document", "file", "policy",
        "report", "documented", "source", "training"
    ],
    "Decisions": [
        "decision", "decided", "why",
        "reason", "approved", "trade-off"
    ],
}


# --------------------------------------------------
# DATABASE CONNECTION
# --------------------------------------------------

def connect_graph():
    db = FalkorDB(
        host=FALKORDB_HOST,
        port=FALKORDB_PORT
    )
    graph = db.select_graph(GRAPH_NAME)
    graph.query("RETURN 1 AS test")
    return graph


# --------------------------------------------------
# OPENROUTER CLIENT
# --------------------------------------------------

def get_client():
    api_key = os.getenv("OPENROUTER_API_KEY", "").strip()

    if not api_key:
        raise RuntimeError(
            "OPENROUTER_API_KEY is missing. "
            "Add it to your backend .env file."
        )

    return OpenAI(
        base_url=OPENROUTER_BASE_URL,
        api_key=api_key,
        timeout=20.0,
        max_retries=0,
        default_headers={
            "HTTP-Referer": os.getenv(
                "OPENROUTER_SITE_URL",
                "http://localhost:5173"
            ),
            "X-Title": "Company Brain AI",
        },
    )


# --------------------------------------------------
# AGENT ROUTING
# --------------------------------------------------

def route_agent(question):
    q = question.lower()

    scores = {
        name: sum(1 for term in terms if term in q)
        for name, terms in AGENTS.items()
    }

    best = max(scores, key=scores.get)

    if scores[best] == 0:
        return "Company Generalist"

    return best


# --------------------------------------------------
# TEXT NORMALIZATION
# --------------------------------------------------

def normalize(value):
    """Normalize names for exact comparisons."""
    return re.sub(
        r"[^a-z0-9]",
        "",
        str(value or "").lower()
    )


def extract_person_name(question):
    """
    Detect direct person-identity questions.
    Example: Who is Maruk Fraval?
    """
    patterns = [
        r"^\s*who\s+is\s+(.+?)\s*[?.!]*$",
        r"^\s*tell\s+me\s+about\s+(.+?)\s*[?.!]*$",
    ]

    for pattern in patterns:
        match = re.match(
            pattern,
            question,
            re.IGNORECASE
        )

        if match:
            name = match.group(1).strip()
            if name:
                return name

    return None


def person_name_candidates(labels, props):
    """
    Extract name fields from person-like graph nodes.
    Also supports DatasetRow nodes containing employee data.
    """
    label_names = {
        str(label).lower()
        for label in labels
    }

    person_labels = {
        "employee", "person", "people", "individual"
    }

    normalized_props = {
        normalize(key): value
        for key, value in props.items()
    }

    person_keys = {
        "employeeid", "empid", "personid",
        "firstname", "lastname", "fullname",
        "employeename", "personname"
    }

    is_person = (
        bool(label_names.intersection(person_labels))
        or any(key in normalized_props for key in person_keys)
    )

    if not is_person:
        return []

    candidates = []

    name_keys = {
        "name",
        "fullname",
        "employeename",
        "personname",
        "displayname",
    }

    for key, value in normalized_props.items():
        if key in name_keys and value:
            candidates.append(str(value).strip())

    first = (
        normalized_props.get("firstname")
        or normalized_props.get("first")
        or ""
    )
    last = (
        normalized_props.get("lastname")
        or normalized_props.get("last")
        or ""
    )

    combined = f"{first} {last}".strip()

    if combined:
        candidates.append(combined)

    return list(dict.fromkeys(
        name for name in candidates if name
    ))


# --------------------------------------------------
# GRAPH RETRIEVAL
# --------------------------------------------------

def retrieve_graph_evidence(graph, question, limit=35):
    """
    Retrieve relevant graph evidence.

    Direct person lookups require an exact normalized name.
    General questions use ranked node matches and relationships
    connected to those nodes.
    """

    # Cache the full snapshot briefly. This avoids repeating expensive full-graph
    # scans on every chat message while still refreshing periodically.
    cache_now = time.monotonic()
    cache_valid = (
        _GRAPH_CACHE["nodes"] is not None
        and _GRAPH_CACHE["relationships"] is not None
        and cache_now - _GRAPH_CACHE["loaded_at"] < GRAPH_CACHE_TTL
    )

    if cache_valid:
        nodes = _GRAPH_CACHE["nodes"]
        relationships = _GRAPH_CACHE["relationships"]
        print("[PERF] Graph cache hit", flush=True)
    else:
        fetch_started = time.perf_counter()
        print("[PERF] Loading graph snapshot...", flush=True)

        node_result = graph.query("""
            MATCH (n)
            RETURN labels(n) AS labels,
                   properties(n) AS props
        """)

        nodes = []
        for row in node_result.result_set:
            labels = row[0] or []
            props = row[1] or {}
            nodes.append({
                "labels": labels,
                "props": props,
            })

        rel_result = graph.query("""
            MATCH (a)-[r]->(b)
            RETURN labels(a) AS source_labels,
                   properties(a) AS source,
                   type(r) AS relationship,
                   labels(b) AS target_labels,
                   properties(b) AS target
        """)

        relationships = []
        for row in rel_result.result_set:
            relationships.append({
                "source_labels": row[0] or [],
                "source": row[1] or {},
                "relationship": row[2],
                "target_labels": row[3] or [],
                "target": row[4] or {},
            })

        _GRAPH_CACHE.update({
            "loaded_at": time.monotonic(),
            "nodes": nodes,
            "relationships": relationships,
        })

        print(
            f"[PERF] Graph snapshot loaded in "
            f"{time.perf_counter() - fetch_started:.2f}s "
            f"({len(nodes)} nodes, {len(relationships)} relationships)",
            flush=True,
        )

    # ---- Exact person-name matching ----

    requested_name = extract_person_name(question)

    if requested_name:
        requested = normalize(requested_name)

        matches = []

        for node in nodes:
            candidates = person_name_candidates(
                node["labels"],
                node["props"]
            )

            if any(
                normalize(candidate) == requested
                for candidate in candidates
            ):
                matches.append(node)

        if not matches:
            # Never substitute a different person.
            return []

        matched_props = [
            node["props"] for node in matches
        ]

        evidence = []

        for node in matches:
            evidence.append({
                "type": "node",
                "source": ", ".join(node["labels"]),
                "details": node["props"],
            })

        # Include only directly connected relationships.
        for rel in relationships:
            if (
                rel["source"] in matched_props
                or rel["target"] in matched_props
            ):
                evidence.append({
                    "type": "relationship",
                    "source": rel["source"],
                    "relationship": rel["relationship"],
                    "target": rel["target"],
                })

        return evidence[:limit]

    # ---- General question retrieval ----

    stop_words = {
        "what", "who", "when", "where", "why", "how",
        "does", "did", "the", "and", "for", "with",
        "from", "this", "that", "are", "was", "is",
        "tell", "me", "about", "show", "find", "which",
        "can", "you", "please", "to", "of", "in", "on",
        "a", "an", "be", "by", "it", "my", "our",
        "company", "give", "list", "explain",
    }

    terms = re.findall(
        r"[a-zA-Z0-9_-]+",
        question.lower()
    )

    terms = list(dict.fromkeys(
        term for term in terms
        if len(term) > 1 and term not in stop_words
    ))

    if not terms:
        return []

    def score_text(value):
        text = str(value).lower()
        total = 0

        for term in terms:
            pattern = (
                r"(?<![a-z0-9])"
                + re.escape(term)
                + r"(?![a-z0-9])"
            )

            if re.search(pattern, text):
                total += 1

        return total

    ranked_nodes = []

    for node in nodes:
        blob = (
            str(node["labels"])
            + " "
            + str(node["props"])
        )

        score = score_text(blob)

        if score > 0:
            ranked_nodes.append((score, node))

    ranked_nodes.sort(
        key=lambda item: item[0],
        reverse=True
    )

    # Limit evidence to the most relevant graph nodes.
    selected_nodes = [
        node for _, node in ranked_nodes[:10]
    ]

    if not selected_nodes:
        return []

    selected_props = [
        node["props"] for node in selected_nodes
    ]

    evidence = []

    for node in selected_nodes:
        evidence.append({
            "type": "node",
            "source": ", ".join(node["labels"]),
            "details": node["props"],
        })

    # Do not include relationships just because their text
    # contains a matching keyword. They must connect to a
    # selected node.
    for rel in relationships:
        if (
            rel["source"] in selected_props
            or rel["target"] in selected_props
        ):
            evidence.append({
                "type": "relationship",
                "source": rel["source"],
                "relationship": rel["relationship"],
                "target": rel["target"],
            })

    return evidence[:limit]


# --------------------------------------------------
# OPENROUTER RESPONSE EXTRACTION
# --------------------------------------------------

def _extract_message_content(message):
    content = getattr(message, "content", None)

    if isinstance(content, str) and content.strip():
        return content.strip()

    if isinstance(content, list):
        parts = []

        for item in content:
            if isinstance(item, dict) and item.get("text"):
                parts.append(item["text"])
            elif getattr(item, "text", None):
                parts.append(item.text)

        if parts:
            return "\n".join(parts).strip()

    return None


# --------------------------------------------------
# EVIDENCE-BASED ANSWER GENERATION
# --------------------------------------------------

def ask_llm(question, evidence, agent=None):
    if not evidence:
        return (
            "I couldn't find an exact matching person record "
            "or sufficient relevant evidence in the company "
            "graph. Check the spelling or import the missing data."
        ), []

    try:
        client = get_client()
    except Exception as exc:
        return f"AI configuration error: {exc}", evidence

    system = """
You are Company Brain, a company knowledge assistant.

STRICT RULES:
1. Answer only using the supplied graph evidence.
2. Never invent a person, name, role, project, issue, or decision.
3. For a person-identity question, use the exact matching
   person's node as the identity source.
4. Do not identify one person using another person's record.
5. Do not claim a relationship unless that relationship
   explicitly appears in the evidence.
6. If the evidence does not answer the question, say so.
7. Keep answers concise and distinguish facts from uncertainty.
8. Do not treat the number of evidence records as proof.
Return only the final answer.
"""

    user = (
        f"Agent: {agent or 'Company Generalist'}\n"
        f"Question: {question}\n"
        "Graph evidence:\n"
        f"{json.dumps(evidence, ensure_ascii=False, default=str)[:12000]}\n\n"
        "Answer the question using only the supplied evidence."
    )

    started = time.perf_counter()
    print(f"[PERF] OpenRouter request started: {MODEL}", flush=True)

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            max_tokens=500,
            extra_body={"reasoning": {"enabled": False}},
        )

        if not response.choices:
            return "OpenRouter returned no choices. Please try again.", evidence

        choice = response.choices[0]
        answer = _extract_message_content(choice.message)

        print(
            f"[PERF] OpenRouter completed in "
            f"{time.perf_counter() - started:.2f}s",
            flush=True,
        )

        if answer:
            return answer, evidence

        return (
            "The AI model returned no final answer. "
            "Please try again or check model availability.",
            evidence,
        )

    except Exception as exc:
        print(
            f"[LLM ERROR] {type(exc).__name__}: {exc}",
            flush=True,
        )
        print(
            f"[PERF] OpenRouter failed after "
            f"{time.perf_counter() - started:.2f}s",
            flush=True,
        )
        return (
            "AI request failed. Check OpenRouter model availability, "
            "API configuration, and rate limits.",
            evidence,
        )



# --------------------------------------------------
# MAIN QUESTION ANSWERING FUNCTION
# --------------------------------------------------

def answer_question(graph, question):
    total_start = time.perf_counter()

    # Step 1: Route question to the correct agent
    stage_start = time.perf_counter()
    agent = route_agent(question)

    print(
        f"[PERF] Agent routing: "
        f"{time.perf_counter() - stage_start:.3f}s",
        flush=True,
    )

    # Step 2: Retrieve relevant graph evidence
    stage_start = time.perf_counter()

    evidence = retrieve_graph_evidence(
        graph,
        question
    )

    print(
        f"[PERF] Graph retrieval: "
        f"{time.perf_counter() - stage_start:.3f}s",
        flush=True,
    )

    print(
        f"[PERF] Evidence records: {len(evidence)}",
        flush=True,
    )

    # Fail closed for direct person lookups.
    # Never let the LLM guess when no exact match exists.
    if extract_person_name(question) and not evidence:
        return {
            "agent": agent,
            "answer": (
                "I couldn't find an exact matching person "
                "in the retrieved company graph records. "
                "Please check the spelling or verify that "
                "the person's data has been imported."
            ),
            "evidence": [],
        }

    answer, evidence = ask_llm(
        question,
        evidence,
        agent
    )

    return {
        "agent": agent,
        "answer": answer,
        "evidence": evidence,
    }


# --------------------------------------------------
# TERMINAL MODE
# --------------------------------------------------

def main():
    print("Company Brain AI — OpenRouter")
    print("Model:", MODEL)
    print("Graph:", GRAPH_NAME)

    try:
        graph = connect_graph()
        print("FalkorDB connected successfully.")
    except Exception as exc:
        print(
            f"FalkorDB connection failed: "
            f"{type(exc).__name__}: {exc}"
        )
        print(
            "Check Docker, FALKORDB_HOST and FALKORDB_PORT."
        )
        return

    while True:
        try:
            question = input(
                "\nAsk a question (or 'exit'): "
            ).strip()

            if question.lower() in {"exit", "quit"}:
                break

            if not question:
                continue

            result = answer_question(
                graph,
                question
            )

            print("\nAgent:", result["agent"])
            print("Answer:", result["answer"])
            print(
                "Evidence:",
                json.dumps(
                    result["evidence"],
                    ensure_ascii=False,
                    default=str,
                    indent=2,
                ),
            )

        except KeyboardInterrupt:
            print("\nExiting Company Brain.")
            break

        except Exception as exc:
            print(
                "Request error:",
                type(exc).__name__,
                str(exc),
            )


if __name__ == "__main__":
    main()
