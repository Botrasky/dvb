import handler from '../../lib/security-brief-legacy.mjs';

export const prerender = false;

export async function GET({ request }: { request: Request }) {
  return handler.fetch(request);
}
