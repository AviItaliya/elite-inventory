import api from "./api";

export interface FinancialSummary {
  revenue: string;
  cogs: string;
  grossProfit: string;
  salesTransactions: number;
}

export interface InventoryValuation {
  inventoryCost: string;
  potentialSellingValue: string;
  potentialGrossMargin: string;
}

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
}

export interface DashboardData {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  totalStock: number;
  lowStockProducts: number;
  outOfStockProducts: number;

  getAllUsers: {
    totalUsers: number;
    admin: number;
    manager: number;
    staff: number;
  };

  financialSummary: FinancialSummary;
  inventoryValuation: InventoryValuation;
}

export const getDashboard = async (filters: DashboardFilters = {}): Promise<DashboardData> => {
  const res = await api.get<{ data: DashboardData }>("/api/dashboard", {
    params: filters,
  });
  return res.data.data;
};