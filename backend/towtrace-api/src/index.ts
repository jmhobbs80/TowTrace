import { Hono } from 'hono';

const app = new Hono<{
  Bindings: {
    DB: D1Database;
  };
}>();

app.get('/jobs', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM jobs').all();
  return c.json(results);
});

app.get('/', (c) => c.text('TowTrace API is live!'));

export default app;