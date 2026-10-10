import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getProfile, loginUser, logoutUser, type User } from "../../services/authService";

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
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return rejectWithValue("No access token");
    }

    try {
      const user = await getProfile();
      return user;
    } catch (error) {
      console.error("Failed to load user:", error);
      return rejectWithValue("Failed to load user");
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
      localStorage.removeItem("accessToken");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
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

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
