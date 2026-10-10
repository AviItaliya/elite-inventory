import dashboardRepository from "../repositories/dashboardRepository.js";

class DashboardService {
    async getDashboard() {
        const [totalProducts, totalCategories, totalSuppliers, totalStock, lowStockProducts, outOfStockProducts, getAllUsers] = await Promise.all([
            dashboardRepository.getTotalProducts(),
            dashboardRepository.getTotalCategories(),
            dashboardRepository.getTotalSuppliers(),
            dashboardRepository.getTotalStock(),
            dashboardRepository.getLowStockProducts(),
            dashboardRepository.getOutOfStockProducts(),
            dashboardRepository.getUserStats(),
        ]);
        return {
            totalProducts,
            totalCategories,
            totalSuppliers,
            totalStock,
            lowStockProducts: lowStockProducts.length,
            outOfStockProducts,
            getAllUsers
        };
    }
}
export default new DashboardService();