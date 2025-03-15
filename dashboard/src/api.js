import axios from "axios";

const API_URL = "https://your-cloudflare-api.com/api/readings"; // Replace with your actual API URL

export const fetchData = async (period = "day") => {
  try {
    const response = await axios.get(`${API_URL}?period=${period}`);
    return response.data.map(entry => ({
      time: new Date(entry.timestamp).toLocaleTimeString(),
      temperature: entry.temperature,
      humidity: entry.humidity,
    }));
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};
