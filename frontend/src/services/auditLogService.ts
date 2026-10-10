import api from "./api";

export interface AuditLogUser {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "MANAGER" | "STAFF";
}

export interface AuditLog {
    id: string;
    userId: string | null;
    action: string;
    entity: string;
    entityId: string;
    details: string;
    createdAt: string;
    user: AuditLogUser | null;
}

interface AuditLogsResponse {
    success: boolean;
    message: string;
    data: {
        logs: AuditLog[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

interface AuditLogResponse {
    success: boolean;
    message: string;
    data: AuditLog;
}

export const getAuditLogs = async (page = 1, limit = 1, action = "", entity = "", userId = "") => {
    const res = await api.get<AuditLogsResponse>("/api/audit-logs", {
        params: {
            page, limit, ...(action ? {action} : {}),
            ...(entity ? {entity} : {}),
            ...(userId ? {userId} : {})
        },
    });
    return res.data.data;
};

export const getAuditLogById = async (id:string) => {
    const res = await api.get<AuditLogResponse>(
        `/api/audit-logs/${id}`
    );
    return res.data.data;
};