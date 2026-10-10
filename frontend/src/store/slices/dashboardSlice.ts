import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getDashboard, type DashboardData } from "../../services/dashboardService";
import { getInventoryTransactions } from "../../services/inventoryTransactionService";

type RecentTransaction = Awaited<ReturnType<typeof getInventoryTransactions>>["transactions"][number];

interface DashboardState {
    dashboard: DashboardData | null;
    transactions: RecentTransaction[];
    loading: boolean;
    error: string | null;
}

const initialState: DashboardState = {
    dashboard: null,
    transactions: [],
    loading: false,
    error: null
};

export const fetchDashboard = createAsyncThunk("dashboard/fetchDashboard", 
    async(_, {rejectWithValue}) => {
        try {
            const [dashboardData, transactionData] = await Promise.all([
                getDashboard(),
                getInventoryTransactions(1, 5)
            ]);
            return {
                dashboard: dashboardData,
                transactions: transactionData.transactions
            };
        } catch (error) {
            console.error("Failed to load dashboard:", error);
            return rejectWithValue("Failed to load dashboard data");
        }
    }
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
            .addCase(fetchDashboard.pending, (state) =>{
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.dashboard = action.payload.dashboard;
                state.transactions = action.payload.transactions;
                state.error = null;
            })
            .addCase(fetchDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || "Failed to load dashbord data";
            });
    },
});

export const {clearDashboardError} = dashboardSlice.actions;
export default dashboardSlice.reducer;
