import axios from "axios";
import { dispatchApiError } from './components/ApiErrorHandler';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Обработка ошибок запроса
    dispatchApiError({
      message: "Request configuration error",
      error: error
    });
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Обработка 401 ошибки (токен истек)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("Refresh token отсутствует");
        }

        const res = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken;

        localStorage.setItem("accessToken", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Ошибка при обновлении токена:", refreshError);
        
        // Диспатч ошибки обновления токена
        dispatchApiError({
          message: "Session expired. Please login again.",
          error: refreshError
        });
        
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Обработка других ошибок
    const errorMessage = getErrorMessage(error);
    dispatchApiError({
      message: errorMessage,
      error: error,
      status: error.response?.status
    });

    return Promise.reject(error);
  }
);

// Функция для получения понятного сообщения об ошибке
const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  switch (error.response?.status) {
    case 400:
      return "Bad request. Please check your input data.";
    case 401:
      return "Unauthorized. Please login again.";
    case 403:
      return "Access forbidden. You don't have permission.";
    case 404:
      return "Resource not found.";
    case 409:
      return "Conflict. Resource already exists.";
    case 422:
      return "Validation error. Please check your data.";
    case 429:
      return "Too many requests. Please try again later.";
    case 500:
      return "Internal server error. Please try again later.";
    case 502:
      return "Bad gateway. Service temporarily unavailable.";
    case 503:
      return "Service unavailable. Please try again later.";
    case 504:
      return "Gateway timeout. Please try again.";
    default:
      if (error.code === 'NETWORK_ERROR') {
        return "Network connection failed. Please check your internet.";
      }
      if (error.code === 'TIMEOUT_ERROR') {
        return "Request timeout. Please try again.";
      }
      if (error.message) {
        return error.message;
      }
      return "An unexpected error occurred. Please try again.";
  }
};

// Вспомогательные функции для ручного диспатча ошибок
export const handleApiError = (error, customMessage = null) => {
  const message = customMessage || getErrorMessage(error);
  dispatchApiError({ message, error });
  return Promise.reject(error);
};

// Функция для безопасных запросов с обработкой ошибок
export const safeApiCall = async (apiCall, customErrorMessage = null) => {
  try {
    const response = await apiCall();
    return response;
  } catch (error) {
    const message = customErrorMessage || getErrorMessage(error);
    dispatchApiError({ message, error });
    throw error;
  }
};

export default api;