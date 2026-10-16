import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
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
  currentRequestId: string | null;
}

const initialState: AuditLogState = {
  logs: [],
  page: 1,
  totalPages: 1,
  action: "",
  entity: "",
  userId: "",
  loading: false,
  error: null,
  currentRequestId: null,
};

export const fetchAuditLogs = createAsyncThunk(
  "auditLog/fetchAuditLogs",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { page, action, entity, userId } = (
        getState() as { auditLog: AuditLogState }
      ).auditLog;
      return await getAuditLogs(page, 10, action, entity, userId);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
      return rejectWithValue("Failed to load audit logs.");
    }
  },
);

const auditLogSlice = createSlice({
  name: "auditLog",
  initialState,
  reducers: {
    setAuditLogPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setAuditLogAction: (state, action: PayloadAction<string>) => {
      state.action = action.payload;
      state.page = 1;
    },
    setAuditLogEntity: (state, action: PayloadAction<string>) => {
      state.entity = action.payload;
      state.page = 1;
    },
    setAuditLogUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
      state.page = 1;
    },
    clearAuditLogError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.currentRequestId = null;
        state.logs = action.payload.logs;
        state.totalPages = Math.max(1, action.payload.pagination.totalPages);
        state.error = null;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.currentRequestId = null;
        state.error =
          (action.payload as string) || "Failed to load audit logs.";
      });
  },
});

export const {
  setAuditLogPage,
  setAuditLogAction,
  setAuditLogEntity,
  setAuditLogUserId,
  clearAuditLogError,
} = auditLogSlice.actions;
export default auditLogSlice.reducer;
