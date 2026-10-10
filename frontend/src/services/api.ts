import axios, { type InternalAxiosRequestConfig } from "axios";

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
    ) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;
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
      return Promise.reject(refreshError);
    }
  },
);

export default api;
