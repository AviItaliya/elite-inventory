import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCategories, type Category } from "../../services/categoryService";
import { getProducts, type Product } from "../../services/productService";
import { getSuppliers, type Supplier } from "../../services/supplierService";

interface InventoryState {
    products: Product[];
    categories: Category[];
    suppliers: Supplier[];
    searchQuery: string;
    categoryId: string;
    supplierId: string;
    status: string;
    loading: boolean;
    error: string | null;
}

const initialState: InventoryState = {
    products: [],
    categories: [],
    suppliers: [],
    searchQuery: "",
    categoryId: "",
    supplierId: "",
    status: "",
    loading: false,
    error: null,
};

export const fetchInventory = createAsyncThunk("inventory/fetchInventory",
    async(_, {getState, rejectWithValue}) => {
        try {
            const state = getState() as {
                inventory: InventoryState;
            };
            const {searchQuery, categoryId, supplierId} = state.inventory;
            const data = await getProducts(1, 100, searchQuery, categoryId, supplierId, "name", "asc");
            return data.products;
        } catch (error) {
            console.error("Failed to load inventory:", error);
            return rejectWithValue("Failed to load inventory.");
        }
    }
);

export const fetchInventoryFilters = createAsyncThunk("inventory/fetchInventoryFilters",
    async(_, {rejectWithValue}) => {
        try {
            const[categoryData, supplierData] = await Promise.all([getCategories(), getSuppliers()]);
            return {
                categories: categoryData,
                suppliers: supplierData,
            };
        } catch (error) {
            console.error("Failed to load inventory filters:", error);
            return rejectWithValue("Failed to load inventory filters.");
        }
    }
);

const inventorySlice = createSlice({
    name: "inventory",
    initialState,
    reducers: {
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        setCategoryId: (state, action) => {
            state.categoryId = action.payload;
        },
        setSupplierId: (state, action) => {
            state.supplierId = action.payload;
        },
        setStatus: (state, action) => {
            state.status = action.payload;
        },
        clearInventoryError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchInventory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInventory.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload;
                state.error = null;
            })
            .addCase(fetchInventory.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || "Failed to load inventory.";
            })

            .addCase(fetchInventoryFilters.fulfilled, (state, action) => {
                state.categories = action.payload.categories;
                state.suppliers = action.payload.suppliers;
            })
            .addCase(fetchInventoryFilters.rejected, (state, action) => {
                state.error = (action.payload as string) || "Failed to load inventory filters.";
            });
    },
});

export const {setSearchQuery, setCategoryId, setSupplierId, setStatus, clearInventoryError} = inventorySlice.actions;
export default inventorySlice.reducer;
