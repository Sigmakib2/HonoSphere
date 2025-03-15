import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

app.use('/api/*', cors());

// Endpoint to save ESP32 sensor data
app.post('/api/sensor', async (c) => {
  const { temperature, humidity } = await c.req.json();
  const timestamp = Date.now();

  await c.env.DB.prepare(
    'INSERT INTO readings (temperature, humidity, timestamp) VALUES (?, ?, ?)'
  ).bind(temperature, humidity, timestamp).run();

  return c.json({ status: 'success' });
});

// Endpoint to get sensor data based on timestamps or predefined periods
app.get('/api/readings', async (c) => {
  const period = c.req.query('period');
  const from = c.req.query('from');
  const to = c.req.query('to');

  let startTime, endTime = Date.now();

  if (period) {
    switch (period) {
      case 'day':
        startTime = endTime - 24 * 60 * 60 * 1000;
        break;
      case 'week':
        startTime = endTime - 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        startTime = endTime - 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        return c.json({ error: 'Invalid period specified' }, 400);
    }
  } else if (from && to) {
    startTime = parseInt(from, 10);
    endTime = parseInt(to, 10);

    if (isNaN(startTime) || isNaN(endTime)) {
      return c.json({ error: 'Invalid timestamps provided' }, 400);
    }
  } else {
    startTime = 0; // default to fetch all data if no period or timestamps are provided
  }

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM readings WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC LIMIT 100'
  ).bind(startTime, endTime).all();

  return c.json(results);
});

export default app;
