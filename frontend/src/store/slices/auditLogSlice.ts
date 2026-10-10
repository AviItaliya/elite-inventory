import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAuditLogs, type AuditLog } from "../../services/auditLogService";

interface AuditLogState {
    logs: AuditLog[];
    page: number;
    totalPages: number;
    action: string;
    entity: string;
    userId: string;
    loading: boolean;
    error: string | null;
}

const initialState: AuditLogState = {
    logs: [],
    page: 1,
    totalPages: 1,
    action : "",
    entity: "",
    userId: "",
    loading: false,
    error: null
};

export const fetchAuditLogs = createAsyncThunk("auditLog/fetchAuditLogs",
    async (_, {getState, rejectWithValue}) => {
        try {
            const state = getState() as {
                auditLog: AuditLogState;
            };
            const {page, action, entity, userId} = state.auditLog;
            return await getAuditLogs(page, 10, action, entity, userId);
        } catch (error) {
            console.error("Failed to load audit logs:", error);
            return rejectWithValue("Failed to load audit logs.");
        }
    }
);

const auditLogSlice = createSlice({
    name: "auditLog",
    initialState,
    reducers: {
        setAuditLogPage: (state, action) => {
            state.page = action.payload;
        },
        setAuditLogAction: (state, action) => {
            state.action = action.payload;
            state.page = 1;
        },
        setAuditLogEntity: (state, action) => {
            state.entity = action.payload;
            state.page = 1;
        },
        setAuditLogUserId: (state, action) => {
            state.userId = action.payload;
            state.page = 1;
        },
        clearAuditLogError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchAuditLogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAuditLogs.fulfilled, (state, action) => {
                state.loading = false;
                state.logs = action.payload.logs;
                state.totalPages = action.payload.pagination.totalPages;
                state.error = null; 
            })
            .addCase(fetchAuditLogs.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || "Failed to load audit logs.";
            });
    },
});

export const {setAuditLogPage, setAuditLogAction, setAuditLogEntity, setAuditLogUserId, clearAuditLogError} = auditLogSlice.actions;
export default auditLogSlice.reducer;
