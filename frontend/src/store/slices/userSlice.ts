import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createUser, deleteUser, getUserById, getUsers, updateUser, updateUserStatus, type User, type UserRole } from "../../services/userService";

interface UserState {
    users: User[];
    selectedUser: User | null;
    page: number;
    totalPages: number;
    searchQuery: string;
    role: UserRole | "";
    status: "ACTIVE" | "INACTIVE" | "";
    loading: boolean;
    mutationLoading: boolean;
    error: string | null;
}

const initialState: UserState = {
    users: [],
    selectedUser: null,
    page: 1,
    totalPages: 1,
    searchQuery: "",
    role: "",
    status: "",
    loading: false,
    mutationLoading: false,
    error: null,
};

export const fetchUsers = createAsyncThunk("user/fetchUsers",
    async(_, {getState, rejectWithValue}) => {
        try {
            const state = getState() as {
                user: UserState;
            };
            const {page, searchQuery, role, status} = state.user;
            const isActive = status === "ACTIVE" ? "true" : status === "INACTIVE" ? "false" : "";
            return await getUsers(page, 10, searchQuery, role, isActive);
        } catch (error) {
            console.error("Failed to load users:", error);
            return rejectWithValue("Failed to load users.");
        }
    }
);

export const fetchUserById = createAsyncThunk("user/fetchUserById",
    async(id: string, {rejectWithValue}) => {
        try {
            return await getUserById(id);
        } catch (error) {
            console.error("Failed to load user:", error);
            return rejectWithValue("Failed to load user.");
        }
    }
);

export const addUser = createAsyncThunk("user/addUser",
    async(
        data: {
            name: string;
            email: string;
            password: string;
            role: UserRole;
        },
        {rejectWithValue}
    ) => {
        try {
            return await createUser(data);
        } catch (error) {
            console.error("Failed to create user:", error);
            return rejectWithValue("Failed to create user.");
        }
    }
);

export const editUser = createAsyncThunk("user/editUser",
    async(data: {
        id: string;
        user: {
            name?: string;
            email?: string;
            role?: UserRole;
        };
    }, {rejectWithValue}) => {
        try {
            return await updateUser(data.id, data.user);
        } catch (error) {
            console.error("Failed to update user:", error);
            return rejectWithValue("Failed to update user.");
        }
    }
);

export const changeUserStatus = createAsyncThunk("user/changeUserStatus",
    async(
        data: {id: string, isActive: boolean;}, {rejectWithValue}) => {
            try {
                await updateUserStatus(data.id, data.isActive);
                return data;
            } catch(error) {
                console.error("Failed to update user status:", error);
                return rejectWithValue("Failed to update user status.");
            }
    }
);

export const removeUser = createAsyncThunk("user/removeUser", 
    async(id: string, {rejectWithValue}) => {
        try {
            await deleteUser(id);
            return id;
        } catch (error) {
            console.error("Failed to delete user:", error);
            return rejectWithValue("Failed to delete user.");
        }
    }
);

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserPage: (state, action) => {
            state.page = action.payload;
        },
        setSearchQuery: (state, action) => {
            state.role = action.payload;
            state.page = 1;
        },
        setRole: (state, action) => {
            state.role = action.payload;
            state.page = 1;
        },
        setStatus: (state, action) => {
            state.status = action.payload;
            state.page = 1;
        },
        clearSelectedUser: (state) => {
            state.selectedUser = null;
        },
        clearUserError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder

        // Fetch users
        .addCase(fetchUsers.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchUsers.fulfilled, (state, action) => {
            state.loading = false;
            state.users = action.payload.users;
            state.totalPages = action.payload.pagination.totalPages;
            state.error = null;
        })
        .addCase(fetchUsers.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as string) || "Failed to load users.";
        })
        
        // Fetch user by id
        .addCase(fetchUserById.pending, (state) => {
            state.loading = true;
            state.error = null;
        })

        .addCase(fetchUserById.fulfilled, (state, action) => {
            state.loading = false;
            state.selectedUser = action.payload;
            state.error = null;
        })
        .addCase(fetchUserById.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as string) || "Failed to load user.";
        })

        // Create user
        .addCase(addUser.pending, (state) => {
            state.mutationLoading = true;
            state.error = null;
        })
        .addCase(addUser.fulfilled, (state, action) => {
            state.mutationLoading = false;
            state.users.push(action.payload);
            state.error = null;
        })
        .addCase(addUser.rejected, (state, action) => {
            state.mutationLoading = false;
            state.error = (action.payload as string) || "Failed to create user.";
        })

        // Update user
        .addCase(editUser.pending, (state) => {
            state.mutationLoading = true;
            state.error = null;
        })
        .addCase(editUser.fulfilled, (state, action) => {
            state.mutationLoading = false;
            state.users = state.users.map((user) => user.id === action.payload.id ? action.payload : user);
            state.selectedUser = action.payload;
            state.error = null;
        })

        .addCase(editUser.rejected, (state, action) => {
            state.mutationLoading = false;
            state.error = (action.payload as string) || "Failed to update user.";
        })

        // update user status
        .addCase(changeUserStatus.pending, (state) => {
            state.mutationLoading = true;
            state.error = null;
        })
        .addCase(changeUserStatus.fulfilled, (state, action) => {
            state.mutationLoading = false;
            state.users = state.users.map((user) => user.id === action.payload.id ? {...user, isActive: action.payload.isActive}: user);
            state.error = null;
        })
        .addCase(changeUserStatus.rejected, (state, action) => {
            state.mutationLoading = false;
            state.error = (action.payload as string) || "Failed to update user status.";
        })

        // Delete user
        .addCase(removeUser.pending, (state) => {
            state.mutationLoading = true;
            state.error = null;
        })

        .addCase(removeUser.fulfilled, (state, action) => {
            state.mutationLoading = false;
            state.users = state.users.filter((user) => user.id !== action.payload);
            state.error = null;
        })
        .addCase(removeUser.rejected, (state, action) => {
            state.mutationLoading = false;
            state.error = (action.payload as string) || "Failed to delete user.";
        });
    },
});
export const {setUserPage, setSearchQuery, setRole, setStatus, clearSelectedUser, clearUserError} = userSlice.actions;
export default userSlice.reducer;
