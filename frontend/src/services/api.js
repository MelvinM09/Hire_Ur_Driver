import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to include Clerk token
api.interceptors.request.use(async (config) => {
  // Note: Clerk token requires useAuth hook, which can't be used here directly.
  // Assume token is passed or handled server-side via Clerk middleware.
  return config;
});

export const checkUserRole = async (clerkUserId) => {
  try {
    const response = await api.get(`users/check-role/${clerkUserId}`);
    return response.data; // Expected: { exists: boolean, role: string|null }
  } catch (error) {
    throw new Error(
      `Error fetching user role: ${error.response?.status || "Unknown"} - ${
        error.message
      }`
    );
  }
};