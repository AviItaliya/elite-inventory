import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createSupplier, deleteSupplier, getSupplierById, getSuppliers, updateSupplier, type Supplier } from "../../services/supplierService";

interface SupplierState {
  suppliers: Supplier[];
  selectedSupplier: Supplier | null;
  loading: boolean;
  mutationLoading: boolean;
  error: string | null;
  mutationError: string | null;
  currentListRequestId: string | null;
  currentDetailRequestId: string | null;
}

const initialState: SupplierState = {
  suppliers: [],
  selectedSupplier: null,
  loading: false,
  mutationLoading: false,
  error: null,
  mutationError: null,
  currentListRequestId: null,
  currentDetailRequestId: null,
};

export const fetchSuppliers = createAsyncThunk(
  "supplier/fetchSuppliers",
  async (_, { rejectWithValue }) => {
    try {
      return await getSuppliers();
    } catch (error) {
      console.error("Failed to load suppliers:", error);
      return rejectWithValue("Failed to load suppliers.");
    }
  },
);

export const fetchSupplierById = createAsyncThunk(
  "supplier/fetchSupplierById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await getSupplierById(id);
    } catch (error) {
      console.error("Failed to load supplier:", error);
      return rejectWithValue("Failed to load supplier.");
    }
  },
);

export const addSupplier = createAsyncThunk(
  "supplier/addSupplier",
  async (
    data: {
      name: string;
      email: string;
      phone: string;
    },
    { rejectWithValue },
  ) => {
    try {
      return await createSupplier(data);
    } catch (error) {
      console.error("Failed to create supplier:", error);
      return rejectWithValue("Failed to create supplier.");
    }
  },
);

export const editSupplier = createAsyncThunk(
  "supplier/editSupplier",
  async (
    data: {
      id: string;
      supplier: {
        name: string;
        email: string;
        phone: string;
      };
    },
    { rejectWithValue },
  ) => {
    try {
      return await updateSupplier(data.id, data.supplier);
    } catch (error) {
      console.error("Failed to update supplier:", error);
      return rejectWithValue("Failed to update supplier.");
    }
  },
);

export const removeSupplier = createAsyncThunk(
  "supplier/removeSupplier",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteSupplier(id);
      return id;
    } catch (error) {
      console.error("Failed to delete supplier:", error);
      return rejectWithValue("Failed to delete supplier.");
    }
  },
);

const supplierSlice = createSlice({
  name: "supplier",
  initialState,
  reducers: {
    clearSelectedSupplier: (state) => {
      state.selectedSupplier = null;
    },
    clearSupplierError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuppliers.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentListRequestId = action.meta.requestId;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        if (state.currentListRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.suppliers = action.payload;
        state.error = null;
        state.currentListRequestId = null;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        if (state.currentListRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.error = (action.payload as string) || "Failed to load suppliers.";
        state.currentListRequestId = null;
      })

      .addCase(fetchSupplierById.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentDetailRequestId = action.meta.requestId;
      })
      .addCase(fetchSupplierById.fulfilled, (state, action) => {
        if (state.currentDetailRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.selectedSupplier = action.payload;
        state.error = null;
        state.currentDetailRequestId = null;
      })
      .addCase(fetchSupplierById.rejected, (state, action) => {
        if (state.currentDetailRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.error = (action.payload as string) || "Failed to load supplier.";
        state.currentDetailRequestId = null;
      })

      .addCase(addSupplier.pending, (state) => {
        state.mutationLoading = true;
        state.mutationError = null;
      })
      .addCase(addSupplier.fulfilled, (state, action) => {
        state.mutationLoading = false;
        state.suppliers.push(action.payload);
        state.mutationError = null;
      })
      .addCase(addSupplier.rejected, (state, action) => {
        state.mutationLoading = false;
        state.mutationError =
          (action.payload as string) || "Failed to create supplier.";
      })

      .addCase(editSupplier.pending, (state) => {
        state.mutationLoading = true;
        state.mutationError = null;
      })
      .addCase(editSupplier.fulfilled, (state, action) => {
        state.mutationLoading = false;
        state.suppliers = state.suppliers.map((supplier) =>
          supplier.id === action.payload.id ? action.payload : supplier,
        );
        state.selectedSupplier = action.payload;
        state.mutationError = null;
      })
      .addCase(editSupplier.rejected, (state, action) => {
        state.mutationLoading = false;
        state.mutationError =
          (action.payload as string) || "Failed to update supplier.";
      })

      .addCase(removeSupplier.pending, (state) => {
        state.mutationLoading = true;
        state.mutationError = null;
      })
      .addCase(removeSupplier.fulfilled, (state, action) => {
        state.mutationLoading = false;
        state.suppliers = state.suppliers.filter(
          (supplier) => supplier.id !== action.payload,
        );
        state.mutationError = null;
      })
      .addCase(removeSupplier.rejected, (state, action) => {
        state.mutationLoading = false;
        state.mutationError =
          (action.payload as string) || "Failed to delete supplier.";
      });
  },
});

export const { clearSelectedSupplier, clearSupplierError } =
  supplierSlice.actions;
export default supplierSlice.reducer;
