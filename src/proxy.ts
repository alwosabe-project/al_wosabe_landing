import { NextRequest, NextResponse } from 'next/server';
import { siteOrigin } from '@/lib/site-url';

type RedirectRule = { sourcePath: string; targetPath: string; statusCode: number };
let rules = new Map<string, RedirectRule>();
let refreshAfter = 0;
let refresh: Promise<void> | null = null;
const localPath = (path: unknown): path is string => typeof path === 'string' && /^\/(ar|en)(\/|$)/.test(path) && !/[\\\u0000-\u0020?#]/.test(path) && !/^\/(ar|en)\/blog\/preview(?:\/|$)/.test(path);

async function refreshRedirects() {
  if (Date.now() < refreshAfter) return;
  if (!refresh) refresh = (async () => {
    try {
      const api = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${api}/api/v1/public/seo/redirects`, { cache: 'no-store', signal: AbortSignal.timeout(2000) });
      if (!response.ok) throw new Error('Unavailable');
      const payload = await response.json() as { data: RedirectRule[] };
      if (!Array.isArray(payload.data)) throw new Error('Invalid response');
      const next = new Map<string, RedirectRule>();
      for (const rule of payload.data) if (localPath(rule.sourcePath) && localPath(rule.targetPath) && [301, 308].includes(rule.statusCode)) next.set(rule.sourcePath, rule);
      rules = next;
      refreshAfter = Date.now() + 60000;
    } catch {
      // Preserve the last known map during an outage; bound retry frequency.
      refreshAfter = Date.now() + 10000;
    }
  })().finally(() => { refresh = null; });
  await refresh;
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (/\/(?:blog\/preview|admin)(?:\/|$)/.test(path)) {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    response.headers.set('Referrer-Policy', 'no-referrer');
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  }
  if (!/^\/(ar|en)(\/|$)/.test(path)) return NextResponse.next();
  await refreshRedirects();
  let current: string;
  try { current = decodeURI(path).replace(/\/+$/, ''); } catch { return NextResponse.next(); }
  const visited = new Set<string>();
  let status: 301 | 308 = 308;
  const source = current;
  while (visited.size < 20) {
    if (visited.has(current)) return NextResponse.next();
    visited.add(current);
    const rule = rules.get(current);
    if (!rule) break;
    current = rule.targetPath;
    status = rule.statusCode === 301 ? 301 : 308;
  }
  if (rules.has(current)) return NextResponse.next();
  if (current !== source) return NextResponse.redirect(new URL(current, siteOrigin()), status);
  return NextResponse.next();
}

export const config = { matcher: ['/ar/:path*', '/en/:path*'] };
