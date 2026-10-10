import axios from "axios";
import api from "./api";

const API_URL = import.meta.env.VITE_API_URL;

interface LoginData {
    email: string;
    password: string;
}

interface LoginResponse {
    data: {
        accessToken :string;
    }
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

export const loginUser = async (data: LoginData): Promise<string> => {
    const res = await axios.post<LoginResponse>(
        `${API_URL}/api/auth/login`, data, {withCredentials: true}
    );
    return res.data.data.accessToken;
};

export const getProfile = async (): Promise<User> => {
    const res = await api.get<ProfileResponse>("/api/auth/profile");
    return res.data.data;
}

export const logoutUser = async () => {
     await api.post(`${API_URL}/api/auth/logout`, {}, {
        withCredentials: true
     });
};

export const forgotPassword = async (email: string): Promise<string> => {
    const res = await api.post("/api/auth/forgot-password", { email });
    return res.data.message;
};

export const resetPassword = async (token: string, newPassword: string): Promise<string> => {
    const res = await api.post("/api/auth/reset-password",
        {token, newPassword,}
    );
    return res.data.message;
};