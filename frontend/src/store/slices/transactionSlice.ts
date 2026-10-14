import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createInventoryTransaction,
  getInventoryTransactions,
  type InventoryTransaction,
  type InventoryTransactionType,
} from "../../services/inventoryTransactionService";
import axios from "axios";

interface TransactionState {
  transactions: InventoryTransaction[];
  page: number;
  totalPages: number;
  loading: boolean;
  mutationLoading: boolean;
  error: string | null;
  mutationError: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  page: 1,
  totalPages: 1,
  loading: false,
  mutationLoading: false,
  error: null,
  mutationError: null,
};

export const fetchTransactions = createAsyncThunk(
  "transaction/fetchTransactions",
  async (_, { getState, rejectWithValue }) => {
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
  },
);

export const addTransaction = createAsyncThunk<
  Awaited<ReturnType<typeof createInventoryTransaction>>,
  {
    productId: string;
    type: InventoryTransactionType;
    quantity: number;
    remarks: string;
  },
  { rejectValue: string }
>("transaction/addTransaction", async (data, { rejectWithValue }) => {
  try {
    return await createInventoryTransaction(data);
  } catch (error: unknown) {
    console.error("Failed to create transaction:", error);

    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Failed to create transaction.";

      return rejectWithValue(message);
    }

    return rejectWithValue("Failed to create transaction.");
  }
});

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
        state.error =
          (action.payload as string) || "Failed to load transactions.";
      })

      .addCase(addTransaction.pending, (state) => {
        state.mutationLoading = true;
        state.mutationError = null;
      })
      .addCase(addTransaction.fulfilled, (state) => {
        state.mutationLoading = false;
        state.mutationError = null;
      })
      .addCase(addTransaction.rejected, (state, action) => {
        state.mutationLoading = false;
        state.mutationError = action.payload || "Failed to create transaction.";
      });
  },
});

export const { setTransactionPage, clearTransactionError } =
  transactionsSlice.actions;
export default transactionsSlice.reducer;
