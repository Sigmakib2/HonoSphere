# 📡HonoSphere

An **ESP32-based IoT project using Cloudflare Workers, Hono JS, D1 database, HTML, CSS, JS** to continuously monitor and visualize environmental data like **temperature, humidity**, heat index, mold risk, and vapor pressure deficit (VPD) in real-time from anywhere.

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

## 🧰 HonoSphere Architecture

![HonoSphere Architecture](https://raw.githubusercontent.com/Sigmakib2/HonoSphere/refs/heads/main/esp32_firmware/diagrams/architecture.png)

## Installation

## Clone the Repository:

```bash
git clone https://github.com/Sigmakib2/HonoSphere.git
cd HonoSphere
```

### 🚀 Backend Setup (Cloudflare Workers with Hono.js and D1 Database)

#### Step 1: Go to the Cloudflare Workers Project Folder

```sh
cd .\cloudflare_worker\
npm install
npm run dev
```
Here you just need to setup the [Cloudflare D1 SQLite Database](https://developers.cloudflare.com/d1/)

#### Step 2: Configure Wrangler

Go to `wrangler.jsonc` file and you will see:
```json
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "honosphere",
      "database_id": "Your-d1_databases-ID"
    }
  ],
  //this AUTH_KEY should be in the ESP32 code bacause without this now data will be write in DB
  "vars": {
    "AUTH_KEY": "YOUR_SECURE_API_KEY"
  }
```
You can set a `AUTH_KEY` bacause anyone can store data in your database if they know the endpoint so set a good `AUTH_KEY`. You also need to create your D1 Database. You need a Cloudflare account for this, if you have a domain then there is a high chance that you are using cloudflare already!

Do this to create a D1 DB:

```sh
npx wrangler d1 create honosphere
```
You may need to install the [**wrangler**](https://developers.cloudflare.com/workers/wrangler/) by running

```sh
npm install wrangler -g
```
Here you created a database name `honosphere`. You will get the database id and name. then fill them in `wrangler.jsonc` file.

Now create table in that DB by running this command below:

```sql
npx wrangler d1 execute honosphere --remote --file db/schema.sql
```
Here in `db/schema.sql` file we have a sql command for creating the table.

Then Run the deploy command
```sh
npm run deploy
```
In the terminal you will find the endpont URL with this structure
```
https://<your-project-name>.<your-worker-subdomain>.workers.dev
```
Note this endpont because it has this API endpoints:

#### API Endpoints

1. **POST /api/sensor**

- **Purpose:**  
  Saves ESP32 sensor data (temperature and humidity) into the database.

- **Headers:**  
  - `x-api-key`: API key for authorization. The provided key must match the server's `AUTH_KEY`.

- **Request Body:**  
  JSON object with the following properties:
  - `temperature` (number): The temperature reading.
  - `humidity` (number): The humidity reading.

- **Operation:**  
  On a successful request (with valid API key), the endpoint records the sensor data along with the current timestamp in the database.

- **Response:**  
  - Success:  
    ```json
    { "status": "success" }
    ```  
  - Error (e.g., invalid API key):  
    ```json
    { "error": "Unauthorized" }
    ```

---

2. **GET /api/readings**

- **Purpose:**  
  Retrieves sensor readings from the database, with optional time-based filtering.

- **Query Parameters:**  
  - `period` (string): Can be `'day'`, `'week'`, or `'month'`. Filters the data to the corresponding time span.
  - `from` (string): Custom start timestamp (in milliseconds).
  - `to` (string): Custom end timestamp (in milliseconds).
  - `hours` (string): Custom filter to retrieve readings from the past given number of hours.
  - `minutes` (string): Custom filter to retrieve readings from the past given number of minutes.

  **Note:**  
  - Only one type of filter should be used per request.  
  - If no filter is provided, the endpoint returns all available data.

- **Operation:**  
  Filters the database records based on the provided query parameters and returns the sensor readings ordered by timestamp in descending order.

- **Response:**  
  A JSON array of sensor reading objects. Each object typically includes:
  - `temperature`: The recorded temperature.
  - `humidity`: The recorded humidity.
  - `timestamp`: The time (in milliseconds) when the reading was recorded.
  
  Example response:
  ```json
  [
    {
      "temperature": 23.5,
      "humidity": 45,
      "timestamp": 1672531200000
    },
    {
      "temperature": 24.0,
      "humidity": 50,
      "timestamp": 1672534800000
    }
  ]
  ```

- **Error Handling:**  
  Returns a 400 status code with an error message if invalid parameters (e.g., non-numeric or negative values) are provided.

---

## Hardware Setup

**📐 Connection Diagram**

![HonoSphere Connection Diagram](https://raw.githubusercontent.com/Sigmakib2/HonoSphere/refs/heads/main/esp32_firmware/diagrams/connection-diagram.png)

Follow the Connection Diagram to connect the ESP32 and DHT11 sensor.

### ESP32 Firmware

Navigate to the esp32_firmware directory.

```bash
cd esp32_firmware
cd sketch
```
Here the sketch.ino file contains the code for ESP32. Open it in your Arduino IDE or any other platform you use. Here you will find mainly this header files:

```c
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
```
I am using the adafruit DHT sensor library here. In `esp32_firmware` folder you can find the library folder which contains all the library I used.

In the code you have to replace SSID, Password, ServerURL, API key:

```c
// Wi-Fi Credentials
const char* ssid = "Your_Wifi_SSID_or_Visible_name";
const char* password = "Your_wifi_password";

// Cloudflare Worker URL we got previously
const char* serverURL = "https://cloudflare_worker.<your_worker_subdomain>.workers.dev/api/sensor";

// API Key for authentication (should be same as the cloudflare workers auth key)
const char* apiKey = "YOUR_SECURE_API_KEY";
```
Now compile the sketch and upload in your ESP32 and open serial monitor and if everything is right then you will see:

```txt
11:01:31.745 -> ets Jul 29 2019 12:21:46
11:01:31.745 -> 
11:01:31.745 -> rst:0x1 (POWERON_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
11:01:31.745 -> configsip: 0, SPIWP:0xee
11:01:31.745 -> clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
11:01:31.745 -> mode:DIO, clock div:1
11:01:31.745 -> load:0x3fff0030,len:4916
11:01:31.745 -> load:0x40078000,len:16492
11:01:31.745 -> load:0x40080400,len:4
11:01:31.745 -> load:0x40080404,len:3524
11:01:31.745 -> entry 0x400805b8
11:01:32.163 -> Connecting to WiFi..
11:01:33.168 -> Connected to WiFi ✅
```
If code uoloading but still not showing anything in serial monitor then press the 'en' button and look at the serial monitor.

In each 33 second you will see a blue LED blink which means it is sending HTTP Post request to the Cloudflare Workers Server. Log into your cloudflare account and then go to **Storage & Databases -> D1 SQL Database -> honosphere -> navigate to table -> readings. Here you can find the logs in table format.**

## Dashboard

The HonoSphere Dashboard is a web interface designed to visualize sensor readings obtained from a Cloudflare Worker API endpoint. It provides multiple chart types (line, bar, scatter, histogram, pie, and polar) with interactive features like zooming, panning, and full-screen display.

To see your data you need to edit the part of the index.html file and here you can find the file:

```bash
PS C:\GitHub\HonoSphere> cd .\dashboard\
PS C:\GitHub\HonoSphere\dashboard>
```
The dashboard uses the following plugins:

- **Chart.js:** For rendering interactive charts.
- **chartjs-plugin-zoom:** To enable zooming and panning on the charts.
- **Tailwind CSS:** For utility-first styling and layout.

To make it working just do this, go to the `<script></script>` tag and you will find this section:

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
Here you have to change this URL with the endpoint you got from the cloudflare. Open it with live server or any other method and if everything is right you will find out the data.

![HonoSphere Dashboard](https://raw.githubusercontent.com/Sigmakib2/HonoSphere/refs/heads/main/esp32_firmware/diagrams/dashboard.png)

User Interaction Flow

1. **Selecting a Time Range:**  
   - The user can choose a predefined time range (last 1 minute, hour, day, week, or month) from the dropdown.
   - Alternatively, custom "From" and "To" datetime values can be entered.

2. **Loading Data:**  
   - Clicking the "Load Data" button triggers `fetchData()`, which constructs the query URL based on the selected filters and fetches the sensor data from the API endpoint.

3. **Chart Visualization:**  
   - Upon data retrieval, `renderCharts(data)` processes the data and renders six different types of charts.
   - Users can interact with the charts (zoom, pan) using the Chart.js zoom plugin.

4. **Full-Screen Mode:**  
   - Each chart container has a full-screen button that triggers the full-screen mode using `openFullscreen()`.
   - When in full-screen mode, an "Exit Full Screen" button appears to allow the user to revert to normal view.

Data Fetching and Rendering

- **`fetchData()` Function:**  
  - **Purpose:** Retrieves sensor data from the API endpoint.
  - **How it Works:**  
    - Reads filter values from the form (time range, from, and to dates).
    - Constructs the API URL based on selected query parameters. If custom dates are provided, it converts them to timestamps.
    - Fetches data from the endpoint and handles errors.
    - Calls `renderCharts(data)` to update the charts.

- **`renderCharts(data)` Function:**  
  - **Purpose:** Processes and renders sensor data into charts.
  - **Operations:**  
    - Verifies if data exists; alerts the user if empty.
    - Extracts timestamps, temperature, and humidity values from the data.
    - Computes average temperature and humidity.
    - Destroys any previously rendered charts to avoid duplication.
    - Creates new chart instances using Chart.js for each of the six chart types:
      - **Line Chart:** Plots temperature and humidity trends over time.
      - **Bar Chart:** Displays temperature and humidity as bars.
      - **Scatter Chart:** Plots temperature against humidity.
      - **Histogram Chart:** Displays temperature distribution using a bar chart format.
      - **Pie Chart & Polar Chart:** Compare average temperature and humidity.

Chart Configuration

- **`getZoomOptions()` Function:**  
  - **Purpose:** Provides configuration for enabling zoom and pan features.
  - **Options:**  
    - Enables mouse wheel and pinch zooming.
    - Enables panning in both x and y directions.

- **`getChartOptions()` Function:**  
  - **Purpose:** Returns base configuration for all charts.
  - **Configuration:**  
    - Responsive and disables aspect ratio maintenance.
    - Merges with zoom options from `getZoomOptions()`.

Full-Screen Mode

- **`openFullscreen(containerId)` Function:**  
  - **Purpose:** Requests full-screen display for a given chart container.
  - **Browser Support:**  
    - Checks for standard, WebKit, and IE11 full-screen methods.

- **`exitFullscreen()` Function:**  
  - **Purpose:** Exits full-screen mode.
  - **Browser Support:**  
    - Handles standard and vendor-prefixed exit methods.

- **Fullscreen Event Listener:**  
  - **Functionality:**  
    - Listens for changes in full-screen status.
    - Dynamically adds an "Exit Full Screen" button inside the full-screen element.
    - Ensures removal of duplicate exit buttons when leaving full-screen.

Automatic Data Load

- On page load, `fetchData()` is automatically called to render the charts with the latest available data.

---