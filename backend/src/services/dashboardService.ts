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
        ] = await Promise.all([
            dashboardRepository.getTotalProducts(),
            dashboardRepository.getTotalCategories(),
            dashboardRepository.getTotalSuppliers(),
            dashboardRepository.getTotalStock(),
            dashboardRepository.getLowStockProducts(),
            dashboardRepository.getOutOfStockProducts(),
            dashboardRepository.getUserStats(),
            dashboardRepository.getFinancialSummary(filters),
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
        };
    }
}

export default new DashboardService();
