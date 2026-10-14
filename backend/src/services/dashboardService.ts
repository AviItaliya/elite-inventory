import dashboardRepository from "../repositories/dashboardRepository.js";

class DashboardService {
<<<<<<< HEAD
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
=======
    async getDashboard() {
        const [totalProducts, totalCategories, totalSuppliers, totalStock, lowStockProducts, outOfStockProducts, getAllUsers] = await Promise.all([
>>>>>>> origin/main
            dashboardRepository.getTotalProducts(),
            dashboardRepository.getTotalCategories(),
            dashboardRepository.getTotalSuppliers(),
            dashboardRepository.getTotalStock(),
            dashboardRepository.getLowStockProducts(),
            dashboardRepository.getOutOfStockProducts(),
            dashboardRepository.getUserStats(),
<<<<<<< HEAD
            dashboardRepository.getFinancialSummary(filters),
            dashboardRepository.getInventoryValuation()
        ]);

=======
        ]);
>>>>>>> origin/main
        return {
            totalProducts,
            totalCategories,
            totalSuppliers,
            totalStock,
            lowStockProducts: lowStockProducts.length,
            outOfStockProducts,
<<<<<<< HEAD
            getAllUsers,
            financialSummary,
            inventoryValuation,
        };
    }
}

export default new DashboardService();
=======
            getAllUsers
        };
    }
}
export default new DashboardService();
>>>>>>> origin/main
