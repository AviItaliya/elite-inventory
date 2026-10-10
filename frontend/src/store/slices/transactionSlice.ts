import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createInventoryTransaction, getInventoryTransactions, type InventoryTransaction, type InventoryTransactionType } from "../../services/inventoryTransactionService";

interface TransactionState {
    transactions: InventoryTransaction[];
    page: number;
    totalPages: number;
    loading: boolean;
    mutationLoading: boolean;
    error: string | null;
}

const initialState: TransactionState = {
    transactions: [],
    page: 1,
    totalPages: 1,
    loading: false,
    mutationLoading: false,
    error: null,    
};

export const fetchTransactions = createAsyncThunk("transaction/fetchTransactions",
    async(_, {getState, rejectWithValue}) => {
        try {
            const state = getState() as {
                transaction: TransactionState;
            };
            const data = await getInventoryTransactions(state.transaction.page, 10);
            return data;
        } catch (error) {
            console.error("Failed to load transactions:", error);
            return rejectWithValue("Failed to load transactions.");
        }
    }
);

export const addTransaction = createAsyncThunk("transaction/addTransaction",
    async(
        data: {
            productId: string;
            type: InventoryTransactionType;
            quantity: number;
            remarks: string;
        }, {rejectWithValue}
    ) => {
        try {
            return await createInventoryTransaction(data);
        } catch (error) {
            console.error("Failed to create transaction:", error);
            return rejectWithValue("Failed to create transaction.");
        }
    }
);

const transactionsSlice = createSlice({
    name: "transaction",
    initialState,
    reducers: {
        setTransactionPage: (state, action) => {
            state.page = action.payload;
        },
        clearTransactionError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload.transactions;
                state.totalPages = action.payload.pagination.totalPages;
                state.error = null;
            })
            .addCase(fetchTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || "Failed to load transactions.";
            })

            .addCase(addTransaction.pending, (state) => {
                state.mutationLoading = true;
                state.error = null;
            })
            .addCase(addTransaction.fulfilled, (state) => {
                state.mutationLoading = false;
                state.error = null;
            })
            .addCase(addTransaction.rejected, (state, action) => {
                state.mutationLoading = false;
                state.error = (action.payload as string) || "Failed to create transaction.";
            });
    },
});

export const {setTransactionPage, clearTransactionError} = transactionsSlice.actions;
export default transactionsSlice.reducer;
