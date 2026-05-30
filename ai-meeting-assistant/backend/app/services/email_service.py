from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, HtmlContent
from app.core.config import settings
from typing import List


def build_email_html(meeting_title: str, summary: dict) -> str:
    action_rows = "".join(
        f"<tr><td style='padding:8px 12px;border-bottom:1px solid #f0f0f0'>{a['task']}</td>"
        f"<td style='padding:8px 12px;border-bottom:1px solid #f0f0f0'>{a.get('owner','Unassigned')}</td>"
        f"<td style='padding:8px 12px;border-bottom:1px solid #f0f0f0'>{a.get('due_date') or '—'}</td></tr>"
        for a in summary.get("action_items", [])
    )
    decisions_li = "".join(f"<li style='margin-bottom:6px'>{d}</li>" for d in summary.get("key_decisions", []))
    next_steps_li = "".join(f"<li style='margin-bottom:6px'>{s}</li>" for s in summary.get("next_steps", []))

    return f"""
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#fff">
      <div style="background:#1a1a2e;padding:28px 32px;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;font-size:20px;margin:0">📋 Meeting Summary</h1>
        <p style="color:#9ca3af;margin:4px 0 0;font-size:14px">{meeting_title}</p>
      </div>
      <div style="padding:28px 32px;background:#fafafa;border:1px solid #e5e7eb;border-top:none">
        <h2 style="font-size:15px;color:#374151;margin:0 0 8px">Overview</h2>
        <p style="color:#6b7280;line-height:1.6;margin:0 0 24px">{summary.get('overview','')}</p>

        <h2 style="font-size:15px;color:#374151;margin:0 0 8px">Key Decisions</h2>
        <ul style="color:#6b7280;padding-left:20px;margin:0 0 24px">{decisions_li}</ul>

        <h2 style="font-size:15px;color:#374151;margin:0 0 12px">Action Items</h2>
        <table style="width:100%;border-collapse:collapse;font-size:13px;background:#fff;border-radius:6px;overflow:hidden;border:1px solid #e5e7eb">
          <thead>
            <tr style="background:#f3f4f6">
              <th style="padding:10px 12px;text-align:left;color:#374151">Task</th>
              <th style="padding:10px 12px;text-align:left;color:#374151">Owner</th>
              <th style="padding:10px 12px;text-align:left;color:#374151">Due Date</th>
            </tr>
          </thead>
          <tbody>{action_rows}</tbody>
        </table>

        <h2 style="font-size:15px;color:#374151;margin:24px 0 8px">Next Steps</h2>
        <ul style="color:#6b7280;padding-left:20px;margin:0">{next_steps_li}</ul>
      </div>
      <div style="padding:16px 32px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;text-align:center">
        <p style="font-size:12px;color:#9ca3af;margin:0">Sent by AI Meeting Assistant</p>
      </div>
    </div>
    """


def send_meeting_summary_email(
    to_emails: List[str],
    meeting_title: str,
    summary: dict,
) -> bool:
    """Send meeting summary email via SendGrid."""
    html_content = build_email_html(meeting_title, summary)
    message = Mail(
        from_email=settings.FROM_EMAIL,
        to_emails=to_emails,
        subject=f"Meeting Summary: {meeting_title}",
        html_content=HtmlContent(html_content),
    )
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        return response.status_code in (200, 202)
    except Exception as e:
        print(f"Email send error: {e}")
        return False
