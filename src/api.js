import axios from "axios";
import { dispatchApiError } from "./components/ApiErrorHandler";

const API_URL = import.meta.env.VITE_API_URL;
const KEYCLOAK_TOKEN_URL = "http://localhost:9090/realms/innowise-shop/protocol/openid-connect/token";
const CLIENT_ID = "api-gateway";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};


const refreshTokens = async (refreshToken) => {
  if (!refreshToken) throw new Error("Refresh token is missing");

  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("client_id", CLIENT_ID);
  params.append("refresh_token", refreshToken);

  const response = await axios.post(KEYCLOAK_TOKEN_URL, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return response.data;
};


const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => {
    dispatchApiError({ message: "Request configuration error", error });
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      localStorage.clear();
      dispatchApiError({ message: "Сессия истекла. Войдите снова.", error });
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newTokens = await refreshTokens(refreshToken);

      localStorage.setItem("accessToken", newTokens.access_token);
      localStorage.setItem("refreshToken", newTokens.refresh_token);

      isRefreshing = false;
      processQueue(null, newTokens.access_token);

      originalRequest.headers["Authorization"] = `Bearer ${newTokens.access_token}`;
      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      processQueue(refreshError, null);

      localStorage.clear();
      dispatchApiError({ message: "Не удалось обновить сессию. Войдите снова.", error: refreshError });
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  }
);


const getErrorMessage = (error) => {
  if (error.response?.data?.error_description) return error.response.data.error_description;
  if (error.response?.data?.message) return error.response.data.message;

  switch (error.response?.status) {
    case 400: return "Bad request. Please check your input data.";
    case 401: return "Unauthorized. Please login again.";
    case 403: return "Access forbidden.";
    case 404: return "Resource not found.";
    case 500: return "Internal server error.";
    default: return error.message || "An unexpected error occurred.";
  }
};

export const handleApiError = (error, customMessage = null) => {
  const message = customMessage || getErrorMessage(error);
  dispatchApiError({ message, error });
  return Promise.reject(error);
};

export const safeApiCall = async (apiCall, customErrorMessage = null) => {
  try {
    return await apiCall();
  } catch (error) {
    const message = customErrorMessage || getErrorMessage(error);
    dispatchApiError({ message, error });
    throw error;
  }
};

export default api;
