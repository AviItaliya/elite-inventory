import axios, { type InternalAxiosRequestConfig } from "axios";
<<<<<<< HEAD
import { disconnectSocket, updateSocketToken } from "./socketService";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const url = originalRequest?.url ?? "";

    const skipRefresh = [
      "/api/auth/login",
      "/api/auth/refresh-token",
      "/api/auth/forgot-password",
      "/api/auth/reset-password",
      "/api/auth/logout",
    ].some((path) => url.includes(path));

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      skipRefresh
=======

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    if (
      error.response?.status !== 401 || originalRequest?._retry ||
      originalRequest?.url?.includes("/api/auth/refresh-token")
>>>>>>> origin/main
    ) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;
<<<<<<< HEAD

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/refresh-token`,
        {},
        { withCredentials: true },
      );
      const newAccessToken = response.data.data.accessToken as string;
      localStorage.setItem("accessToken", newAccessToken);
      // Reauthenticate the Socket.IO connection.
      updateSocketToken(newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("accessToken");
      disconnectSocket();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
=======
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/refresh-token`,
        {},
        { withCredentials: true },
      );
      const newAccessToken = res.data.data.accessToken;
      localStorage.setItem("accessToken", newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
>>>>>>> origin/main
      return Promise.reject(refreshError);
    }
  },
);

export default api;
