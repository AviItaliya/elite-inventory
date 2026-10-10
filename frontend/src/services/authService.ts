import api from "./api";

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  data: {
    accessToken: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "STAFF";
}

interface ProfileResponse {
  data: User;
}

export const loginUser = async (
  data: LoginData,
): Promise<string> => {
  const response = await api.post<LoginResponse>("/api/auth/login", data);
  return response.data.data.accessToken;
};

export const getProfile = async (): Promise<User> => {
  const response = await api.get<ProfileResponse>("/api/auth/profile");
  return response.data.data;
};

export const logoutUser = async (): Promise<void> => {
  await api.post("/api/auth/logout");
};

export const forgotPassword = async (
  email: string,
): Promise<string> => {
  const response = await api.post<{ message: string }>("/api/auth/forgot-password", { email });
  return response.data.message;
};

export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<string> => {
  const response = await api.post<{ message: string }>("/api/auth/reset-password", { token, newPassword });
  return response.data.message;
};