import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Boxes,
    CalendarDays,
    ClipboardList,
    Package,
    Plus,
    Truck,
    Users,
    Warehouse,
    XCircle,
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchDashboard } from "../../store/slices/dashboardSlice";

function Dashboard() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const dashboard = useAppSelector((state) => state.dashboard.dashboard);
    const transactions = useAppSelector((state) => state.dashboard.transactions);
    const loading = useAppSelector((state) => state.dashboard.loading);
    const error = useAppSelector((state) => state.dashboard.error);

    useEffect(() => {
        void dispatch(fetchDashboard());
    }, [dispatch]);

    const getGreeting = () => {
        const hour = new Date().getHours();

        if (hour < 12) {
            return "Good morning";
        }

        if (hour < 18) {
            return "Good afternoon";
        }

        return "Good evening";
    };

    const formatDate = () => {
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(new Date());
    };

    const formatTransactionDate = (date: string) => {
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }).format(new Date(date));
    };

    if (loading) {
        return (
            <div className="dashboard-page">
                <Loading />
            </div>
        );
    }

    if (error || !dashboard) {
        return (
            <div className="dashboard-page">
                <ErrorMessage message={error || "Failed to load dashboard"} />
            </div>
        );
    }

    return (
        <div className="dashboard-page">

            {/* Header */}
            <div className="dashboard-header">
                <div className="dashboard-header__content">

                    <h1>Dashboard</h1>

                    <p>
                        {getGreeting()}, {user?.name.split(" ")[0]} 👋
                    </p>

                    <span className="dashboard-header__description">
                        Here's what's happening with your inventory today.
                    </span>
                </div>

                <div className="dashboard-header__date">
                    <CalendarDays size={16} />
                    <span>{formatDate()}</span>
                </div>
            </div>

            {/* Main Statistics */}
            <div className="dashboard-stats">

                <div className="dashboard-stat">
                    <div className="dashboard-stat__top">
                        <div className="dashboard-stat__icon dashboard-stat__icon--blue">
                            <Package size={19} />
                        </div>
                    </div>

                    <span className="dashboard-stat__label">
                        Total Products
                    </span>

                    <strong className="dashboard-stat__value">
                        {dashboard.totalProducts}
                    </strong>

                    <span className="dashboard-stat__description">
                        Products in inventory
                    </span>
                </div>

                <div className="dashboard-stat">
                    <div className="dashboard-stat__top">
                        <div className="dashboard-stat__icon dashboard-stat__icon--green">
                            <Boxes size={19} />
                        </div>
                    </div>

                    <span className="dashboard-stat__label">
                        Total Categories
                    </span>

                    <strong className="dashboard-stat__value">
                        {dashboard.totalCategories}
                    </strong>

                    <span className="dashboard-stat__description">
                        Product categories
                    </span>
                </div>

                <div className="dashboard-stat">
                    <div className="dashboard-stat__top">
                        <div className="dashboard-stat__icon dashboard-stat__icon--orange">
                            <Truck size={19} />
                        </div>
                    </div>

                    <span className="dashboard-stat__label">
                        Total Suppliers
                    </span>

                    <strong className="dashboard-stat__value">
                        {dashboard.totalSuppliers}
                    </strong>

                    <span className="dashboard-stat__description">
                        Active suppliers
                    </span>
                </div>

                <div className="dashboard-stat">
                    <div className="dashboard-stat__top">
                        <div className="dashboard-stat__icon dashboard-stat__icon--purple">
                            <Warehouse size={19} />
                        </div>
                    </div>

                    <span className="dashboard-stat__label">
                        Total Stock
                    </span>

                    <strong className="dashboard-stat__value">
                        {dashboard.totalStock}
                    </strong>

                    <span className="dashboard-stat__description">
                        Items currently in stock
                    </span>
                </div>

            </div>

            {/* Inventory Alerts */}
            <div className="dashboard-alerts">

                <div className="dashboard-alert dashboard-alert--warning">
                    <div className="dashboard-alert__icon">
                        <AlertTriangle size={19} />
                    </div>

                    <div className="dashboard-alert__content">
                        <span>Low Stock</span>

                        <strong>
                            {dashboard.lowStockProducts}
                        </strong>

                        <small>
                            Products need attention
                        </small>
                    </div>
                </div>

                <div className="dashboard-alert dashboard-alert--danger">
                    <div className="dashboard-alert__icon">
                        <XCircle size={19} />
                    </div>

                    <div className="dashboard-alert__content">
                        <span>Out of Stock</span>

                        <strong>
                            {dashboard.outOfStockProducts}
                        </strong>

                        <small>
                            Products unavailable
                        </small>
                    </div>
                </div>

            </div>

            {/* Main Dashboard Grid */}
            <div className="dashboard-main-grid">

                {/* Stock Overview */}
                <section className="dashboard-card stock-overview">

                    <div className="dashboard-card__header">
                        <div>
                            <h2>Stock Overview</h2>
                            <p>Current inventory status</p>
                        </div>
                    </div>

                    <div className="stock-overview__items">

                        <div className="stock-item">
                            <div className="stock-item__header">
                                <div className="stock-item__title">
                                    <span className="stock-item__dot stock-item__dot--green" />
                                    <span>Total Stock</span>
                                </div>

                                <strong>
                                    {dashboard.totalStock}
                                </strong>
                            </div>

                            <div className="stock-item__bar">
                                <span
                                    className="stock-item__progress stock-item__progress--green"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="stock-item">
                            <div className="stock-item__header">
                                <div className="stock-item__title">
                                    <span className="stock-item__dot stock-item__dot--orange" />
                                    <span>Low Stock</span>
                                </div>

                                <strong>
                                    {dashboard.lowStockProducts}
                                </strong>
                            </div>

                            <div className="stock-item__bar">
                                <span
                                    className="stock-item__progress stock-item__progress--orange"
                                    style={{
                                        width: `${
                                            dashboard.totalProducts > 0
                                                ? Math.min(
                                                      (dashboard.lowStockProducts /
                                                          dashboard.totalProducts) *
                                                          100,
                                                      100
                                                  )
                                                : 0
                                        }%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="stock-item">
                            <div className="stock-item__header">
                                <div className="stock-item__title">
                                    <span className="stock-item__dot stock-item__dot--red" />
                                    <span>Out of Stock</span>
                                </div>

                                <strong>
                                    {dashboard.outOfStockProducts}
                                </strong>
                            </div>

                            <div className="stock-item__bar">
                                <span
                                    className="stock-item__progress stock-item__progress--red"
                                    style={{
                                        width: `${
                                            dashboard.totalProducts > 0
                                                ? Math.min(
                                                      (dashboard.outOfStockProducts /
                                                          dashboard.totalProducts) *
                                                          100,
                                                      100
                                                  )
                                                : 0
                                        }%`,
                                    }}
                                />
                            </div>
                        </div>

                    </div>

                    <div className="stock-overview__summary">
                        <div>
                            <Warehouse size={17} />

                            <div>
                                <strong>
                                    {dashboard.totalStock}
                                </strong>

                                <span>
                                    Total units available
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/inventory")}
                        >
                            View Inventory
                        </button>
                    </div>

                </section>

                {/* Recent Transactions */}
                <section className="dashboard-card transactions-card">

                    <div className="dashboard-card__header">
                        <div>
                            <h2>Recent Transactions</h2>
                            <p>Latest inventory activity</p>
                        </div>

                        <button
                            type="button"
                            className="dashboard-card__link"
                            onClick={() => navigate("/transactions")}
                        >
                            View All
                        </button>
                    </div>

                    <div className="transactions-list">

                        {transactions.length === 0 ? (
                            <div className="transactions-empty">
                                <ClipboardList size={24} />

                                <span>
                                    No recent transactions
                                </span>
                            </div>
                        ) : (
                            transactions.map((transaction) => {
                                const isStockIn =
                                    transaction.type === "STOCK_IN";

                                return (
                                    <div
                                        className="transaction-item"
                                        key={transaction.id}
                                    >
                                        <div
                                            className={`transaction-item__icon ${
                                                isStockIn
                                                    ? "transaction-item__icon--in"
                                                    : "transaction-item__icon--out"
                                            }`}
                                        >
                                            {isStockIn ? (
                                                <ArrowDownRight size={17} />
                                            ) : (
                                                <ArrowUpRight size={17} />
                                            )}
                                        </div>

                                        <div className="transaction-item__content">
                                            <strong>
                                                {isStockIn
                                                    ? "Stock In"
                                                    : "Stock Out"}
                                            </strong>

                                            <span>
                                                {transaction.product.name}
                                            </span>
                                        </div>

                                        <div
                                            className={`transaction-item__quantity ${
                                                isStockIn
                                                    ? "transaction-item__quantity--in"
                                                    : "transaction-item__quantity--out"
                                            }`}
                                        >
                                            {isStockIn ? "+" : "-"}
                                            {transaction.quantity}
                                        </div>

                                        <div className="transaction-item__date">
                                            {formatTransactionDate(
                                                transaction.createdAt
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}

                    </div>

                </section>

            </div>

            {/* Bottom Dashboard Grid */}
            <div className="dashboard-bottom-grid">

                {/* User Overview */}
                <section className="dashboard-card">

                    <div className="dashboard-card__header">
                        <div>
                            <h2>User Overview</h2>
                            <p>Users by role</p>
                        </div>

                        <div className="dashboard-card__header-icon">
                            <Users size={18} />
                        </div>
                    </div>

                    <div className="user-overview">

                        <div className="user-overview__total">
                            <span>Total Users</span>

                            <strong>
                                {dashboard.getAllUsers.totalUsers}
                            </strong>
                        </div>

                        <div className="user-overview__roles">

                            <div className="user-role">
                                <span className="user-role__indicator user-role__indicator--blue" />
                                <span>Admin</span>
                                <strong>
                                    {dashboard.getAllUsers.admin}
                                </strong>
                            </div>

                            <div className="user-role">
                                <span className="user-role__indicator user-role__indicator--purple" />
                                <span>Manager</span>
                                <strong>
                                    {dashboard.getAllUsers.manager}
                                </strong>
                            </div>

                            <div className="user-role">
                                <span className="user-role__indicator user-role__indicator--green" />
                                <span>Staff</span>
                                <strong>
                                    {dashboard.getAllUsers.staff}
                                </strong>
                            </div>

                        </div>

                    </div>

                </section>

                {/* Quick Actions */}
                <section className="dashboard-card">

                    <div className="dashboard-card__header">
                        <div>
                            <h2>Quick Actions</h2>
                            <p>Common inventory actions</p>
                        </div>
                    </div>

                    <div className="quick-actions">

                        {(user?.role === "ADMIN" ||
                            user?.role === "MANAGER") && (
                            <button
                                type="button"
                                className="quick-action"
                                onClick={() => navigate("/products/create")}
                            >
                                <span className="quick-action__icon quick-action__icon--blue">
                                    <Plus size={18} />
                                </span>

                                <span>
                                    <strong>Add Product</strong>
                                    <small>Create a new product</small>
                                </span>
                            </button>
                        )}

                        {(user?.role === "ADMIN" ||
                            user?.role === "MANAGER") && (
                            <button
                                type="button"
                                className="quick-action"
                                onClick={() => navigate("/categories/create")}
                            >
                                <span className="quick-action__icon quick-action__icon--green">
                                    <Plus size={18} />
                                </span>

                                <span>
                                    <strong>Add Category</strong>
                                    <small>Create a new category</small>
                                </span>
                            </button>
                        )}

                        {(user?.role === "ADMIN" ||
                            user?.role === "MANAGER") && (
                            <button
                                type="button"
                                className="quick-action"
                                onClick={() => navigate("/suppliers/create")}
                            >
                                <span className="quick-action__icon quick-action__icon--orange">
                                    <Plus size={18} />
                                </span>

                                <span>
                                    <strong>Add Supplier</strong>
                                    <small>Add a new supplier</small>
                                </span>
                            </button>
                        )}

                        <button
                            type="button"
                            className="quick-action"
                            onClick={() => navigate("/transactions")}
                        >
                            <span className="quick-action__icon quick-action__icon--purple">
                                <Plus size={18} />
                            </span>

                            <span>
                                <strong>Stock Transaction</strong>
                                <small>Manage stock movement</small>
                            </span>
                        </button>

                    </div>

                </section>

            </div>

        </div>
    );
}

export default Dashboard;