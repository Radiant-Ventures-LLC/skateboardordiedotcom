import { voice } from "skateaf";

// Sign-in emails. Same look as the welcome note: paper card, flag stripe,
// one loud button, the plain link underneath for clients that block buttons.

const SITE = "https://skateboardordie.com";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function layout(o: {
  badge: string;
  heading: string;
  paragraphs: string[];
  cta: { label: string; url: string };
  footer: string;
}) {
  const ps = o.paragraphs
    .map((p) => `<p style="margin:16px 0 0;font-size:16px;line-height:1.5">${esc(p)}</p>`)
    .join("\n");
  return `<!doctype html>
<html><body style="margin:0;background:#F4EFE3;font-family:Inter,Arial,sans-serif;color:#0B0B0B">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4EFE3"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#F4EFE3;border:3px solid #0B0B0B">
<tr><td style="background:#E01B1B;height:12px;font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:28px 28px 8px">
<span style="display:inline-block;background:#F2C230;border:2px solid #0B0B0B;padding:4px 10px;font-family:'Courier New',monospace;font-size:12px;font-weight:bold;text-transform:uppercase">${esc(o.badge)}</span>
<h1 style="margin:18px 0 0;font-family:'Arial Black',Impact,sans-serif;font-size:30px;line-height:1.05;text-transform:uppercase">${esc(o.heading)}</h1>
${ps}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px"><tr><td style="background:#E01B1B;border:2px solid #0B0B0B">
<a href="${esc(o.cta.url)}" style="display:inline-block;padding:12px 22px;color:#F4EFE3;font-family:'Arial Black',Impact,sans-serif;font-size:15px;text-transform:uppercase;text-decoration:none">${esc(o.cta.label)}</a>
</td></tr></table>
<p style="margin:10px 0 0;font-family:'Courier New',monospace;font-size:12px;word-break:break-all">${esc(o.cta.url)}</p>
</td></tr>
<tr><td style="padding:20px 28px 24px;font-family:'Courier New',monospace;font-size:12px;text-transform:uppercase;letter-spacing:1px">${esc(voice.creed)}</td></tr>
<tr><td style="background:#0B0B0B;padding:14px 28px;color:#F4EFE3;font-size:12px;line-height:1.5">${esc(o.footer)}</td></tr>
</table></td></tr></table>
</body></html>`;
}

function text(o: { heading: string; paragraphs: string[]; cta: { url: string }; footer: string }) {
  return [o.heading, "", ...o.paragraphs.flatMap((p) => [p, ""]), o.cta.url, "", voice.creed, "", o.footer].join(
    "\n",
  );
}

/** One-time sign-in link for an invited or existing skater. */
export function signInEmail(url: string) {
  const o = {
    badge: "Sign in",
    heading: "Roll in.",
    paragraphs: [
      "Tap the button to sign in to skateboardordie.com. The link works once and runs out in 15 minutes.",
      "Once you're in, add a passkey and next time it's one tap. No email needed.",
    ],
    cta: { label: "Sign me in", url },
    footer:
      "Didn't ask for this? Ignore it. Nobody gets in without this link, and it expires on its own.",
  };
  return { subject: "Your sign-in link for skateboardordie.com", html: layout(o), text: text(o) };
}

/** Someone asked to sign in with an address that has no pass yet. */
export function noPassEmail(onList: boolean) {
  const o = onList
    ? {
        badge: "On the list",
        heading: "Your wave hasn't rolled yet.",
        paragraphs: [
          "You're on the list, and Paradise is opening in waves. When your wave rolls you'll get your pass, and signing in from this address will work.",
        ],
        cta: { label: "Bring your crew", url: `${SITE}/early-access?ref=signin` },
      }
    : {
        badge: "No pass yet",
        heading: "This address doesn't have a pass yet.",
        paragraphs: [
          "Paradise is opening in waves, and new accounts need a pass. Request one and you're in line for the next wave.",
        ],
        cta: { label: "Request a pass", url: `${SITE}/early-access?ref=signin` },
      };
  const full = {
    ...o,
    footer:
      "Someone tried to sign in to skateboardordie.com with this address. If that wasn't you, ignore it and nothing happens.",
  };
  return {
    subject: onList ? "Your wave hasn't rolled yet" : "No pass on this address yet",
    html: layout(full),
    text: text(full),
  };
}
