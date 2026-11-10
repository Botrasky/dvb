import handler from '../../../api/security-brief-legacy.mjs';

export const prerender = false;

export async function GET({ request }: { request: Request }) {
  return handler.fetch(request);
}
