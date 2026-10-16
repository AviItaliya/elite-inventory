import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getProfile, loginUser, logoutUser, type User } from "../../services/authService";
import { connectSocket, disconnectSocket } from "../../services/socketService";
import { refreshAccessToken } from "../../services/api";

export interface Notification {
  id: string;
  userId: string;
  type: "LOW_STOCK";
  title: string;
  message: string;
  productId: string | null;
  currentStock: number | null;
  minStock: number | null;
  isRead: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  loginLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: true,
  loginLoading: false,
  error: null,
};

export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      let accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        accessToken = await refreshAccessToken();
      }
      const user = await getProfile();
      connectSocket();
      return user;
    } catch (error) {
      disconnectSocket();
      localStorage.removeItem("accessToken");
      console.error("Failed to load user:", error);
      return rejectWithValue("Session expired. Please login again.");
    }
  },
);

// Login
export const login = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const accessToken = await loginUser(credentials);
      localStorage.setItem("accessToken", accessToken);
      const user = await getProfile();
      connectSocket();
      return user;
    } catch (error) {
      console.error("Login failed:", error);
      return rejectWithValue("Invalid email or password");
    }
  },
);

// Logout
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await logoutUser();
      return null;
    } catch (error) {
      console.error("Logout failed:", error);
      return rejectWithValue("Failed to logout");
    } finally {
      disconnectSocket();
      localStorage.removeItem("accessToken");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    profileUpdated: (state, action: { payload: User }) => {
      state.user = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // Load User
    builder
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loginLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.loginLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.loginLoading = false;
        state.user = null;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
        state.user = null;
      });
  },
});

export const { clearAuthError, profileUpdated } = authSlice.actions;
export default authSlice.reducer;
