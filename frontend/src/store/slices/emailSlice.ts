import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { sendDailyInventorySummary, sendLowStockAlert, sendWeeklyInventoryReport } from "../../services/emailService";

type EmailType = "daily" | "low-stock" | "weekly";

interface EmailState {
    loading: EmailType | "";
    message: string;
    error: string;
}

const initialState: EmailState = {
    loading: "",
    message: "",
    error: "",
};

export const sendDailyEmail = createAsyncThunk("email/sendDailyEmail",
    async(_, {rejectWithValue}) => {
        try {
            await sendDailyInventorySummary();
            return "Daily inventory summary sent successfully.";
        } catch (error) {
            console.error("Failes to send daily inventory summary:", error);
            return rejectWithValue("Failed to send email. Please try again.");
        }
    }
);

export const sendLowStockEmail = createAsyncThunk("email/sendLowStockEmail",
    async(_, {rejectWithValue}) => {
        try {
            await sendLowStockAlert();
            return "Low stock alert sent successfully.";
        } catch (error) {
            console.error("Failed to send low stock alert:", error);
            return rejectWithValue("Failed to send email. Please try again.");
        }
    }
);

export const sendWeeklyEmail = createAsyncThunk("email/sendWeeklyEmail",
    async(_, {rejectWithValue}) => {
        try {
            await sendWeeklyInventoryReport();
            return "Weekly inventory report sent successfully.";
        } catch (error) {
            console.error("Failed to send weekly inventory report:", error);
            return rejectWithValue("Failed to send email. Please try again.");
        }
    }
);

const emailSlice = createSlice({
    name: "email",
    initialState,
    reducers: {
        clearEmailMessage: (state) => {
            state.message = "";
        },
        clearEmailError: (state) => {
            state.error = "";
        },
        clearEmailState: (state) => {
            state.loading = "";
            state.message = "";
            state.error = "";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendDailyEmail.pending, (state) => {
                state.loading = "daily";
                state.message = "";
                state.error = "";
            })
            .addCase(sendDailyEmail.fulfilled, (state, action) => {
                state.loading = "";
                state.message = action.payload;
                state.error = "";
            })
            .addCase(sendDailyEmail.rejected, (state, action) => {
                state.loading = "";
                state.message = "";
                state.error = (action.payload as string) || "Faield to send email. PLease try again.";
            })

            .addCase(sendLowStockEmail.pending, (state) => {
                state.loading = "low-stock";
                state.message = "";
                state.error = "";
            })
            .addCase(sendLowStockEmail.fulfilled, (state,action) => {
                state.loading = "";
                state.message = action.payload;
                state.error = "";
            })
            .addCase(sendLowStockEmail.rejected, (state, action) => {
                state.loading = "";
                state.message = "";
                state.error = (action.payload as string) || "Failed to send email. Please try again.";
            })

             .addCase(sendWeeklyEmail.pending, (state) => {
                state.loading = "weekly";
                state.message = "";
                state.error = "";
            })
            .addCase(sendWeeklyEmail.fulfilled, (state, action) => {
                state.loading = "";
                state.message = action.payload;
                state.error = "";
            })
            .addCase(sendWeeklyEmail.rejected, (state, action) => {
                state.loading = "";
                state.message = "";
                state.error =
                    (action.payload as string) ||
                    "Failed to send email. Please try again.";
            });
    },
});

export const {clearEmailMessage, clearEmailError, clearEmailState} = emailSlice.actions;
export default emailSlice.reducer;