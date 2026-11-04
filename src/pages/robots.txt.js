import { IS_PREVIEW } from '../data/site.js';

// robots.txt: bloquea todo mientras IS_PREVIEW = true.
export function GET() {
  const body = IS_PREVIEW ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
