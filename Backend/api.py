
import time

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app import connect_graph, answer_question, MODEL, GRAPH_NAME

api = FastAPI(title="Company Brain API")


# ---------------- CORS CONFIGURATION ----------------

api.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
)


# ---------------- REQUEST MODEL ----------------

class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4000)


# ---------------- ROOT ROUTE ----------------

@api.get("/")
def root():
    return {
        "service": "Company Brain API",
        "status": "running",
        "docs": "/docs",
    }


# ---------------- HEALTH CHECK ----------------

@api.get("/api/health")
def health():
    start = time.perf_counter()

    try:
        print("[HEALTH] Checking FalkorDB...", flush=True)

        graph = connect_graph()
        graph.query("RETURN 1 AS test")

        node_result = graph.query(
            "MATCH (n) RETURN count(n) AS total"
        )

        rel_result = graph.query(
            "MATCH ()-[r]->() RETURN count(r) AS total"
        )

        elapsed = time.perf_counter() - start

        result = {
            "status": "ok",
            "database": "connected",
            "model": MODEL,
            "graph": GRAPH_NAME,
            "nodes": (
                node_result.result_set[0][0]
                if node_result.result_set else 0
            ),
            "relationships": (
                rel_result.result_set[0][0]
                if rel_result.result_set else 0
            ),
            "response_time_seconds": round(elapsed, 3),
        }

        print(
            f"[HEALTH] Completed in {elapsed:.2f}s",
            flush=True,
        )

        return result

    except Exception as exc:
        print(
            f"[HEALTH ERROR] {type(exc).__name__}: {exc}",
            flush=True,
        )

        raise HTTPException(
            status_code=503,
            detail=f"Database connection failed: {type(exc).__name__}",
        ) from exc


# ---------------- CHAT API ----------------

@api.post("/api/chat")
def chat(request: ChatRequest):
    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question is required",
        )

    total_start = time.perf_counter()

    try:
        print(
            f"\n[CHAT] Question received: {question}",
            flush=True,
        )

        # Step 1: Connect to the graph
        stage_start = time.perf_counter()

        print("[CHAT] Connecting to FalkorDB...", flush=True)

        graph = connect_graph()

        print(
            f"[TIME] Graph connection: "
            f"{time.perf_counter() - stage_start:.3f}s",
            flush=True,
        )

        # Step 2: Retrieve evidence and generate the answer
        stage_start = time.perf_counter()

        print(
            f"[CHAT] Running answer_question | Model: {MODEL}",
            flush=True,
        )

        result = answer_question(graph, question)

        print(
            f"[TIME] Retrieval + AI generation: "
            f"{time.perf_counter() - stage_start:.3f}s",
            flush=True,
        )

        answer = result.get(
            "answer",
            "No answer was returned."
        )

        evidence = result.get("evidence", [])

        print(
            f"[CHAT] Answer ready | "
            f"Evidence records: {len(evidence)}",
            flush=True,
        )

        print(
            f"[TIME] Total request: "
            f"{time.perf_counter() - total_start:.3f}s",
            flush=True,
        )

        return {
            "answer": answer,
            "agent": result.get(
                "agent",
                "Company Generalist"
            ),
            "sources": evidence,
            "evidence": evidence,
        }

    except HTTPException:
        raise

    except Exception as exc:
        print(
            f"[CHAT ERROR] {type(exc).__name__}: {exc}",
            flush=True,
        )

        print(
            f"[TIME] Failed request after "
            f"{time.perf_counter() - total_start:.3f}s",
            flush=True,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Company Brain request failed: "
                f"{type(exc).__name__}"
            ),
        ) from exc
