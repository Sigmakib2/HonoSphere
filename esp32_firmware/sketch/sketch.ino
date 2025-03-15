#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// Wi-Fi Credentials
const char* ssid = "Your_Wifi_SSID_or_Visible_name";
const char* password = "Your_wifi_password";

// Cloudflare Worker URL
const char* serverURL = "https://cloudflare_worker.<your_worker_subdomain>.workers.dev/api/sensor";

// API Key for authentication (should be same as the cloudflare workers auth key)
const char* apiKey = "YOUR_SECURE_API_KEY";

// DHT11 Configuration
#define DHTPIN 4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// ESP32 onboard LED pin
#define LED_BUILTIN 2

void setup() {
    Serial.begin(115200);

    // Setup LED pin
    pinMode(LED_BUILTIN, OUTPUT);

    // Connect to WiFi
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConnected to WiFi ✅");

    // Initialize DHT sensor
    dht.begin();
}

void blinkLED(int times, int delayTime) {
    for(int i = 0; i < times; i++) {
        digitalWrite(LED_BUILTIN, HIGH);
        delay(delayTime);
        digitalWrite(LED_BUILTIN, LOW);
        delay(delayTime);
    }
}

void sendDHTData() {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverURL);
        http.addHeader("Content-Type", "application/json");
        http.addHeader("x-api-key", apiKey);

        float temperature = dht.readTemperature();
        float humidity = dht.readHumidity();

        if (isnan(temperature) || isnan(humidity)) {
            Serial.println("❌ Failed to read from DHT sensor!");
            return;
        }

        String jsonPayload = "{";
        jsonPayload += "\"temperature\":" + String(temperature, 2) + ",";
        jsonPayload += "\"humidity\":" + String(humidity, 2);
        jsonPayload += "}";

        int httpResponseCode = http.POST(jsonPayload);

        if (httpResponseCode > 0) {
            Serial.printf("✅ Data sent successfully. Response code: %d\n", httpResponseCode);
            blinkLED(2, 200); // Blink LED twice quickly
        } else {
            Serial.printf("❌ Error sending data. HTTP error: %s\n", http.errorToString(httpResponseCode).c_str());
        }

        http.end();
    } else {
        Serial.println("❌ WiFi disconnected, attempting reconnection...");
        WiFi.reconnect();
    }
}

void loop() {
    sendDHTData();
    delay(30000); // Send data every 30 seconds
}
