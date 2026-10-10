import prisma from "../config/prisma.js";

class DashboardRepository {
    async getTotalProducts() {
        return prisma.product.count();
    }

    async getTotalCategories() {
        return prisma.category.count();
    }

    async getTotalSuppliers() {
        return prisma.supplier.count();
    }

    // async getTotalUsers() {
    //     return prisma.user.count();
    // }

    async getUserStats() {
        const [totalUsers, usersByRole] = await Promise.all([
            prisma.user.count(),
            prisma.user.groupBy({
                by: ['role'],
                _count: {
                    id: true
                },
            }),
        ]);

        const stats = {
            totalUsers,
            admin: 0,
            manager: 0,
            staff: 0
        };

        usersByRole.forEach(({role, _count}) => {
            if(role === 'ADMIN') {
                stats.admin = _count.id;
            }
            if(role === 'MANAGER') {
                stats.manager = _count.id;
            }
            if(role === 'STAFF') {
                stats.staff = _count.id;
            }
        });
        return stats;
    }

    async getTotalStock() {
        const result = await prisma.product.aggregate({
            _sum: {
                quantity: true
            },
        });
        return result._sum.quantity ?? 0;
    }

    async getLowStockProducts() {
        const products = await prisma.product.findMany({
            include: {
                category: true,
                supplier: true
            },
            orderBy: {
                quantity: "asc"
            },
        });
        return products.filter((product) => product.quantity <= product.minStock && product.quantity !== 0);
    }

    async getOutOfStockProducts() {
        return prisma.product.count({
            where: {
                quantity: 0
            },
        });
    }
}
export default new DashboardRepository();
