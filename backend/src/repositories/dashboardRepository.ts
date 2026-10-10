import prisma from "../config/prisma.js";
import { Prisma } from "../generated/prisma/client.js";

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
    
    async getFinancialSummary(filters: {
        startDate?: Date;
        endDate?: Date;
    }) {
        const createdAt: Prisma.DateTimeFilter = {};
        if (filters.startDate) {
            createdAt.gte = filters.startDate;
        }
        if (filters.endDate) {
            createdAt.lt = filters.endDate;
        }
        const transactions = await prisma.inventoryTransaction.findMany({
            where: {
                type: "STOCK_OUT",
                createdAt,
                revenue: {
                    not: null,
                },
                costOfGoods: {
                    not: null,
                },
                grossProfit: {
                    not: null,
                },
            },
            select: {
                revenue: true,
                costOfGoods: true,
                grossProfit: true,
            },
        });

        const totals = transactions.reduce(
            (summary, transaction) => ({
                revenue: summary.revenue.add(
                    transaction.revenue ?? new Prisma.Decimal(0)
                ),
                cogs: summary.cogs.add(
                    transaction.costOfGoods ?? new Prisma.Decimal(0)
                ),
                grossProfit: summary.grossProfit.add(
                    transaction.grossProfit ?? new Prisma.Decimal(0)
                ),
            }),
            {
                revenue: new Prisma.Decimal(0),
                cogs: new Prisma.Decimal(0),
                grossProfit: new Prisma.Decimal(0),
            }
        );

        return {
            revenue: totals.revenue.toFixed(2),
            cogs: totals.cogs.toFixed(2),
            grossProfit: totals.grossProfit.toFixed(2),
            salesTransactions: transactions.length,
        };
    }
}
export default new DashboardRepository();