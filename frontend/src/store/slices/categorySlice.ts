import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createCategory, deleteCategory, getCategories, getCategoriesById, updateCategory, type Category } from "../../services/categoryService";

interface CategoryState {
    categories: Category[];
    selectedCategory: Category | null;
    loading: boolean;
    mutationLoading: boolean;
    error: string | null;
}

const initialState: CategoryState = {
    categories: [],
    selectedCategory: null,
    loading: false,
    mutationLoading: false,
    error: null,
};

export const fetchCategories = createAsyncThunk("category/fetchCategories", 
    async(_, {rejectWithValue}) => {
        try {
            return await getCategories();
        } catch (error) {
            console.error("Failed to load categories:", error);
            return rejectWithValue("Failed to load categories.");
        }
    }
);

export const fetchCategoryById = createAsyncThunk("category/fetchCategoryById",
    async(id: string, {rejectWithValue}) => {
        try {
            return await getCategoriesById(id);
        } catch (error) {
            console.error("Failed to load category:", error);
            return rejectWithValue("Failed to load category.");
        }
    }
);

export const addCategory = createAsyncThunk("category/addCategory",
    async(data: {name: string}, {rejectWithValue}) => {
        try {
            return await createCategory(data);
        } catch (error) {
            console.error("Failed to create category:", error);
            return rejectWithValue("Failed to create category.");
        }
    }
);

export const editCategory = createAsyncThunk("category/editCategory", 
    async(data: {id: string; category: {name: string};},{rejectWithValue}) => {
        try {
            return await updateCategory(data.id, data.category);
        } catch (error) {
            console.error("Failed to update category:", error);
            return rejectWithValue("Failed to update category.");
        }
    }
);

export const removeCategory = createAsyncThunk("category/removeCategory",
    async(id: string, {rejectWithValue}) => {
        try {
            await deleteCategory(id);
            return id;
        } catch (error) {
            console.error("Failed to delete category:", error);
            return rejectWithValue("Failed to delete category.");
        }
    }
);

const categorySlice = createSlice({
    name: "category", 
    initialState,
    reducers: {
        clearSelectedCategory: (state) => {
            state.selectedCategory = null;
        },

        clearCategoryError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder

        // Fetch categories
        .addCase(fetchCategories.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchCategories.fulfilled, (state, action) => {
            state.loading = false;
            state.categories = action.payload;
            state.error = null;
        })
        .addCase(fetchCategories.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as string) || "Failed to load categorie.";
        })

        // Fetch category by id
        .addCase(fetchCategoryById.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchCategoryById.fulfilled, (state, action) => {
            state.loading = false;
            state.selectedCategory = action.payload;
            state.error = null;
        })
        .addCase(fetchCategoryById.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as string) || "Failed to load category.";
        })

        // Create category
        .addCase(addCategory.pending, (state) => {
            state.mutationLoading = true;
            state.error = null;
        })
        .addCase(addCategory.fulfilled, (state, action) => {
            state.mutationLoading = false;
            state.categories.push(action.payload);
            state.error = null;
        })
        .addCase(addCategory.rejected, (state, action) => {
            state.mutationLoading = false;
            state.error = (action.payload as string) || "Failed to create category.";
        })

        // Update category
        .addCase(editCategory.pending, (state) => {
            state.mutationLoading = true;
            state.error = null;
        })
        .addCase(editCategory.fulfilled, (state, action) => {
            state.mutationLoading = false;
            state.categories = state.categories.map((category) => category.id === action.payload.id ? action.payload : category);
            state.selectedCategory = action.payload;
            state.error = null;
        })
        .addCase(editCategory.rejected, (state, action) => {
            state.mutationLoading = false;
            state.error = (action.payload as string) || "Failed to update category.";
        })

        // Delete category
        .addCase(removeCategory.pending, (state) => {
            state.mutationLoading = true;
            state.error = null;
        })
        .addCase(removeCategory.fulfilled, (state, action) => {
            state.mutationLoading = false;
            state.categories = state.categories.filter((category) => category.id !== action.payload);
            state.error = null;
        })
        .addCase(removeCategory.rejected, (state, action) => {
            state.mutationLoading = false;
            state.error = (action.payload as string) || "Failed to delete category.";
        });
    },
});

export const {clearSelectedCategory, clearCategoryError} = categorySlice.actions;
export default categorySlice.reducer;
