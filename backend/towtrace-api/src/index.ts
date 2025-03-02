import { D1Database, Request } from '@cloudflare/workers-types';  // Remove Response from the import

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const headers = {
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    if (url.pathname === '/api/test') {
      return new Response('TowTrace API is live!', { status: 200, headers });
    }
    return new Response('Welcome to TowTrace API', { status: 200, headers });
  },
};

interface Env {
  DB: D1Database;
}