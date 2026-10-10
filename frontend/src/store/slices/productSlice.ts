import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createProduct, deleteProduct, downloadProductTemplate, exportProducts, getProductById, getProducts, importProducts, updateProduct, type Product } from "../../services/productService";

interface ProductState {
    products: Product[];
    selectedProduct: Product | null;
    page: number;
    totalPages: number;
    searchQuery: string;
    categoryId: string;
    supplierId: string;
    sortBy: string;
    order: string;
    loading: boolean;
    error: string | null;
    mutationLoading: boolean;
}

const initialState: ProductState = {
    products: [],
    selectedProduct: null,
    page: 1,
    totalPages: 1,
    searchQuery: "",
    categoryId: "",
    supplierId: "",
    sortBy: "createdAt",
    order: "desc",
    loading: false,
    error: null,
    mutationLoading: false,
};

export const fetchProducts = createAsyncThunk("products/fetchProducts",
    async(_, {getState, rejectWithValue}) => {
        try {
            const state = getState() as {
                product: ProductState;
            };
            const {page, searchQuery, categoryId, supplierId, sortBy, order} = state.product;
            const data = await getProducts(page, 10, searchQuery, categoryId, supplierId, sortBy, order);
            return data;
        } catch (error) {
            console.error("Failed to load products:", error);
            return rejectWithValue("Failed to load products.");
        }
    }
);

export const fetchProductById = createAsyncThunk("products/fetchProductById", 
    async (id: string, {rejectWithValue}) => {
        try {
            const product = await getProductById(id);
            return product;
        } catch (error) {
            console.error("Failed to load product:", error);
            return rejectWithValue("Failed to load product.");
        }
    }
);

export const addProduct = createAsyncThunk("products/addProduct",
    async(data: Parameters<typeof createProduct>[0], {rejectWithValue}) => {
        try {
            return await createProduct(data);
        } catch (error) {
            console.error("Failed to create product:", error);
            return rejectWithValue("Failed to create product.");
        }
    }
);

export const editProduct = createAsyncThunk("products/editProduct", 
    async (data: {id: string; product: Parameters<typeof updateProduct>[1];}, {rejectWithValue}) => {
        try {
            return await updateProduct(data.id, data.product);
        } catch (error) {
            console.error("Failed to update product:", error);
            return rejectWithValue("Failed to update product.");
        }
    }
);

export const removeProduct = createAsyncThunk("products/removeProduct", 
    async(id: string, {rejectWithValue}) => {
        try {
            await deleteProduct(id);
            return id;
        } catch (error) {
            console.error("Failed to delete product:", error);
            return rejectWithValue("Failed to delete product.");
        }
    }
);

export const exportProductFile = createAsyncThunk("products/exportProductFile", 
    async(_, {rejectWithValue}) => {
        try {
            return await exportProducts();
        } catch (error) {
            console.error("Failed to export products:", error);
            return rejectWithValue("Failed to export products.");
        }
    }
);

export const importProductFile = createAsyncThunk("products/importProductFile", 
    async(file: File, {rejectWithValue}) => {
        try {
            return await importProducts(file);
        } catch (error) {
            console.error("Failed to import products:", error);
            return rejectWithValue("Failed to import products.");
        }
    }
);

export const downloadProductTemplateFile = createAsyncThunk("products/downloadProductTemplateFile",
    async(_, {rejectWithValue}) => {
        try {
            return await downloadProductTemplate();
        } catch (error) {
            console.error("Failed to download product template:", error);
            return rejectWithValue("Failed to download product template.");
        }
    }
);

const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {
        setPage: (state, action) => {
            state.page = action.payload;
        },
        setSearchQuery: (state,action) => {
            state.searchQuery = action.payload;
            state.page = 1;
        },
        setCategoryId: (state, action) => {
            state.categoryId = action.payload;
            state.page = 1;
        },
        setSupplierId: (state, action) => {
            state.supplierId = action.payload;
            state.page = 1;
        },
        setSortBy: (state, action) => {
            state.sortBy = action.payload;
            state.page = 1;
        },
        setOrder: (state, action) => {
            state.order = action.payload;
            state.page = 1;
        },
        clearSelectedProduct: (state) => {
            state.selectedProduct = null;
        },
        clearProductError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder

        // Fetch products
        .addCase(fetchProducts.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchProducts.fulfilled, (state, action) => {
            state.loading = false;
            state.products = action.payload.products;
            state.totalPages = action.payload.pagination.totalPages;
            state.error = null;
        })
        .addCase(fetchProducts.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as string) || "Failed to load products.";
        })

        // Fetchsingle product
        .addCase(fetchProductById.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchProductById.fulfilled, (state, aciton) => {
            state.loading = false;
            state.selectedProduct = aciton.payload;
            state.error = null;
        })
        .addCase(fetchProductById.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as string) || "Failed to load product.";
        })

        // Create
        .addCase(addProduct.pending, (state) => {
            state.mutationLoading = true;
            state.error = null;
        })
        .addCase(addProduct.fulfilled, (state, action) => {
            state.mutationLoading = false;
            state.products.unshift(action.payload);
            state.error = null;
        })
        .addCase(addProduct.rejected, (state, action) => {
            state.mutationLoading = false;
            state.error = (action.payload as string) || "Failed to create product.";
        })

        // Update
        .addCase(editProduct.pending, (state) => {
            state.mutationLoading = true;
            state.error = null;
        })
        .addCase(editProduct.fulfilled, (state, action) => {
            state.mutationLoading = false;
            state.products = state.products.map((product) => 
                product.id === action.payload.id ? action.payload : product);
            state.selectedProduct = action.payload;
            state.error = null;
        })
        .addCase(editProduct.rejected, (state, action) => {
            state.mutationLoading = false;
            state.error = (action.payload as string) || "Failed to update product.";
        })

        // Delete
        .addCase(removeProduct.pending, (state) => {
            state.mutationLoading = true;
            state.error = null;
        })

        .addCase(removeProduct.fulfilled, (state, action) => {
            state.mutationLoading = false;
            state.products = state.products.filter((product) => product.id !== action.payload);
            state.error = null;
        })
        .addCase(removeProduct.rejected, (state, action) => {
            state.mutationLoading = false;
            state.error = (action.payload as string) || "Failed to delet product.";
        })
        
        // Import
        .addCase(importProductFile.pending, (state) => {
            state.mutationLoading = true;
            state.error = null;
        })
        .addCase(importProductFile.fulfilled, (state) => {
            state.mutationLoading = false;
            state.error = null;
        })
        .addCase(importProductFile.rejected, (state, action) => {
            state.mutationLoading = false;
            state.error = (action.payload as string) || "Failed to import products.";
        });
    },
});

export const {setPage, setSearchQuery, setCategoryId, setSupplierId, setSortBy, setOrder, clearSelectedProduct, clearProductError} = productSlice.actions;
export default productSlice.reducer;
