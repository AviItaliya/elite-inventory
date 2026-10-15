import api from "./api";

export interface FinancialReportFilters {
  startDate?: string;
  endDate?: string;
}

export type FinancialReportFormat = "pdf" | "excel";

export const downloadFinancialReport = async (
  format: FinancialReportFormat,
  filters: FinancialReportFilters = {},
): Promise<void> => {
  const response = await api.get<Blob>(
    `/api/reports/financial/${format}`,
    {
      params: filters,
      responseType: "blob",
    },
  );

  const contentType =
    format === "pdf"
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  const extension = format === "pdf" ? "pdf" : "xlsx";

  const blob = new Blob([response.data], {
    type: contentType,
  });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  const period =
    filters.startDate && filters.endDate
      ? `${filters.startDate}_to_${filters.endDate}`
      : "all_time";

  link.href = url;
  link.download = `elite_inventory_financial_${period}.${extension}`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
};