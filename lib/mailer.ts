import nodemailer from "nodemailer";

if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
  throw new Error("GMAIL_USER and GMAIL_PASS must be set in .env.local");
}

export const transporter = nodemailer.createTransport({
  host:   "smtp.gmail.com",
  port:   465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const FROM = `"${process.env.EMAIL_FROM_NAME ?? "AUREX"}" <${process.env.EMAIL_FROM_ADDRESS ?? process.env.GMAIL_USER}>`;
const BCC  = process.env.EMAIL_BCC || undefined;

async function send(opts: { to: string; subject: string; html: string; text: string }) {
  return transporter.sendMail({
    from:    FROM,
    to:      opts.to,
    bcc:     BCC,
    subject: opts.subject,
    text:    opts.text,
    html:    opts.html,
  });
}

// ── Send 5-digit OTP ───────────────────────────────────────────────────────

export async function sendVerificationEmail(opts: {
  to: string;
  firstName: string;
  otp: string;
}) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Your AUREX verification code</title></head>
<body style="margin:0;padding:0;background:#080a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f0ede8;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080a0f;padding:48px 16px;">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
  <tr><td style="padding-bottom:40px;text-align:center;">
    <span style="font-size:20px;font-weight:700;letter-spacing:0.25em;color:#f0ede8;text-transform:uppercase;">AUREX</span>
  </td></tr>
  <tr><td style="background:#0e1118;border:1px solid rgba(37,45,61,0.6);border-radius:6px;padding:48px 40px;">
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;letter-spacing:-0.02em;color:#f0ede8;">Your verification code</h1>
    <p style="margin:0 0 36px;font-size:15px;color:#6b7a8d;line-height:1.6;">
      Hi ${opts.firstName}, enter this 5-digit code to verify your AUREX account.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 36px;">
      <tr>
        <td style="background:rgba(16,212,142,0.07);border:1px solid rgba(16,212,142,0.25);border-radius:6px;padding:20px 48px;text-align:center;">
          <span style="font-size:44px;font-weight:800;letter-spacing:0.4em;color:#10d48e;font-family:monospace;">${opts.otp}</span>
        </td>
      </tr>
    </table>
    <hr style="border:none;border-top:1px solid rgba(37,45,61,0.5);margin:0 0 24px;"/>
    <p style="margin:0;font-size:12px;color:#4a5568;line-height:1.7;">
      Expires in <strong style="color:#9fa8b4;">15 minutes</strong> &nbsp;·&nbsp;
      <strong style="color:#9fa8b4;">5 attempts</strong> maximum.<br/>
      If you didn't create an AUREX account, ignore this email.
    </p>
  </td></tr>
  <tr><td style="padding:28px 0 0;text-align:center;">
    <p style="margin:0;font-size:11px;color:rgba(74,85,104,0.6);line-height:1.8;">
      AUREX Capital Markets Ltd &nbsp;·&nbsp; FCA Regulated &nbsp;·&nbsp; SOC 2 Type II
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const text = `Hi ${opts.firstName},\n\nYour AUREX verification code is: ${opts.otp}\n\nExpires in 15 minutes. 5 attempts maximum.\n\nAUREX Capital Markets Ltd`;

  return send({ to: opts.to, subject: `${opts.otp} — Your AUREX verification code`, html, text });
}

// ── Password reset OTP ────────────────────────────────────────────────────

export async function sendPasswordResetEmail(opts: {
  to: string;
  firstName: string;
  otp: string;
}) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Reset your AUREX password</title></head>
<body style="margin:0;padding:0;background:#080a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f0ede8;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080a0f;padding:48px 16px;">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
  <tr><td style="padding-bottom:40px;text-align:center;">
    <span style="font-size:20px;font-weight:700;letter-spacing:0.25em;color:#f0ede8;text-transform:uppercase;">AUREX</span>
  </td></tr>
  <tr><td style="background:#0e1118;border:1px solid rgba(37,45,61,0.6);border-radius:6px;padding:48px 40px;">
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#f0ede8;">Reset your password</h1>
    <p style="margin:0 0 32px;font-size:15px;color:#6b7a8d;line-height:1.6;">
      Hi ${opts.firstName}, use this code to reset your AUREX password. If you didn't request this, ignore this email — your password won't change.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
      <tr>
        <td style="background:rgba(201,168,76,0.07);border:1px solid rgba(201,168,76,0.25);border-radius:6px;padding:18px 48px;text-align:center;">
          <span style="font-size:44px;font-weight:800;letter-spacing:0.4em;color:#c9a84c;font-family:monospace;">${opts.otp}</span>
        </td>
      </tr>
    </table>
    <hr style="border:none;border-top:1px solid rgba(37,45,61,0.5);margin:0 0 24px;"/>
    <p style="margin:0;font-size:12px;color:#4a5568;line-height:1.7;">
      Expires in <strong style="color:#9fa8b4;">15 minutes</strong> &nbsp;·&nbsp; <strong style="color:#9fa8b4;">5 attempts</strong> maximum.
    </p>
  </td></tr>
  <tr><td style="padding:28px 0 0;text-align:center;">
    <p style="margin:0;font-size:11px;color:rgba(74,85,104,0.6);">AUREX Capital Markets Ltd &nbsp;·&nbsp; FCA Regulated</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  return send({
    to:      opts.to,
    subject: `${opts.otp} — Reset your AUREX password`,
    html,
    text: `Hi ${opts.firstName},\n\nYour AUREX password reset code is: ${opts.otp}\n\nExpires in 15 minutes.\n\nAUREX Capital Markets Ltd`,
  });
}

// ── Application confirmation ───────────────────────────────────────────────

export async function sendApplicationConfirmation(opts: {
  to: string;
  firstName: string;
  accountType: string;
}) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Application received</title></head>
<body style="margin:0;padding:0;background:#080a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f0ede8;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080a0f;padding:48px 16px;">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
  <tr><td style="padding-bottom:40px;text-align:center;">
    <span style="font-size:20px;font-weight:700;letter-spacing:0.25em;color:#f0ede8;text-transform:uppercase;">AUREX</span>
  </td></tr>
  <tr><td style="background:#0e1118;border:1px solid rgba(37,45,61,0.6);border-radius:6px;padding:48px 40px;">
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;letter-spacing:-0.02em;color:#f0ede8;">Application received.</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7a8d;line-height:1.6;">
      Hi ${opts.firstName}, we've received your <strong style="color:#f0ede8;">${opts.accountType}</strong> account application.
      Our team will review it within <strong style="color:#f0ede8;">24 hours</strong>.
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7a8d;line-height:1.6;">
      Please verify your email with the 5-digit code we sent in a separate email.
    </p>
    <hr style="border:none;border-top:1px solid rgba(37,45,61,0.5);margin:0 0 24px;"/>
    <p style="margin:0;font-size:12px;color:#4a5568;">
      Questions? <a href="mailto:onboarding@aurex.com" style="color:#10d48e;">onboarding@aurex.com</a>
    </p>
  </td></tr>
  <tr><td style="padding:28px 0 0;text-align:center;">
    <p style="margin:0;font-size:11px;color:rgba(74,85,104,0.6);line-height:1.8;">
      AUREX Capital Markets Ltd &nbsp;·&nbsp; FCA Regulated &nbsp;·&nbsp; SOC 2 Type II
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  return send({
    to:      opts.to,
    subject: "We've received your AUREX application",
    html,
    text:    `Hi ${opts.firstName}, your ${opts.accountType} account application has been received. We'll be in touch within 24 hours.`,
  });
}
