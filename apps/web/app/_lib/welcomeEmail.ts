import { voice } from "skateaf";

// Sent once, right after a *new* waitlist signup. Transactional only: one note
// to confirm the pass request and hand them a share link for their crew.

export const SENDER = {
  email: "crew@mailer.skateboardordie.com",
  name: "skateboardordie.com",
};

const SITE = "https://skateboardordie.com";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function welcomeEmail(opts: { handle: string | null; refCode: string }) {
  const shareUrl = `${SITE}/early-access?ref=${encodeURIComponent(opts.refCode)}`;
  const hello = opts.handle ? `You're on the list, ${opts.handle}.` : "You're on the list, bro.";
  const subject = "You're on the list — welcome to Paradise";

  const text = [
    hello,
    "",
    "Paradise is opening in waves, and you're in with the founding crew. When your wave rolls, you'll get one more note with your pass.",
    "",
    "What founding skaters get:",
    "* First pick of handles and home spots",
    "* A hand in the charter: you shape the commons",
    "* A founding-skater mark that never gets minted again",
    "",
    "Bring your crew. Everyone who joins through your link rolls in with you:",
    shareUrl,
    "",
    voice.creed,
    "",
    "You got this because you signed up at skateboardordie.com. If that wasn't you, ignore it and we won't write again.",
  ].join("\n");

  const html = `<!doctype html>
<html><body style="margin:0;background:#F4EFE3;font-family:Inter,Arial,sans-serif;color:#0B0B0B">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4EFE3"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#F4EFE3;border:3px solid #0B0B0B">
<tr><td style="background:#E01B1B;height:12px;font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:28px 28px 8px">
<span style="display:inline-block;background:#F2C230;border:2px solid #0B0B0B;padding:4px 10px;font-family:'Courier New',monospace;font-size:12px;font-weight:bold;text-transform:uppercase">Founding skater</span>
<h1 style="margin:18px 0 0;font-family:'Arial Black',Impact,sans-serif;font-size:30px;line-height:1.05;text-transform:uppercase">${esc(hello)}</h1>
<p style="margin:16px 0 0;font-size:16px;line-height:1.5">Paradise is opening in waves, and you're in with the founding crew. When your wave rolls, you'll get one more note with your pass.</p>
<ul style="margin:16px 0 0;padding-left:20px;font-size:15px;line-height:1.6">
<li>First pick of handles and home spots</li>
<li>A hand in the charter: you shape the commons</li>
<li>A founding-skater mark that never gets minted again</li>
</ul>
<p style="margin:22px 0 10px;font-size:16px;line-height:1.5"><strong>Bring your crew.</strong> Everyone who joins through your link rolls in with you:</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#E01B1B;border:2px solid #0B0B0B">
<a href="${esc(shareUrl)}" style="display:inline-block;padding:12px 22px;color:#F4EFE3;font-family:'Arial Black',Impact,sans-serif;font-size:15px;text-transform:uppercase;text-decoration:none">Share your link</a>
</td></tr></table>
<p style="margin:10px 0 0;font-family:'Courier New',monospace;font-size:12px;word-break:break-all">${esc(shareUrl)}</p>
</td></tr>
<tr><td style="padding:20px 28px 24px;font-family:'Courier New',monospace;font-size:12px;text-transform:uppercase;letter-spacing:1px">${esc(voice.creed)}</td></tr>
<tr><td style="background:#0B0B0B;padding:14px 28px;color:#F4EFE3;font-size:12px;line-height:1.5">You got this because you signed up at skateboardordie.com. If that wasn't you, ignore it and we won't write again.</td></tr>
</table></td></tr></table>
</body></html>`;

  return { subject, text, html };
}
