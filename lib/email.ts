import "server-only";

type Email = {
  to: string;
  subject: string;
  // Plain paragraphs; links are written out in full so they work in any client.
  lines: string[];
  action?: { label: string; url: string };
};

export function appUrl(path: string) {
  return new URL(path, process.env.APP_URL ?? "http://localhost:3000").toString();
}

function toText({ lines, action }: Email) {
  return [...lines, ...(action ? [`${action.label}: ${action.url}`] : [])].join("\n\n");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function toHtml({ lines, action }: Email) {
  const paragraphs = lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
  const button = action
    ? `<p><a href="${escapeHtml(action.url)}" style="display:inline-block;padding:10px 18px;border-radius:8px;background:#174A91;color:#fff;text-decoration:none;font-weight:600">${escapeHtml(action.label)}</a></p><p style="color:#526987;font-size:13px">Or open this link: ${escapeHtml(action.url)}</p>`
    : "";
  return `<div style="font-family:system-ui,sans-serif;color:#152C50;line-height:1.5">${paragraphs}${button}<p style="color:#526987;font-size:13px">Training &amp; Placement Office, Brainware University</p></div>`;
}

// Sends through Resend when RESEND_API_KEY is set; otherwise prints the email to the
// server console so every flow works in development without an email provider.
// Failures are logged, not thrown, so a mail outage never blocks the action that sent it.
export async function sendEmail(email: Email) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`\n[email] To: ${email.to}\n[email] Subject: ${email.subject}\n${toText(email)}\n`);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "Placement Cell <onboarding@resend.dev>",
        to: email.to,
        subject: email.subject,
        text: toText(email),
        html: toHtml(email),
      }),
    });
    if (!res.ok) console.error(`[email] Resend error ${res.status}: ${await res.text()}`);
  } catch (error) {
    console.error("[email] Failed to send", error);
  }
}
