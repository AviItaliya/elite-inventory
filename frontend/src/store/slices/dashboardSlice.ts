import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getDashboard,
  type DashboardData,
  type DashboardFilters,
} from "../../services/dashboardService";
import { getInventoryTransactions } from "../../services/inventoryTransactionService";

type RecentTransaction = Awaited<
  ReturnType<typeof getInventoryTransactions>
>["transactions"][number];

interface DashboardState {
  dashboard: DashboardData | null;
  transactions: RecentTransaction[];
  activeFilters: DashboardFilters;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  dashboard: null,
  transactions: [],
  activeFilters: {},
  loading: false,
  error: null,
};

export const fetchDashboard = createAsyncThunk(
  "dashboard/fetchDashboard",
  async (filters: DashboardFilters = {}, { rejectWithValue }) => {
    try {
      const [dashboardData, transactionData] = await Promise.all([
        getDashboard(filters),
        getInventoryTransactions(1, 5),
      ]);
      return {
        dashboard: dashboardData,
        transactions: transactionData.transactions,
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
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = state.dashboard === null;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload.dashboard;
        state.transactions = action.payload.transactions;
        state.activeFilters = action.meta.arg;
        state.error = null;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        if (!state.dashboard) {
          state.error =
            (action.payload as string) || "Failed to load dashboard data";
        }
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
