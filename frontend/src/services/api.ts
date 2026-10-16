import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { disconnectSocket, updateSocketToken } from "./socketService";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const refreshApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;

const clearSession = () => {
  localStorage.removeItem("accessToken");
  disconnectSocket();
};

export const refreshAccessToken = async (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = refreshApi
      .post("/api/auth/refresh-token")
      .then((response) => {
        const accessToken = response.data?.data?.accessToken;

        if (typeof accessToken !== "string" || !accessToken) {
          throw new Error("Invalid refresh response");
        }

        localStorage.setItem("accessToken", accessToken);

        updateSocketToken(accessToken);

        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

// REQUEST INTERCEPTOR
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url ?? "";

    const skipRefresh = [
      "/api/auth/login",
      "/api/auth/refresh-token",
      "/api/auth/forgot-password",
      "/api/auth/reset-password",
      "/api/auth/logout",
    ].some((path) => requestUrl.includes(path));

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      skipRefresh
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const failedToken = originalRequest.headers.get("Authorization");

      const currentToken = localStorage.getItem("accessToken");

      let newAccessToken: string;

      // Another request may already have refreshed the token.
      if (currentToken && failedToken !== `Bearer ${currentToken}`) {
        newAccessToken = currentToken;
      } else {
        newAccessToken = await refreshAccessToken();
      }

      originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);

      return api(originalRequest);
    } catch (refreshError) {
      clearSession();

      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }

      return Promise.reject(refreshError);
    }
  },
);

export default api;
