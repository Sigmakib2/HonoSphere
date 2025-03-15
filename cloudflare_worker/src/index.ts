import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Env = {
  DB: D1Database;
  AUTH_KEY: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use('/api/*', cors());

// ✅ Endpoint to save ESP32 sensor data with API key validation
app.post('/api/sensor', async (c) => {
  const apiKey = c.req.header('x-api-key');
  const expectedKey = c.env.AUTH_KEY;

  if (!expectedKey || apiKey !== expectedKey) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const { temperature, humidity } = await c.req.json();
  const timestamp = Date.now();

  await c.env.DB.prepare(
    'INSERT INTO readings (temperature, humidity, timestamp) VALUES (?, ?, ?)'
  ).bind(temperature, humidity, timestamp).run();

  return c.json({ status: 'success' });
});

// ✅ Endpoint to get sensor readings with filtering by minutes, hours, day, week, or month
app.get('/api/readings', async (c) => {
  const period = c.req.query('period'); // 'day', 'week', 'month'
  const from = c.req.query('from'); // Custom timestamp start
  const to = c.req.query('to'); // Custom timestamp end
  const hours = c.req.query('hours'); // Custom hour-based filtering
  const minutes = c.req.query('minutes'); // Custom minute-based filtering

  let startTime, endTime = Date.now();

  if (minutes) {
    const minutesInt = parseInt(minutes, 10);
    if (isNaN(minutesInt) || minutesInt <= 0) {
      return c.json({ error: 'Invalid minutes parameter' }, 400);
    }
    startTime = endTime - minutesInt * 60 * 1000; // Convert minutes to milliseconds
  } else if (hours) {
    const hoursInt = parseInt(hours, 10);
    if (isNaN(hoursInt) || hoursInt <= 0) {
      return c.json({ error: 'Invalid hours parameter' }, 400);
    }
    startTime = endTime - hoursInt * 60 * 60 * 1000; // Convert hours to milliseconds
  } else if (period) {
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
    startTime = 0; // Fetch all data if no filter is provided
  }

  // ✅ Fetch filtered readings from the database
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM readings WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC'
  ).bind(startTime, endTime).all();

  return c.json(results);
});

export default app;
