import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getDashboard, type DashboardData, type DashboardFilters } from "../../services/dashboardService";
import { getInventoryTransactions } from "../../services/inventoryTransactionService";

type RecentTransaction = Awaited<ReturnType<typeof getInventoryTransactions>>["transactions"][number];

interface DashboardState {
  dashboard: DashboardData | null;
  transactions: RecentTransaction[];
  activeFilters: DashboardFilters;
  loading: boolean;
  error: string | null;
  refreshError: string | null;
  currentRequestId: string | null;
}

const initialState: DashboardState = {
  dashboard: null,
  transactions: [],
  activeFilters: {},
  loading: false,
  error: null,
  refreshError: null,
  currentRequestId: null,
};

export const fetchDashboard = createAsyncThunk(
  "dashboard/fetchDashboard",
  async (filters: DashboardFilters = {}, { rejectWithValue }) => {
    try {
      const dashboardData = await getDashboard(filters);
      // Recent transactions are supplementary: do not fail the financial dashboard
      // if their endpoint is temporarily unavailable.
      const transactionData = await getInventoryTransactions(1, 5).catch(
        () => null,
      );
      return {
        dashboard: dashboardData,
        transactions: transactionData?.transactions ?? null,
      };
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      return rejectWithValue("Failed to load dashboard data");
    }
  },
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state, action) => {
        state.currentRequestId = action.meta.requestId;
        state.loading = state.dashboard === null;
        state.error = null;
        state.refreshError = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.currentRequestId = null;
        state.loading = false;
        state.dashboard = action.payload.dashboard;
        if (action.payload.transactions !== null) {
          state.transactions = action.payload.transactions;
        }
        state.activeFilters = action.meta.arg;
        state.error = null;
        state.refreshError = null;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.currentRequestId = null;
        state.loading = false;
        const message =
          (action.payload as string) || "Failed to load dashboard data";
        if (!state.dashboard) state.error = message;
        else state.refreshError = message;
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
