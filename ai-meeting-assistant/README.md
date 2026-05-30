# AI Meeting Assistant

Record meetings → Whisper transcribes → GPT-4 summarizes → Email sent automatically.

## Tech Stack
- **Backend**: Python, FastAPI, PostgreSQL, OpenAI (Whisper + GPT-4), SendGrid
- **Frontend**: React, Vite, TailwindCSS, Zustand

## Quick Start
See the full installation guide in the interactive widget.

## Project Structure
```
ai-meeting-assistant/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── api/             # Routes: auth, meetings, recordings, summaries
│       ├── core/            # Config, database
│       ├── models/          # SQLAlchemy models
│       └── services/        # AI (Whisper+GPT4), Email (SendGrid)
└── frontend/
    ├── src/
    │   ├── pages/           # Dashboard, MeetingDetail, Login, Register
    │   ├── components/      # Layout
    │   └── hooks/           # Auth store (Zustand)
    └── package.json
```
