// Preview gate (IAI-244). HTTP Basic Auth run at the Vercel edge, before any file
// is served. This matters because the dashboard is a static SPA: all the competitive
// data ships inside the JS bundle, so a client-side password screen would protect
// nothing. Gating here keeps the bundle itself behind the password.
//
// Set BASIC_AUTH_USER and BASIC_AUTH_PASSWORD in the Vercel project's Environment
// Variables (Production + Preview). If either is unset, the site is denied by
// default (fail closed) rather than served open.

import { next } from '@vercel/edge';

// Gate every path, including the hashed /assets/*.js bundle that holds the data.
export const config = { matcher: '/:path*' };

const DENY = new Response('Authentication required.', {
  status: 401,
  headers: { 'WWW-Authenticate': 'Basic realm="Comp Intel preview"' },
});

export default function middleware(req: Request): Response {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASSWORD;
  // Fail closed: if the gate isn't configured, don't serve the site open.
  if (!user || !pass) return DENY;

  const header = req.headers.get('authorization');
  if (header?.startsWith('Basic ')) {
    // atob is available in the edge runtime; credentials are base64(user:pass).
    const [reqUser, ...rest] = atob(header.slice(6)).split(':');
    const reqPass = rest.join(':'); // passwords may contain ':'
    if (reqUser === user && reqPass === pass) return next();
  }
  return DENY;
}
