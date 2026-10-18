# Company Brain — Frontend

React dashboard for **Company Brain**, an AI assistant that answers questions about a company's people, projects, documents and policies using a knowledge graph. It talks to the Company Brain FastAPI backend for answers and optionally uses Supabase to store chat history.

## Tech stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- React Router 7
- Recharts
- Lucide React (icons)
- Supabase (optional, for chat history)

## Features

- Chat with the Company Brain, with agent routing and source citations
- Chat history stored in Supabase, or in browser local storage when Supabase is not configured
- Voice search and a command palette
- Light / dark theme
- Dashboard with charts, plus pages for:

| Route | Page |
| --- | --- |
| `/` | Dashboard |
| `/activity` | Activity |
| `/chat` | Chat |
| `/agents` | Agents |
| `/agent-runs` | Agent runs |
| `/prompts` | Prompts |
| `/knowledge` | Knowledge explorer |
| `/documents` | Documents |
| `/employees` | Employees |
| `/departments` | Departments |
| `/projects` | Projects |
| `/policies` | Policies |
| `/search` | Search |
| `/insights` | Insights |
| `/gaps` | Knowledge gaps |
| `/reports` | Reports |
| `/integrations` | Integrations |
| `/users` | Users |
| `/access` | Access control |
| `/audit` | Audit log |
| `/settings` | Settings |

## Prerequisites

- Node.js 18 or newer and npm
- The Company Brain **Backend** running (see the Backend README)

## Setup

```bash
npm install
```

Create `.env.local` in this folder:

```env
VITE_API_BASE_URL=http://127.0.0.1:5000

# Optional — chat history in Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | No | `http://127.0.0.1:5000` | URL of the FastAPI backend |
| `VITE_SUPABASE_URL` | No | — | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | No | — | Supabase anon key |

If the Supabase variables are missing, the app falls back to browser local storage for chat history.

> Keep `.env.local` out of version control.

## Run

Start the backend first, for example:

```bash
uvicorn api:api --reload --port 5000
```

Then start the frontend:

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check with TypeScript |

## Supabase (optional)

To store chat history in Supabase, run the migration in `supabase/migrations/` (`create_chat_history.sql`) on your project. It creates:

- `conversations` — chat sessions (title, agent, timestamps)
- `messages` — messages with role, content, sources (JSON), status and feedback

Row Level Security is enabled, but the current policies allow anonymous read and write access, so data is shared across the workspace. Tighten these policies and add authentication before using real company data in production.

## Project structure

```
src/
├── components/
│   ├── charts/        # Recharts wrappers
│   ├── layout/        # AppLayout, Sidebar, TopBar, CommandPalette, PageHeader
│   └── ui/            # Logo, Modal, Toast, shared UI
├── context/           # ThemeContext
├── data/              # Mock data and CSV datasets
├── hooks/             # useChatHistory, useVoiceSearch
├── lib/               # companyBrainApi, supabase client, utils
├── pages/             # One component per route
├── App.tsx            # Routes
└── main.tsx
supabase/migrations/   # SQL for chat history
```

The `@/` import alias maps to `src/`.

## How it talks to the backend

`src/lib/companyBrainApi.ts` calls:

- `POST /api/chat` with `{ "question": "..." }` and shows the `answer`, `agent` and `evidence` as source citations.
- `GET /api/health` to check the backend and database status.

If the app cannot reach the backend, check that it is running and that `VITE_API_BASE_URL` has the correct port. The backend must also allow your frontend origin in its CORS settings.

## Build for production

```bash
npm run build
```

The output goes to `dist/`. Set `VITE_API_BASE_URL` to your deployed backend URL before building.
