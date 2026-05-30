import json
import os
from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

SUMMARY_SYSTEM_PROMPT = """You are an expert meeting analyst. Given a meeting transcript, produce a structured JSON summary with these exact keys:
{
  "overview": "2-3 sentence meeting summary",
  "key_decisions": ["decision 1", "decision 2"],
  "action_items": [
    {"task": "Task description", "owner": "Person name or 'Unassigned'", "due_date": "YYYY-MM-DD or null"}
  ],
  "next_steps": ["next step 1", "next step 2"]
}
Return ONLY valid JSON, no markdown fences, no extra text."""


async def transcribe_audio(file_path: str) -> str:
    """Transcribe audio using OpenAI Whisper API."""
    with open(file_path, "rb") as audio_file:
        response = await client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="text",
        )
    return response


async def summarize_transcript(transcript: str, meeting_title: str = "") -> dict:
    """Use GPT-4o to extract structured summary from transcript."""
    user_prompt = f"Meeting title: {meeting_title}\n\nTranscript:\n{transcript}"

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SUMMARY_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.2,
        max_tokens=1500,
    )

    raw = response.choices[0].message.content
    return json.loads(raw)


async def process_meeting_audio(file_path: str, meeting_title: str = "") -> dict:
    """Full pipeline: audio → transcript → summary."""
    transcript = await transcribe_audio(file_path)
    summary = await summarize_transcript(transcript, meeting_title)
    return {"transcript": transcript, "summary": summary}
