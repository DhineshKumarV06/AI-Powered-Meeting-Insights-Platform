# AI Powered Meeting Insights Platform

## Overview

An AI-powered full-stack application that automatically transcribes meeting recordings, generates concise summaries, extracts key insights, and enables email-based sharing of meeting outcomes.

The platform combines speech-to-text technology with Large Language Models (LLMs) to streamline meeting documentation and collaboration.

## Features

* User authentication and authorization
* Meeting creation and management
* Audio recording upload
* Automatic speech-to-text transcription
* AI-generated meeting summaries
* Key action item extraction
* Email summary sharing
* Real-time status tracking
* Dashboard-based meeting management

## Tech Stack

### Backend

* Python
* FastAPI
* SQLAlchemy
* PostgreSQL
* JWT Authentication

### AI Services

* OpenAI Whisper
* GPT-4o

### Frontend

* React.js
* Vite
* Zustand

### Email Service

* SendGrid

## System Architecture

User Upload
→ Audio Processing
→ Whisper Transcription
→ GPT Summary Generation
→ Database Storage
→ Dashboard Display
→ Email Distribution

## Installation

### Backend

```bash
cd backend

pip install -r requirements.txt

uvicorn main:app --reload
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

## Environment Variables

Create a `.env` file:

```env
DATABASE_URL=
OPENAI_API_KEY=
SENDGRID_API_KEY=
JWT_SECRET=
```

## Key Modules

* Authentication Service
* Meeting Management API
* Recording Upload Service
* AI Summarization Engine
* Email Notification Service
* React Dashboard

## Future Enhancements

* Multi-language transcription
* Speaker identification
* Meeting analytics dashboard
* Calendar integrations
* Teams/Zoom integrations
* Real-time transcription

## Author

Developed as an AI-Powered Productivity and Collaboration Platform.
