# Financial Market Insight

Real-time trading dashboard for crypto, stocks and forex — Next.js 16 frontend + a Python **signal engine** for technical analysis.

## Architecture

```
openBB/
├── src/                      # Next.js 16 app (React 19, Tailwind v4)
│   ├── app/                  # App Router pages + route handlers
│   ├── components/           # UI (dashboard, layout, providers)
│   ├── lib/
│   │   ├── data/             # ccxt client, signal-engine client
│   │   ├── stores/           # zustand UI state
│   │   └── utils/            # formatters
│   └── types/                # shared TypeScript types
└── services/
    └── signal-engine/        # FastAPI TA service (Python)
```

## Getting started

### 1. Install frontend deps

```bash
npm install
cp .env.example .env.local
```

### 2. Start the signal engine (optional but recommended)

```bash
cd services/signal-engine
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Without it the dashboard still boots but the Signal Feed shows an "engine offline" empty state.

### 3. Start Next.js

```bash
npm run dev
```

Open <http://localhost:3000>.

## Scripts

| Command         | Purpose                                  |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Dev server (Turbopack, `.next/dev`)      |
| `npm run build` | Production build                         |
| `npm start`     | Serve production build                   |
| `npm run lint`  | ESLint (flat config)                     |

## Environment

| Var                          | Description                                  |
| ---------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_SIGNAL_API_URL` | Base URL of the FastAPI signal engine        |
