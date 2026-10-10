import api from "./api";

export const sendLowStockAlert = async () => {
    const response = await api.post("/api/email/low-stock");

    return response.data;
};

export const sendDailyInventorySummary = async () => {
    const response = await api.post("/api/email/daily-summary");

    return response.data;
};

export const sendWeeklyInventoryReport = async () => {
    const response = await api.post("/api/email/weekly-report");

    return response.data;
};