# Company Brain — Backend

Graph-backed Q&A service for company knowledge. It stores people, projects, surveys, recruitment and training data in a **FalkorDB** graph, routes each question to a specialist agent, retrieves matching graph evidence, and asks an LLM (via **OpenRouter**) to write an evidence-backed answer.

Two entry points are included:

- **FastAPI** (`api.py`) — REST API used by the React frontend.
- **Streamlit** (`web_app.py`) — standalone UI for chatting, importing CSVs and checking system status.

## Tech stack

- Python 3.10+
- FastAPI + Uvicorn
- Streamlit
- FalkorDB (graph database, Redis protocol)
- OpenRouter via the `openai` SDK
- python-dotenv

## Project structure

| File | Purpose |
| --- | --- |
| `app.py` | Core logic: FalkorDB connection, OpenRouter client, agent routing, graph retrieval (with a short-lived cache), answer generation |
| `api.py` | FastAPI app exposing `/`, `/api/health` and `/api/chat`, with CORS for local frontends |
| `web_app.py` | Streamlit UI: chat, CSV import, connection checks |
| `seed.py` | Imports all CSV datasets into the graph |
| `test_api.py` | Quick check that your OpenRouter key and model work |
| `IMPORT_ALL_DATASETS.md` | Notes on the dataset import |
| `*.csv` | Source datasets (employees, engagement survey, recruitment, training) |
| `requirements.txt` | Python dependencies |

## Prerequisites

- Python 3.10 or newer
- A running FalkorDB instance (for example with Docker):
  ```bash
  docker run -p 6379:6379 -it --rm falkordb/falkordb
  ```
- An [OpenRouter](https://openrouter.ai) API key

## Setup

```bash
# from the Backend folder
python -m venv .venv

# Windows (PowerShell)
.venv\Scripts\Activate.ps1
# macOS / Linux
source .venv/bin/activate

python -m pip install -r requirements.txt
```

### Environment variables

Create a `.env` file in this folder:

```env
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=nvidia/nemotron-3.5-lightning:free
OPENROUTER_SITE_URL=http://localhost:5173
FALKORDB_HOST=localhost
FALKORDB_PORT=6379
FALKORDB_GRAPH=company_brain
```

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `OPENROUTER_API_KEY` | Yes | — | OpenRouter API key |
| `OPENROUTER_MODEL` | No | `nvidia/nemotron-3.5-lightning:free` | Model used for answers |
| `OPENROUTER_SITE_URL` | No | `http://localhost:5173` | Sent as the `HTTP-Referer` header |
| `FALKORDB_HOST` | No | `localhost` | FalkorDB host |
| `FALKORDB_PORT` | No | `6379` | FalkorDB port |
| `FALKORDB_GRAPH` | No | `company_brain` | Graph name |
| `GRAPH_CACHE_TTL` | No | `60` | Seconds to cache the graph snapshot (minimum 10) |

> **Never commit or upload `.env`.** It is already listed in `.gitignore`.

## Load the data

Make sure `seed.py` and the CSV files are in the same folder as `app.py` and `.env`, then run:

```bash
python seed.py
```

The importer:

- Imports every CSV row as a `DatasetRow` node with its source filename and row ID.
- Creates typed `Employee`, `Project`, `EngagementSurvey`, `Applicant` and `Training` nodes.
- Creates relationships for employee–project assignments, managers, surveys and training where matching IDs exist.
- Uses stable `MERGE` keys, so re-running updates rows instead of duplicating them.
- Does not guess applicant-to-employee matches; applicants stay separate unless the data links them.

## Run

### REST API (for the React frontend)

```bash
uvicorn api:api --reload --port 5000
```

The frontend defaults to `http://127.0.0.1:5000`. If you use another port, set `VITE_API_BASE_URL` in the frontend to match. Interactive docs are at `/docs`.

### Streamlit app

```bash
streamlit run web_app.py
```

### Check your OpenRouter setup

```bash
python test_api.py
```

## API reference

### `GET /`
Returns service name and status.

### `GET /api/health`
Checks the FalkorDB connection and returns node and relationship counts, the model, graph name and response time. Responds with `503` if the database is unreachable.

### `POST /api/chat`

Request:

```json
{ "question": "Who works on Payment Service?" }
```

`question` must be 1–4000 characters.

Response:

```json
{
  "answer": "…",
  "agent": "Projects",
  "sources": [],
  "evidence": []
}
```

`sources` and `evidence` contain the graph records used for the answer.

## Specialist agents

Questions are routed by keyword match; if nothing matches, the **Company Generalist** answers.

- People & Teams
- Projects
- Issues & Telecom
- Documents
- Decisions

## CORS

`api.py` allows `localhost` and `127.0.0.1` on ports `3000`, `5173`, `5174` and `5175`. Add your deployed frontend origin to `allow_origins` in `api.py` before deploying.

## Troubleshooting

- **`OPENROUTER_API_KEY is missing`** — add it to `.env` and restart.
- **`Database connection failed`** — check that FalkorDB is running and `FALKORDB_HOST` / `FALKORDB_PORT` are correct.
- **Frontend cannot reach the API** — confirm the port matches `VITE_API_BASE_URL` and that the origin is listed in CORS.
- **Empty or poor answers** — run `python seed.py` to make sure the graph has data.
