import { useEffect, useState } from "react";
import { fetchData } from "./api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./App.css";

function App() {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState("day");
  const [customHours, setCustomHours] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      const result = period === "custom"
        ? await fetchData(`custom&hours=${customHours}`)
        : await fetchData(period);
      setData(result);
    };
    loadData();
  }, [period, customHours]);

  return (
    <div className="container">
      <h2 className="title">🌡️ ESP32 Sensor Dashboard</h2>

      {/* Period Selection */}
      <div className="button-group">
        <button className={period === "day" ? "active" : ""} onClick={() => setPeriod("day")}>
          Day
        </button>
        <button className={period === "week" ? "active" : ""} onClick={() => setPeriod("week")}>
          Week
        </button>
        <button className={period === "month" ? "active" : ""} onClick={() => setPeriod("month")}>
          Month
        </button>
        <button className={period === "custom" ? "active" : ""} onClick={() => setPeriod("custom")}>
          Custom Hours
        </button>
      </div>

      {/* Custom Hours Selection */}
      {period === "custom" && (
        <div className="custom-hours">
          <label>Hours:</label>
          <input
            type="number"
            value={customHours}
            onChange={(e) => setCustomHours(e.target.value)}
            min="1"
          />
        </div>
      )}

      {/* Full-Screen Chart Display */}
      <div className="chart-container-fullscreen">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temperature" stroke="#ff7300" name="Temperature (°C)" strokeWidth={2} />
            <Line type="monotone" dataKey="humidity" stroke="#387908" name="Humidity (%)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App;
