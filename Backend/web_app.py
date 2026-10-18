import os, csv, io, json
import streamlit as st
from app import connect_graph, answer_question, GRAPH_NAME, MODEL, AGENTS

st.set_page_config(page_title="Company Brain AI", page_icon="🧠", layout="wide")
st.markdown("""
<style>
.block-container {padding-top: 2rem; max-width: 1400px;}
[data-testid="stAppViewContainer"] {background: #090b10;}
[data-testid="stSidebar"] {background: #10131b;}
h1, h2, h3 {letter-spacing: -0.03em;}
div[data-testid="stMetric"] {background:#121722; border:1px solid #272d3b; padding:16px; border-radius:12px;}
</style>
""", unsafe_allow_html=True)

st.title("🧠 Company Brain")
st.caption("Connected company knowledge • Evidence-backed answers • Specialist agents")
with st.sidebar:
    st.header("Workspace")
    st.write("**Graph:** FalkorDB")
    st.write(f"**Graph name:** `{GRAPH_NAME}`")
    st.write(f"**AI model:** `{MODEL}`")
    st.divider()
    st.subheader("Specialist agents")
    for name in AGENTS:
        st.write("• " + name)
    st.write("• Company Generalist")
    st.divider()
    st.caption("Use deployment secrets for credentials. Never upload your .env file.")

tab_chat, tab_data, tab_status = st.tabs(["💬 Ask Company Brain", "📥 Import CSV", "⚙️ System status"])
if "history" not in st.session_state: st.session_state.history = []

with tab_chat:
    st.markdown("### Ask across people, teams, projects, tickets and decisions")
    prompts = ["Who works on Payment Service?", "Who fixed BUG-104?", "What decision resolved BUG-104?", "Which employees have skills in reporting?"]
    cols = st.columns(4)
    for i, p in enumerate(prompts):
        if cols[i].button(p, use_container_width=True):
            st.session_state.pending_question = p
    for item in st.session_state.history:
        with st.chat_message(item["role"]):
            st.markdown(item["content"])
            if item.get("agent"): st.caption("Agent: " + item["agent"])
            if item.get("evidence"):
                with st.expander(f"Sources / graph evidence ({len(item['evidence'])})"):
                    st.json(item["evidence"])
    question = st.chat_input("Ask a question about your company...")
    if st.session_state.get("pending_question"):
        question = st.session_state.pop("pending_question")
    if question:
        st.session_state.history.append({"role":"user","content":question})
        with st.chat_message("user"): st.markdown(question)
        with st.chat_message("assistant"):
            try:
                with st.spinner("Following graph relationships and preparing an evidence-backed answer..."):
                    graph = connect_graph()
                    result = answer_question(graph, question)
                st.markdown(result["answer"])
                st.caption("Routed to: " + result["agent"])
                if result["evidence"]:
                    with st.expander(f"Sources / graph evidence ({len(result['evidence'])})", expanded=True):
                        st.json(result["evidence"])
                st.session_state.history.append({"role":"assistant","content":result["answer"],"agent":result["agent"],"evidence":result["evidence"]})
            except Exception as exc:
                msg = f"Request failed ({type(exc).__name__}): {str(exc)[:300]}. Check FalkorDB connection and OpenRouter configuration."
                st.error(msg)
                st.session_state.history.append({"role":"assistant","content":msg})
    if st.button("Clear conversation"):
        st.session_state.history = []
        st.rerun()

with tab_data:
    st.markdown("### Import a CSV into the graph")
    st.info("This imports each CSV row as a DatasetRow node. It preserves columns and can be re-run without duplicating the same row IDs.")
    upload = st.file_uploader("Choose CSV", type=["csv"])
    if upload:
        try:
            decoded = upload.getvalue().decode("utf-8-sig")
            rows = list(csv.DictReader(io.StringIO(decoded)))
            st.write(f"Detected **{len(rows)} rows** and **{len(rows[0]) if rows else 0} columns**.")
            st.dataframe(rows[:10], use_container_width=True)
            if st.button("Import rows to FalkorDB", type="primary"):
                graph = connect_graph()
                count = 0
                for idx, row in enumerate(rows, start=1):
                    props = {str(k).strip().replace(" ","_"):str(v or "").strip() for k,v in row.items() if k and str(v or "").strip()}
                    graph.query("""MERGE (n:DatasetRow {dataset:$dataset, row_id:$row_id}) SET n += $props""",
                                {"dataset":upload.name,"row_id":str(idx),"props":props})
                    count += 1
                st.success(f"Imported {count} rows into graph `{GRAPH_NAME}`.")
        except Exception as exc:
            st.error(f"CSV could not be processed: {type(exc).__name__}. Check that it is a valid UTF-8 CSV.")

with tab_status:
    st.markdown("### Connection checks")
    st.write("The deployed app needs a reachable FalkorDB instance and an OpenRouter API key for AI-generated answers.")
    c1, c2 = st.columns(2)
    if c1.button("Test FalkorDB connection"):
        try:
            graph = connect_graph()
            result = graph.query("MATCH (n) RETURN count(n) AS total")
            st.success("FalkorDB connected.")
            st.metric("Nodes in graph", result.result_set[0][0] if result.result_set else 0)
        except Exception as exc:
            st.error(f"Connection failed: {type(exc).__name__}. Check database host, port, and network access.")
    if c2.button("Check AI key"):
        if os.getenv("OPENROUTER_API_KEY","").strip(): st.success("OPENROUTER_API_KEY is configured.")
        else: st.warning("OPENROUTER_API_KEY is not configured. Add it to Streamlit secrets.")
