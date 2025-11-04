// ✅ Use environment variable for backend base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("🚨 VITE_API_BASE_URL is not defined in .env file!");
}

export const API_URL = `${API_BASE_URL}/api`;

// ✅ Helper to get JWT token safely
const getToken = (): string | null => localStorage.getItem("token");

/** ✅ Universal request handler */
const request = async (method: string, endpoint: string, body?: any) => {
  const url = `${API_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      console.error(`❌ API Error (${method} ${endpoint}) - ${res.status}`, data);
      throw new Error(data?.message || `API request failed (${res.status})`);
    }

    return data;
  } catch (error) {
    console.error("🚨 Network/API Error:", error);
    throw error;
  }
};

export const get = (endpoint: string) => request("GET", endpoint);
export const post = (endpoint: string, body: any) => request("POST", endpoint, body);
export const put = (endpoint: string, body: any) => request("PUT", endpoint, body);
export const del = (endpoint: string) => request("DELETE", endpoint);
