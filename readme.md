# 📡 ESP32 Sensor Dashboard Project Documentation

This document outlines a complete, step-by-step guide to set up, run, and deploy an ESP32 IoT sensor dashboard project built with Hono.js, Cloudflare Workers, D1 Database, HTML, CSS (Dashboard).

---

## 🔧 Tech Stack Overview

- **Backend:**
  - Hono.js (Fast API framework)
  - Cloudflare Workers (serverless deployment)
  - D1 Database (Cloudflare's database service)

- **Frontend:**
  - HTML
  - Tailwind CSS
  - Chart.js

- **Hardware:**
  - ESP32 (Microcontroller)
  - DHT11 Sensor (Temperature and Humidity)

---

## 🚀 Backend Setup (Cloudflare Workers with Hono.js)

### Step 1: Create a New Cloudflare Worker Project

```sh
npm create hono@latest my-hono-app
cd my-hono-app
npm install
```

### Step 2: Install dependencies

```sh
npm install hono hono/cors wrangler
```

### Step 2: Configure Wrangler

Create `wrangler.toml`:
```toml
name = "my-hono-app"
compatibility_date = "2024-01-01"

[vars]
AUTH_KEY = "YOUR_SECURE_API_KEY"

[[d1_databases]]
binding = "DB"
database_name = "your-db-name"
database_id = "your-db-id"
```

### Step 2: Database Schema
In your D1 database, create a table:
```sql
CREATE TABLE readings (
  id INTEGER PRIMARY KEY,
  temperature REAL,
  humidity REAL,
  timestamp INTEGER
);
```

### Step 2: Backend Code
See the provided **Hono Timestamp Api** document for detailed API endpoint implementations.

### Step 3: Deploy the API
```sh
npm install wrangler -g
wrangler deploy
```

Your API endpoint will look like:
```
https://your-api.your-worker-domain.workers.dev/api/readings
```

---

## 🌡️ ESP32 Code Setup

### ESP32 (Arduino IDE)

- Install libraries:
  ```cpp
  #include <WiFi.h>
  #include <HTTPClient.h>
  #include <DHT.h>
```

### Connect ESP32 to WiFi and API
Update your ESP32 firmware to send sensor data with an API key header. Refer to the earlier provided ESP32 code snippets.

---

## 🎨 Frontend Dashboard Setup (React + Vite)

### Step 1: Create React App

```sh
npm create vite@latest esp32-dashboard -- --template react
cd esp32-dashboard
npm install axios recharts
```

### Step 2: Frontend Integration
- Create `src/api.js` to fetch data from your API (refer earlier instructions).
- Update your `App.jsx` with the provided React dashboard component.

### Step 3: Run the Frontend Locally

```sh
npm run dev
```
Open your browser at:
```
http://localhost:5173
```

---

## 📊 Usage

- **Send Data**: ESP32 sends sensor data automatically every 30 seconds.
- **View Data:** Open dashboard and select the time frame (day/week/month/custom).

---

## ✅ Testing with Postman
- **Send Data:** POST request to `/api/sensor` with JSON body `{ "temperature": 32.5, "humidity": 60.2 }`
- **Get Data:** GET request to `/api/readings?period=day`

---

## 🔐 Security
- Use a secure `AUTH_KEY` stored in environment variables.
- ESP32 sends the API key in the `x-api-key` header.

---

## 🌍 Deployment

### Frontend Deployment
Use platforms like:
- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com)

Deploy commands:
```sh
npx vercel deploy
# or
netlify deploy
```

---

## 📌 Future Enhancements
- Real-time updates with WebSockets
- Improved UI with Tailwind CSS or Material UI
- Advanced analytics & notifications

---