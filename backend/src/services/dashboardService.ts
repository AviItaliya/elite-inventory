import dashboardRepository from "../repositories/dashboardRepository.js";

class DashboardService {
    async getDashboard(filters: {
        startDate?: Date;
        endDate?: Date;
    } = {}) {
        const [
            totalProducts,
            totalCategories,
            totalSuppliers,
            totalStock,
            lowStockProducts,
            outOfStockProducts,
            getAllUsers,
            financialSummary,
            inventoryValuation
        ] = await Promise.all([
            dashboardRepository.getTotalProducts(),
            dashboardRepository.getTotalCategories(),
            dashboardRepository.getTotalSuppliers(),
            dashboardRepository.getTotalStock(),
            dashboardRepository.getLowStockProducts(),
            dashboardRepository.getOutOfStockProducts(),
            dashboardRepository.getUserStats(),
            dashboardRepository.getFinancialSummary(filters),
            dashboardRepository.getInventoryValuation()
        ]);

        return {
            totalProducts,
            totalCategories,
            totalSuppliers,
            totalStock,
            lowStockProducts: lowStockProducts.length,
            outOfStockProducts,
            getAllUsers,
            financialSummary,
            inventoryValuation,
        };
    }
}

export default new DashboardService();
