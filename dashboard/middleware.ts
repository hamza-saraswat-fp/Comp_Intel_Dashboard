// Preview gate (IAI-244). Runs at the Vercel edge, before any file is served, so the
// static SPA's JS bundle (which carries all the competitive data) stays behind the
// password. A client-side password screen would protect nothing here: by the time
// React runs, the bundle has already shipped. So the gate has to live at the edge.
//
// Instead of the browser's built-in Basic-Auth dialog, we serve a branded sign-in page
// styled to match the dashboard, and remember the session in a cookie. The gate still
// fails closed: if it isn't configured, nothing is served.
//
// Set BASIC_AUTH_USER and BASIC_AUTH_PASSWORD in the Vercel project's Environment
// Variables (Production + Preview). Same credentials as before; only the login UI changed.

import { next } from '@vercel/edge';

// Gate every path, including the hashed /assets/*.js bundle that holds the data.
export const config = { matcher: '/:path*' };

const COOKIE = 'ci_gate';
const LOGIN_PATH = '/__gate'; // where the sign-in form posts
const MAX_AGE = 60 * 60 * 24 * 7; // keep the session for 7 days
// The brand mark on the sign-in page is the only asset served before sign-in. It's a
// public logo, not data, so letting it through the gate is safe.
const PUBLIC_ASSETS = new Set(['/fp-icon.svg']);

// A one-way session token derived from the credentials, so the cookie never carries the
// raw password. Forging it still requires knowing the username and password.
async function sessionToken(user: string, pass: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${user}:${pass}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

function loginPage(error?: string): Response {
  return new Response(renderLogin(error), {
    // 200 so the branded page renders cleanly; no WWW-Authenticate header, which is
    // what stops the browser from showing its native prompt.
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export default async function middleware(req: Request): Promise<Response> {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASSWORD;
  // Fail closed: if the gate isn't configured, don't serve the site open.
  if (!user || !pass) {
    return new Response('The preview gate is not configured.', {
      status: 503,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  const url = new URL(req.url);
  const expected = await sessionToken(user, pass);

  // Sign-in form submission.
  if (req.method === 'POST' && url.pathname === LOGIN_PATH) {
    const form = await req.formData();
    const u = String(form.get('username') ?? '');
    const p = String(form.get('password') ?? '');
    if (u === user && p === pass) {
      return new Response(null, {
        status: 303,
        headers: {
          location: '/',
          'set-cookie': `${COOKIE}=${expected}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        },
      });
    }
    return loginPage('That username or password did not match. Try again.');
  }

  // Already signed in via the branded cookie, or arriving with valid Basic-Auth
  // credentials (e.g. a saved user:pass@host bookmark). Either one lets the request through.
  if (readCookie(req.headers.get('cookie'), COOKIE) === expected) return next();

  const authz = req.headers.get('authorization');
  if (authz?.startsWith('Basic ')) {
    const [bu, ...brest] = atob(authz.slice(6)).split(':');
    if (bu === user && brest.join(':') === pass) return next();
  }

  // Serve the un-gated brand mark so the sign-in page can show the logo.
  if (PUBLIC_ASSETS.has(url.pathname)) return next();

  // Not signed in: show the branded page instead of the browser's native prompt.
  return loginPage();
}

function renderLogin(error?: string): string {
  const alert = error ? `<div class="alert" role="alert">${error}</div>` : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="icon" type="image/svg+xml" href="/fp-icon.svg" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<title>Sign in · Competitor Intel</title>
<style>
  :root {
    --bg: #fbfbfd; --ink: #161a2c; --navy: #00034d; --cobalt: #253e9a;
    --muted: #6a7183; --border: #eaecf2; --ring: #3f63c4; --card: #ffffff;
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    margin: 0; background: var(--bg); color: var(--ink);
    font-family: "Montserrat", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    font-feature-settings: "tnum" 1, "lnum" 1;
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh; padding: 24px; -webkit-font-smoothing: antialiased;
  }
  .card {
    width: 100%; max-width: 372px; background: var(--card);
    border: 1px solid var(--border); border-radius: 14px; padding: 30px 30px 28px;
    box-shadow: 0 1px 2px rgba(0,3,77,.04), 0 22px 48px -24px rgba(0,3,77,.18);
  }
  .brand { display: flex; align-items: center; gap: 11px; margin-bottom: 26px; }
  .mark { width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--border); display: block; }
  .brand-title { font-size: 14.5px; font-weight: 700; letter-spacing: -0.01em; line-height: 1.1; }
  .brand-tag { font-size: 11px; font-weight: 500; color: var(--muted); margin-top: 2px; }
  h1 { font-size: 19px; font-weight: 700; color: var(--navy); letter-spacing: -0.01em; margin: 0 0 5px; }
  .sub { font-size: 12.5px; font-weight: 500; color: var(--muted); margin: 0 0 22px; line-height: 1.5; }
  .alert { font-size: 12px; font-weight: 500; color: #8f2f27; background: #fbeae8; border: 1px solid #f2ccc8; border-radius: 9px; padding: 9px 12px; margin: 0 0 16px; line-height: 1.45; }
  .field { margin-bottom: 14px; }
  .field label { display: block; font-size: 11.5px; font-weight: 600; color: var(--ink); margin-bottom: 6px; }
  .field input {
    width: 100%; height: 40px; padding: 0 12px; font-family: inherit; font-size: 13px; font-weight: 500;
    color: var(--ink); background: #fff; border: 1px solid var(--border); border-radius: 9px;
    transition: border-color .15s, box-shadow .15s; outline: none;
  }
  .field input:focus { border-color: var(--ring); box-shadow: 0 0 0 3px rgba(63,99,196,.16); }
  .btn {
    width: 100%; height: 42px; margin-top: 8px; font-family: inherit; font-size: 13px; font-weight: 700;
    color: #fff; background: var(--cobalt); border: 0; border-radius: 9px; cursor: pointer;
    transition: background .15s, transform .05s;
  }
  .btn:hover { background: #1f3480; }
  .btn:active { transform: translateY(1px); }
  .btn:focus-visible { box-shadow: 0 0 0 3px rgba(63,99,196,.35); outline: none; }
  .foot { text-align: center; font-size: 10.5px; font-weight: 500; color: var(--muted); margin: 18px 0 0; letter-spacing: .01em; }
  @keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .reveal { animation: rise .44s cubic-bezier(.22,1,.36,1) both; }
  @media (prefers-reduced-motion: reduce) { .reveal { animation: none; } }
</style>
</head>
<body>
  <main class="card reveal">
    <div class="brand">
      <img class="mark" src="/fp-icon.svg" alt="FieldPulse" />
      <div>
        <div class="brand-title">Competitor Intel</div>
        <div class="brand-tag">AI capability watch</div>
      </div>
    </div>
    <h1>Sign in</h1>
    <p class="sub">Enter your team credentials to view the dashboard.</p>
    ${alert}
    <form method="POST" action="${LOGIN_PATH}">
      <div class="field">
        <label for="username">Username</label>
        <input id="username" name="username" type="text" autocomplete="username" autofocus required />
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required />
      </div>
      <button class="btn" type="submit">Sign in</button>
    </form>
    <p class="foot">FieldPulse · Competitor Intel</p>
  </main>
</body>
</html>`;
}
