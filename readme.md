# 📡 HonoSphere

Welcome to **HonoSphere** – an exciting ESP32-based IoT project that brings your environment to life! Using **Cloudflare Workers, Hono.js, D1 Database, HTML, CSS, and JavaScript**, HonoSphere continuously monitors and visualizes key environmental data such as **temperature, humidity, heat index, mold risk, and vapor pressure deficit (VPD)** in real-time—so you can check in on your surroundings from anywhere.

## Table of Contents

1. [Tech Stack Overview](#tech-stack-overview)
2. [HonoSphere Architecture](#honosphere-architecture)
3. [Installation & Setup](#installation--setup)
    - [Clone the Repository](#clone-the-repository)
    - [Backend Setup](#backend-setup)
        - [Cloudflare Workers Project](#cloudflare-workers-project)
        - [Configure Wrangler](#configure-wrangler)
        - [Create & Configure the D1 Database](#create--configure-the-d1-database)
    - [ESP32 Firmware Setup](#esp32-firmware-setup)
4. [API Endpoints](#api-endpoints)
5. [Dashboard](#dashboard)
    - [Dashboard Setup](#dashboard-setup)
    - [User Interaction Flow](#user-interaction-flow)
6. [Additional Information](#additional-information)

---

## Tech Stack Overview

**Backend:**
- **Hono.js:** A lightning-fast API framework.
- **Cloudflare Workers:** Run your code on the edge with serverless deployment.
- **D1 Database:** Cloudflare's SQL-based database service.

**Frontend:**
- **HTML** and **Tailwind CSS:** Create sleek, responsive web pages.
- **Chart.js:** Render interactive, eye-catching charts.

**Hardware:**
- **ESP32:** The brain of your IoT sensor.
- **DHT11 Sensor:** Measures temperature and humidity for you.

---

## HonoSphere Architecture

Visualize the flow of your project with this neat diagram:

![HonoSphere Architecture](https://raw.githubusercontent.com/Sigmakib2/HonoSphere/refs/heads/main/esp32_firmware/diagrams/architecture.png)

---

## Installation & Setup

### Clone the Repository

Kick things off by cloning the repository to your local machine:

```bash
git clone https://github.com/Sigmakib2/HonoSphere.git
cd HonoSphere
```

---

### Backend Setup

Get ready to deploy the magic on Cloudflare!

#### Cloudflare Workers Project

1. **Navigate and Install Dependencies:**

   Jump into the Cloudflare Workers folder and install the necessary packages:

   ```bash
   cd cloudflare_worker
   npm install
   npm run dev
   ```

2. **Set Up Cloudflare D1 Database:**

   Follow the [Cloudflare D1 documentation](https://developers.cloudflare.com/d1/) to configure your database. Below you can see this process:

#### Configure Wrangler

1. **Edit the `wrangler.jsonc` File:**

   Update your configuration to connect to your D1 database and secure your endpoints with an API key:

   ```json
   {
     "d1_databases": [
       {
         "binding": "DB",
         "database_name": "honosphere",
         "database_id": "Your-d1_databases-ID"
       }
     ],
     "vars": {
       "AUTH_KEY": "YOUR_SECURE_API_KEY"
     }
   }
   ```

   > **Tip:** The `AUTH_KEY` is crucial—it's what keeps unauthorized users from writing data to your database!

#### Create & Configure the D1 Database

1. **Create the Database:**

   Execute this command to create a new database called `honosphere`:

   ```sh
   npx wrangler d1 create honosphere
   ```

   *(If you haven’t installed [Wrangler](https://developers.cloudflare.com/workers/wrangler/) yet, run `npm install wrangler -g`.)*

2. **Set Up Your Database Table:**

   Run the schema file to create the necessary table:

   ```sh
   npx wrangler d1 execute honosphere --remote --file db/schema.sql
   ```

3. **Deploy Your Worker:**

   Finally, deploy your Cloudflare Worker:

   ```sh
   npm run deploy
   ```

   Once deployed, you’ll see an endpoint URL in your terminal like this:

   ```
   https://<your-project-name>.<your-worker-subdomain>.workers.dev
   ```

---

### ESP32 Firmware Setup

Let’s power up the ESP32!

**📐 Connection Diagram**

![HonoSphere Connection Diagram](https://raw.githubusercontent.com/Sigmakib2/HonoSphere/refs/heads/main/esp32_firmware/diagrams/connection-diagram.png)

![HonoSphere Connection Diagram Breadboard](https://raw.githubusercontent.com/Sigmakib2/HonoSphere/refs/heads/main/esp32_firmware/diagrams/breadboard.jpg)

Follow the Connection Diagram to connect the ESP32 and DHT11 sensor.

1. **Navigate to the Firmware Directory:**

   ```bash
   cd esp32_firmware/sketch
   ```

2. **Edit the `sketch.ino` File:**

   Open the file in the Arduino IDE (or your favorite editor) and update these settings:

   ```c
   // Wi-Fi Credentials
   const char* ssid = "Your_Wifi_SSID_or_Visible_name";
   const char* password = "Your_wifi_password";

   // Cloudflare Worker URL
   const char* serverURL = "https://cloudflare_worker.<your_worker_subdomain>.workers.dev/api/sensor";

   // API Key (must match Cloudflare Workers AUTH_KEY)
   const char* apiKey = "YOUR_SECURE_API_KEY";
   ```

3. **Upload the Firmware:**

   Compile and upload the sketch to your ESP32. Open the serial monitor and you should see messages like:

   ```
   Connecting to WiFi...
   Connected to WiFi ✅
   ```

4. **Watch It Work:**

   Every 33 seconds, the onboard LED will blink to show that data is being sent. Check your Cloudflare D1 Database (under **Storage & Databases → D1 SQL Database → honosphere → readings**) to see your data logged.

---

## API Endpoints

Your deployed Cloudflare Worker exposes the following API endpoints:

### 1. POST `/api/sensor`

- **What It Does:**  
  Accepts sensor data from the ESP32 and stores it in the database.

- **How to Use It:**  
  - **Headers:**  
    - `x-api-key`: Must match your `AUTH_KEY`.
  - **Body:**  
    ```json
    {
      "temperature": 23.5,
      "humidity": 45
    }
    ```

- **Response:**  
  - **Success:**
    ```json
    { "status": "success" }
    ```
  - **Failure (e.g., if the API key is wrong):**
    ```json
    { "error": "Unauthorized" }
    ```

### 2. GET `/api/readings`

- **What It Does:**  
  Retrieves sensor readings, with optional filters.

- **How to Use It:**  
  Use query parameters such as:
  - `period` (e.g., `'day'`, `'week'`, or `'month'`)
  - `from` and `to` (custom timestamps in milliseconds)
  - `hours` or `minutes` (to get recent data)

  **Note:** Use one filter type per request.

  ```sh
  GET  https://<your-project-name>.<your-worker-subdomain>.workers.dev/api/readings?minutes=1
  ```

- **Response:**  
  Returns an array of sensor readings:

```json
[
  {
    "id": 3652,
    "temperature": 33.9,
    "humidity": 48.9,
    "timestamp": 1742109887052
  },
  {
    "id": 3651,
    "temperature": 33.9,
    "humidity": 48.9,
    "timestamp": 1742109874901
  }
]
```

- **Error Handling:**  
  A 400 status code is returned for invalid parameters.

---

## Dashboard

The HonoSphere Dashboard is a slick web interface that visualizes your sensor data through interactive charts like line, bar, scatter, histogram, pie, and polar.

![HonoSphere Dashboard](https://raw.githubusercontent.com/Sigmakib2/HonoSphere/refs/heads/main/esp32_firmware/diagrams/dashboard.png)

### Dashboard Setup

1. **Navigate to the Dashboard Directory:**

   ```bash
   cd dashboard
   ```

2. **Update the Endpoint URL:**

   In the `index.html` file, find the script block that constructs the API URL and update the placeholder with your Cloudflare Worker endpoint:

   ```js
   async function fetchData() {
       let filter = document.getElementById('timeFilter').value;
       let fromDate = document.getElementById('fromDate').value;
       let toDate = document.getElementById('toDate').value;

       let url = `https://cloudflare_worker.<Your_worker_subdomain>.workers.dev/api/readings?${filter}`;

       if (fromDate && toDate) {
           const fromTimestamp = new Date(fromDate).getTime();
           const toTimestamp = new Date(toDate).getTime();
           url = `https://cloudflare_worker.<Your_worker_subdomain>.workers.dev/api/readings?from=${fromTimestamp}&to=${toTimestamp}`;
       }

       try {
           const res = await fetch(url);
           const data = await res.json();
           if (data.error) throw new Error(data.error);
           renderCharts(data);
       } catch (err) {
           alert('Error fetching data: ' + err.message);
       }
   }
   ```

3. **Launch the Dashboard:**

   Open the `index.html` file with a live server or your preferred method, and watch your data come to life in vibrant charts!

### User Interaction Flow

- **Select a Time Range:**  
  Choose a preset period (like last 1 minute, 1 hour, etc.) or set custom dates.
- **Load Data:**  
  Click the **Load Data** button to fetch sensor readings.
- **Visualize Charts:**  
  Your data is rendered in multiple charts—complete with zoom, pan, and full-screen features.
- **Full-Screen Mode:**  
  Use the full-screen button on any chart for a closer look, and exit full-screen easily.

### Plugins in Action

- **Chart.js:** Creates interactive, dynamic charts.
- **chartjs-plugin-zoom:** Enables smooth zooming and panning.
- **Tailwind CSS:** Ensures your dashboard looks sharp and responsive.

---

## Additional Information

For a deeper dive, updates, or to contribute your own ideas, check out the [HonoSphere GitHub repository](https://github.com/Sigmakib2/HonoSphere). Enjoy exploring and monitoring your environment with HonoSphere—where tech meets nature in real-time!

![HonoSphere Connection Diagram Breadboard](https://raw.githubusercontent.com/Sigmakib2/HonoSphere/refs/heads/main/esp32_firmware/diagrams/breadboard-3.jpg)

![HonoSphere Connection Diagram Breadboard](https://raw.githubusercontent.com/Sigmakib2/HonoSphere/refs/heads/main/esp32_firmware/diagrams/breadboard-2.jpg)

![HonoSphere Connection Diagram Breadboard](https://raw.githubusercontent.com/Sigmakib2/HonoSphere/refs/heads/main/esp32_firmware/diagrams/breadboard-4.jpg)

---