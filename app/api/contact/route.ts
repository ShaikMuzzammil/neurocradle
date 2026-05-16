// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = process.env.CONTACT_EMAIL ?? 'muzzammil160806@gmail.com'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, subject, category, message, priority } = body
    if (!name || !email || !message)
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

    const priorityColor: Record<string, string> = {
      Urgent: '#FF4444', High: '#FFE500', Medium: '#00F5FF', Low: '#00FF88',
    }
    const pColor = priorityColor[priority] ?? '#00F5FF'
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' })

    // ── 1. Send detailed card email to admin (muzzammil160806@gmail.com)
    await resend.emails.send({
      from: 'NeuroCradle <onboarding@resend.dev>',
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `[NeuroCradle] [${priority}] ${category}: ${subject || 'New Contact Submission'}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050A1A;font-family:'Courier New',monospace;color:#e0e8ff">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px">
    <!-- Header -->
    <div style="text-align:center;padding:32px;background:rgba(0,245,255,0.05);border:1px solid rgba(0,245,255,0.2);border-radius:16px;margin-bottom:24px">
      <h1 style="margin:0;font-size:28px;color:#00F5FF;text-shadow:0 0 20px rgba(0,245,255,0.5);letter-spacing:4px">NEURO<span style="color:#FF00FF">CRADLE</span></h1>
      <p style="margin:8px 0 0;color:rgba(224,232,255,0.5);font-size:12px;letter-spacing:2px">MISSION CONTROL — NEW MESSAGE</p>
    </div>

    <!-- Priority Badge -->
    <div style="text-align:center;margin-bottom:24px">
      <span style="display:inline-block;padding:6px 20px;border-radius:999px;background:${pColor}22;border:1px solid ${pColor}55;color:${pColor};font-size:11px;letter-spacing:3px;font-weight:bold">${priority.toUpperCase()} PRIORITY</span>
    </div>

    <!-- Sender Card -->
    <div style="background:rgba(7,13,34,0.9);border:1px solid rgba(0,245,255,0.15);border-radius:12px;padding:24px;margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
        <div style="width:48px;height:48px;border-radius:50%;background:rgba(0,245,255,0.1);border:2px solid rgba(0,245,255,0.3);display:flex;align-items:center;justify-content:center;font-size:20px;color:#00F5FF;font-weight:bold;text-align:center;line-height:48px">${name[0].toUpperCase()}</div>
        <div>
          <div style="font-size:16px;font-weight:bold;color:#fff;margin-bottom:2px">${name}</div>
          <div style="font-size:12px;color:#00F5FF">${email}</div>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:rgba(224,232,255,0.45);font-size:11px;text-transform:uppercase;letter-spacing:1px;width:120px">Category</td><td style="padding:8px 0;color:#e0e8ff;font-size:13px">${category}</td></tr>
        <tr><td style="padding:8px 0;color:rgba(224,232,255,0.45);font-size:11px;text-transform:uppercase;letter-spacing:1px">Subject</td><td style="padding:8px 0;color:#e0e8ff;font-size:13px">${subject || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:rgba(224,232,255,0.45);font-size:11px;text-transform:uppercase;letter-spacing:1px">Priority</td><td style="padding:8px 0"><span style="color:${pColor};font-weight:bold">${priority}</span></td></tr>
        <tr><td style="padding:8px 0;color:rgba(224,232,255,0.45);font-size:11px;text-transform:uppercase;letter-spacing:1px">Received</td><td style="padding:8px 0;color:rgba(224,232,255,0.6);font-size:12px">${now}</td></tr>
      </table>
    </div>

    <!-- Message Body -->
    <div style="background:rgba(7,13,34,0.9);border:1px solid rgba(255,0,255,0.15);border-left:3px solid #FF00FF;border-radius:12px;padding:24px;margin-bottom:24px">
      <div style="color:rgba(224,232,255,0.45);font-size:11px;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px">Message</div>
      <div style="color:#e0e8ff;font-size:14px;line-height:1.7;white-space:pre-wrap">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>

    <!-- Reply CTA -->
    <div style="text-align:center">
      <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'Your NeuroCradle message')}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#00F5FF,#FF00FF);color:#050A1A;font-weight:bold;text-decoration:none;border-radius:8px;font-size:13px;letter-spacing:1px">↩ Reply to ${name}</a>
    </div>

    <p style="text-align:center;color:rgba(224,232,255,0.2);font-size:11px;margin-top:32px">NeuroCradle Mission Control · This email was sent automatically</p>
  </div>
</body>
</html>`,
    })

    // ── 2. Send auto-reply / confirmation to the user
    await resend.emails.send({
      from: 'NeuroCradle <onboarding@resend.dev>',
      to: email,
      subject: 'Message Received — NeuroCradle Mission Control',
      html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#050A1A;font-family:'Courier New',monospace;color:#e0e8ff">
  <div style="max-width:540px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;padding:32px;background:rgba(0,245,255,0.05);border:1px solid rgba(0,245,255,0.2);border-radius:16px;margin-bottom:24px">
      <h1 style="margin:0;font-size:24px;color:#00F5FF;letter-spacing:4px">NEURO<span style="color:#FF00FF">CRADLE</span></h1>
    </div>
    <div style="background:rgba(7,13,34,0.9);border:1px solid rgba(0,255,136,0.2);border-radius:12px;padding:28px;text-align:center;margin-bottom:20px">
      <div style="font-size:40px;margin-bottom:12px">✓</div>
      <h2 style="color:#00FF88;margin:0 0 8px;font-size:20px">Message Received!</h2>
      <p style="color:rgba(224,232,255,0.6);margin:0;font-size:14px">Hi <strong style="color:#fff">${name}</strong>, we received your message and will get back to you within <strong style="color:#00F5FF">24 hours</strong>.</p>
    </div>
    <div style="background:rgba(7,13,34,0.9);border:1px solid rgba(0,245,255,0.1);border-radius:10px;padding:20px;margin-bottom:20px">
      <div style="color:rgba(224,232,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Your Submission Summary</div>
      <div style="color:rgba(224,232,255,0.6);font-size:12px"><span style="color:rgba(224,232,255,0.4)">Category:</span> ${category}</div>
      <div style="color:rgba(224,232,255,0.6);font-size:12px;margin-top:4px"><span style="color:rgba(224,232,255,0.4)">Priority:</span> <span style="color:#00F5FF">${priority}</span></div>
      ${subject ? `<div style="color:rgba(224,232,255,0.6);font-size:12px;margin-top:4px"><span style="color:rgba(224,232,255,0.4)">Subject:</span> ${subject}</div>` : ''}
    </div>
    <p style="text-align:center;color:rgba(224,232,255,0.2);font-size:11px">— NeuroCradle Team<br>Do not reply directly to this email. We will reach you at ${email}</p>
  </div>
</body>
</html>`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Contact API Error]', err)
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}