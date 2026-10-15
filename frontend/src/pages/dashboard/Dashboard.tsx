import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardList,
  FileDown,
  FileSpreadsheet,
  IndianRupee,
  Package,
  Plus,
  TrendingUp,
  Truck,
  Users,
  Wallet,
  Warehouse,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchDashboard } from "../../store/slices/dashboardSlice";
import { formatCurrency } from "../../utils/formatCurrency";
import type { DashboardFilters } from "../../services/dashboardService";
import {
  downloadFinancialReport,
  type FinancialReportFormat,
} from "../../services/reportService";

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const dashboard = useAppSelector((state) => state.dashboard.dashboard);
  const transactions = useAppSelector((state) => state.dashboard.transactions);
  const loading = useAppSelector((state) => state.dashboard.loading);
  const error = useAppSelector((state) => state.dashboard.error);

  const canShow = user?.role === "ADMIN";

  type RangePreset = "all" | "today" | "7days" | "30days" | "custom";
  const [rangePreset, setRangePreset] = useState<RangePreset>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<DashboardFilters>({});
  const [filterError, setFilterError] = useState("");
  const [filterLoading, setFilterLoading] = useState(false);
  const [downloadingReport, setDownloadingReport] =
    useState<FinancialReportFormat | null>(null);
  const [reportError, setReportError] = useState("");

  // Use local calendar dates rather than UTC to avoid off-by-one errors.
  const localDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const applyFilters = async (
    filters: DashboardFilters,
    preset: RangePreset,
  ) => {
    setFilterError("");
    setFilterLoading(true);
    try {
      await dispatch(fetchDashboard(filters)).unwrap();
      setAppliedFilters(filters);
      setRangePreset(preset);
    } catch {
      setFilterError("Could not update sales performance. Please retry.");
    } finally {
      setFilterLoading(false);
    }
  };

  const handleDownloadReport = async (format: FinancialReportFormat) => {
    if (downloadingReport) return;

    try {
      setDownloadingReport(format);
      setReportError("");

      await downloadFinancialReport(format, {
        startDate: appliedFilters.startDate,
        endDate: appliedFilters.endDate,
      });
    } catch (error) {
      console.error("Financial report download failed:", error);

      setReportError(
        "Failed to download the financial report. Please try again.",
      );
    } finally {
      setDownloadingReport(null);
    }
  };

  const selectPreset = (preset: Exclude<RangePreset, "custom">) => {
    if (preset === "all") {
      void applyFilters({}, preset);
      return;
    }
    const today = new Date();
    const start = new Date(today);
    if (preset === "7days") start.setDate(today.getDate() - 6);
    if (preset === "30days") start.setDate(today.getDate() - 29);
    void applyFilters(
      { startDate: localDate(start), endDate: localDate(today) },
      preset,
    );
  };

  const applyCustom = () => {
    if (!startDate || !endDate || startDate > endDate) {
      setFilterError("Select a valid start date and end date.");
      return;
    }
    void applyFilters({ startDate, endDate }, "custom");
  };

  useEffect(() => {
    void dispatch(fetchDashboard({}));
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

      {/* Inventory Valuation */}
      {canShow && (
        <section className="dashboard-financial-section">
          <div className="dashboard-financial-section__header">
            <h2>Inventory Valuation</h2>
            <p>Current financial value of available stock</p>
          </div>
          <div className="dashboard-financial-grid">
            <div className="dashboard-financial-card">
              <div className="dashboard-financial-card__icon">
                <Wallet size={22} />
              </div>

              <span>Inventory Cost Value</span>

              <strong>
                {formatCurrency(dashboard.inventoryValuation.inventoryCost)}
              </strong>

              <p>Total purchase cost of available stock</p>
            </div>

            <div className="dashboard-financial-card">
              <div className="dashboard-financial-card__icon">
                <TrendingUp size={22} />
              </div>

              <span>Potential Selling Value</span>

              <strong>
                {formatCurrency(
                  dashboard.inventoryValuation.potentialSellingValue,
                )}
              </strong>

              <p>Expected value at current selling prices</p>
            </div>

            <div className="dashboard-financial-card">
              <div className="dashboard-financial-card__icon">
                <ChartNoAxesCombined size={22} />
              </div>

              <span>Potential Gross Margin</span>

              <strong>
                {formatCurrency(
                  dashboard.inventoryValuation.potentialGrossMargin,
                )}
              </strong>

              <p>Potential margin before additional expenses</p>
            </div>
          </div>
        </section>
      )}
      {/* Sales Performance */}
      <section className="dashboard-financial-section">
        <div className="dashboard-financial-section__header">
          <h2>Sales Performance</h2>
          <p>Financial summary of recorded stock-out transactions</p>
        </div>

        <div
          className="dashboard-date-filters"
          aria-label="Sales performance date filters"
        >
          <div className="dashboard-date-filters__presets">
            {(
              [
                ["all", "All Time"],
                ["today", "Today"],
                ["7days", "Last 7 Days"],
                ["30days", "Last 30 Days"],
                ["custom", "Custom"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                disabled={filterLoading}
                className={rangePreset === value ? "is-active" : ""}
                aria-pressed={rangePreset === value}
                onClick={() =>
                  value === "custom"
                    ? setRangePreset("custom")
                    : selectPreset(value)
                }
              >
                {label}
              </button>
            ))}
          </div>
          {rangePreset === "custom" && (
            <div className="dashboard-date-filters__custom">
              <label>
                From{" "}
                <input
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label>
                To{" "}
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
              <button
                type="button"
                disabled={filterLoading}
                onClick={applyCustom}
              >
                Apply
              </button>
              <button
                type="button"
                disabled={filterLoading}
                onClick={() => selectPreset("all")}
              >
                Reset
              </button>
            </div>
          )}
          {filterLoading && <span role="status">Updating sales data…</span>}
          {filterError && (
            <p role="alert" className="dashboard-date-filters__error">
              {filterError}
            </p>
          )}
        </div>

        <div className="dashboard-financial-grid" aria-busy={filterLoading}>
          <div className="dashboard-financial-card">
            <div className="dashboard-financial-card__icon">
              <IndianRupee size={22} />
            </div>

            <span>Total Revenue</span>

            <strong>
              {formatCurrency(dashboard.financialSummary.revenue)}
            </strong>

            <p>Revenue from recorded sales</p>
          </div>

          <div className="dashboard-financial-card">
            <div className="dashboard-financial-card__icon">
              <Wallet size={22} />
            </div>

            <span>Cost of Goods Sold</span>

            <strong>{formatCurrency(dashboard.financialSummary.cogs)}</strong>

            <p>Purchase cost of products sold</p>
          </div>

          <div className="dashboard-financial-card">
            <div className="dashboard-financial-card__icon">
              <TrendingUp size={22} />
            </div>

            <span>Gross Profit</span>

            <strong>
              {formatCurrency(dashboard.financialSummary.grossProfit)}
            </strong>

            <p>
              {dashboard.financialSummary.salesTransactions} recorded sales
              transactions
            </p>
          </div>
        </div>
      </section>

      <section className="financial-reports">
        <div className="financial-reports__header">
          <div>
            <h2>Financial Reports</h2>

            <p>Download your financial summary as a PDF or Excel file.</p>
          </div>
        </div>

        <div className="financial-reports__content">
          <div className="financial-reports__period">
            <span>Selected Period</span>

            <strong>
              {appliedFilters.startDate && appliedFilters.endDate
                ? `${appliedFilters.startDate} to ${appliedFilters.endDate}`
                : "All Time"}
            </strong>
          </div>

          <div className="financial-reports__actions">
            <button
              type="button"
              className="financial-reports__button financial-reports__button--pdf"
              disabled={downloadingReport !== null}
              onClick={() => void handleDownloadReport("pdf")}
            >
              <FileDown size={18} />

              {downloadingReport === "pdf" ? "Downloading..." : "Download PDF"}
            </button>

            <button
              type="button"
              className="financial-reports__button financial-reports__button--excel"
              disabled={downloadingReport !== null}
              onClick={() => void handleDownloadReport("excel")}
            >
              <FileSpreadsheet size={18} />

              {downloadingReport === "excel"
                ? "Downloading..."
                : "Download Excel"}
            </button>
          </div>
        </div>

        {reportError && (
          <p className="financial-reports__error" role="alert">
            {reportError}
          </p>
        )}
      </section>

      {/* Main Statistics */}
      <div className="dashboard-stats">
        <div className="dashboard-stat">
          <div className="dashboard-stat__top">
            <div className="dashboard-stat__icon dashboard-stat__icon--blue">
              <Package size={19} />
            </div>
          </div>

          <span className="dashboard-stat__label">Total Products</span>

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

          <span className="dashboard-stat__label">Total Categories</span>

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

          <span className="dashboard-stat__label">Total Suppliers</span>

          <strong className="dashboard-stat__value">
            {dashboard.totalSuppliers}
          </strong>

          <span className="dashboard-stat__description">Active suppliers</span>
        </div>

        <div className="dashboard-stat">
          <div className="dashboard-stat__top">
            <div className="dashboard-stat__icon dashboard-stat__icon--purple">
              <Warehouse size={19} />
            </div>
          </div>

          <span className="dashboard-stat__label">Total Stock</span>

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

            <strong>{dashboard.lowStockProducts}</strong>

            <small>Products need attention</small>
          </div>
        </div>

        <div className="dashboard-alert dashboard-alert--danger">
          <div className="dashboard-alert__icon">
            <XCircle size={19} />
          </div>

          <div className="dashboard-alert__content">
            <span>Out of Stock</span>

            <strong>{dashboard.outOfStockProducts}</strong>

            <small>Products unavailable</small>
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

                <strong>{dashboard.totalStock}</strong>
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

                <strong>{dashboard.lowStockProducts}</strong>
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
                            100,
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

                <strong>{dashboard.outOfStockProducts}</strong>
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
                            100,
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
                <strong>{dashboard.totalStock}</strong>

                <span>Total units available</span>
              </div>
            </div>

            <button type="button" onClick={() => navigate("/inventory")}>
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

                <span>No recent transactions</span>
              </div>
            ) : (
              transactions.map((transaction) => {
                const isStockIn = transaction.type === "STOCK_IN";

                return (
                  <div className="transaction-item" key={transaction.id}>
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
                      <strong>{isStockIn ? "Stock In" : "Stock Out"}</strong>

                      <span>{transaction.product.name}</span>
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
                      {formatTransactionDate(transaction.createdAt)}
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

              <strong>{dashboard.getAllUsers.totalUsers}</strong>
            </div>

            <div className="user-overview__roles">
              <div className="user-role">
                <span className="user-role__indicator user-role__indicator--blue" />
                <span>Admin</span>
                <strong>{dashboard.getAllUsers.admin}</strong>
              </div>

              <div className="user-role">
                <span className="user-role__indicator user-role__indicator--purple" />
                <span>Manager</span>
                <strong>{dashboard.getAllUsers.manager}</strong>
              </div>

              <div className="user-role">
                <span className="user-role__indicator user-role__indicator--green" />
                <span>Staff</span>
                <strong>{dashboard.getAllUsers.staff}</strong>
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
            {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
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

            {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
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

            {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
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
