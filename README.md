# Company Brain AI — Integrated Frontend + Backend

This package connects the React/Vite frontend chat to the FastAPI backend, OpenRouter, and FalkorDB.

## Folder structure

- `Frontend/` — React + TypeScript + Vite UI
- `Backend/` — FastAPI API, graph retrieval, CSV importer, and datasets

## 1. Configure the backend

Open PowerShell in `Backend`:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `Backend/.env` and put your own `OPENROUTER_API_KEY` in it. Do not share or commit this file. Ensure FalkorDB is running at the configured host and port (default `localhost:6379`).

## 2. Import the CSV datasets

With FalkorDB running and the backend virtual environment active:

```powershell
python seed.py
```

The importer prints discovered CSV files, per-file row counts/failures, graph node counts, and relationship counts. Keep the CSV files beside `seed.py` (they are included in this package).

## 3. Start the backend API

In the `Backend` folder:

```powershell
python -m uvicorn api:api --reload --host 127.0.0.1 --port 5000
```

Verify:

- `http://127.0.0.1:5000/docs`
- `http://127.0.0.1:5000/api/health`

Health should report database connected and graph node/relationship counts.

## 4. Start the frontend

Open a second PowerShell in `Frontend`:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open the Vite URL printed in the terminal, normally `http://localhost:5173`.

The Chat page now calls the real `POST /api/chat` endpoint and displays returned graph evidence. It no longer returns the old simulated demo answers. If Supabase keys are not configured, conversation history uses browser local storage; add both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` if you want Supabase persistence.

## Notes

- The backend graph retrieval no longer stops at the first 1,500 nodes or 2,500 relationships; that old cap could hide imported records such as `Maruk Fraval` and `Prater Jeremy`.
- Dashboard pages other than Chat still use the frontend's existing demo/mock datasets unless separately connected to API endpoints.
- The backend `.env` with API credentials is intentionally not included. Create it from `.env.example` and supply your own key.
