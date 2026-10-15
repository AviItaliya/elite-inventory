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
  RefreshCw,
  Activity,
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

  const getGrossProfitMargin = (revenue: number | string, profit: number | string) => {
    const totalRevenue = Number(revenue);
    const grossProfit = Number(profit);
    if (!Number.isFinite(totalRevenue) || totalRevenue <= 0 || !Number.isFinite(grossProfit)) return 0;
    return (grossProfit / totalRevenue) * 100;
  };

  type RangePreset = "all" | "today" | "7days" | "30days" | "custom";
  const [rangePreset, setRangePreset] = useState<RangePreset>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<DashboardFilters>({});
  const [filterError, setFilterError] = useState("");
  const [showCustomRange, setShowCustomRange] = useState(false);
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
      setShowCustomRange(false);
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
    if (!startDate || !endDate || startDate > endDate || endDate > localDate(new Date())) {
      setFilterError("Select a valid start date and end date.");
      return;
    }
    void applyFilters({ startDate, endDate }, "custom");
  };

  const formatPeriodDate = (date: string) =>
    new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));

  const selectedPeriod = appliedFilters.startDate && appliedFilters.endDate
    ? `${formatPeriodDate(appliedFilters.startDate)} – ${formatPeriodDate(appliedFilters.endDate)}`
    : "All time";

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

  const stockStatusTotal = dashboard ? Math.max(0, dashboard.totalProducts) : 0;
  const lowStockPercent = stockStatusTotal ? Math.min(100, (dashboard!.lowStockProducts / stockStatusTotal) * 100) : 0;
  const outOfStockPercent = stockStatusTotal ? Math.min(100, (dashboard!.outOfStockProducts / stockStatusTotal) * 100) : 0;
  const healthyProducts = dashboard ? Math.max(0, stockStatusTotal - dashboard.lowStockProducts - dashboard.outOfStockProducts) : 0;
  const healthyPercent = stockStatusTotal ? Math.min(100, (healthyProducts / stockStatusTotal) * 100) : 0;

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading" role="status" aria-live="polite"><Loading /><p>Loading your inventory overview…</p></div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-failure"><ErrorMessage message={error || "Failed to load dashboard"} /><button type="button" className="dashboard-retry" onClick={() => void dispatch(fetchDashboard(appliedFilters))}><RefreshCw size={16} /> Try again</button></div>
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

        <div className="dashboard-date-filters" aria-label="Sales performance date filters">
          <div className="dashboard-date-filters__topline">
            <div className="dashboard-date-filters__period">
              <CalendarDays size={17} aria-hidden="true" />
              <span>Showing</span>
              <strong>{selectedPeriod}</strong>
            </div>
            {filterLoading && <span className="dashboard-date-filters__status" role="status">Updating sales data…</span>}
          </div>
          <div className="dashboard-date-filters__presets" role="group" aria-label="Quick date ranges">
            {([
              ["all", "All Time"],
              ["today", "Today"],
              ["7days", "Last 7 Days"],
              ["30days", "Last 30 Days"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                disabled={filterLoading}
                className={!showCustomRange && rangePreset === value ? "is-active" : ""}
                aria-pressed={!showCustomRange && rangePreset === value}
                onClick={() => selectPreset(value)}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              disabled={filterLoading}
              className={showCustomRange || rangePreset === "custom" ? "is-active" : ""}
              aria-pressed={showCustomRange || rangePreset === "custom"}
              aria-expanded={showCustomRange}
              onClick={() => {
                setFilterError("");
                setShowCustomRange((visible) => !visible);
              }}
            >
              <CalendarDays size={15} aria-hidden="true" /> Custom range
            </button>
          </div>
          {showCustomRange && (
            <div className="dashboard-date-filters__custom">
              <label htmlFor="sales-start-date">From
                <input id="sales-start-date" type="date" value={startDate}
                  max={endDate || localDate(new Date())}
                  onChange={(e) => setStartDate(e.target.value)} />
              </label>
              <label htmlFor="sales-end-date">To
                <input id="sales-end-date" type="date" value={endDate}
                  min={startDate || undefined} max={localDate(new Date())}
                  onChange={(e) => setEndDate(e.target.value)} />
              </label>
              <button type="button" className="dashboard-date-filters__apply"
                disabled={filterLoading || !startDate || !endDate}
                onClick={applyCustom}>Apply dates</button>
              <button type="button" className="dashboard-date-filters__cancel"
                disabled={filterLoading} onClick={() => { setShowCustomRange(false); setFilterError(""); }}>
                Cancel
              </button>
            </div>
          )}
          {filterError && <p role="alert" className="dashboard-date-filters__error">{filterError}</p>}
        </div>

        <div className="dashboard-financial-grid dashboard-financial-grid--performance" aria-busy={filterLoading}>
          <div className="dashboard-financial-card dashboard-financial-card--revenue">
            <div className="dashboard-financial-card__icon">
              <IndianRupee size={22} />
            </div>

            <span>Total Revenue</span>

            <strong>
              {formatCurrency(dashboard.financialSummary.revenue)}
            </strong>

            <p>Revenue from recorded sales</p>
          </div>

          <div className="dashboard-financial-card dashboard-financial-card--cogs">
            <div className="dashboard-financial-card__icon">
              <Wallet size={22} />
            </div>

            <span>Cost of Goods Sold</span>

            <strong>{formatCurrency(dashboard.financialSummary.cogs)}</strong>

            <p>Purchase cost of products sold</p>
          </div>

          <div className="dashboard-financial-card dashboard-financial-card--profit">
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

          <div className="dashboard-financial-card dashboard-financial-card--margin">
            <div className="dashboard-financial-card__icon">
              <ChartNoAxesCombined size={22} />
            </div>
            <span>Gross Profit Margin</span>
            <strong>
              {getGrossProfitMargin(
                dashboard.financialSummary.revenue,
                dashboard.financialSummary.grossProfit,
              ).toFixed(2)}%
            </strong>
            <div
              className="dashboard-financial-card__progress"
              role="progressbar"
              aria-label="Gross profit margin"
              aria-valuenow={Math.min(100, Math.max(0, getGrossProfitMargin(dashboard.financialSummary.revenue, dashboard.financialSummary.grossProfit)))}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span
                style={{
                  width: `${Math.min(100, Math.max(0, getGrossProfitMargin(dashboard.financialSummary.revenue, dashboard.financialSummary.grossProfit)))}%`,
                }}
              />
            </div>
            <p>Gross profit as a percentage of revenue</p>
          </div>
        </div>
      </section>

      {canShow && (
        <section className="dashboard-breakdown" aria-labelledby="dashboard-breakdown-title">
          <div className="dashboard-breakdown__heading">
            <div>
              <h2 id="dashboard-breakdown-title">Revenue Breakdown</h2>
              <p>How recorded sales revenue is divided between product cost and gross profit for the selected period.</p>
            </div>
            <span className="dashboard-breakdown__badge">Selected period</span>
          </div>
          {(() => {
            const revenue = Number(dashboard.financialSummary.revenue) || 0;
            const cogs = Number(dashboard.financialSummary.cogs) || 0;
            const profit = Number(dashboard.financialSummary.grossProfit) || 0;
            const scale = Math.max(revenue, cogs + Math.max(0, profit), 1);
            const costWidth = Math.max(0, Math.min(100, (cogs / scale) * 100));
            const profitWidth = Math.max(0, Math.min(100 - costWidth, (profit / scale) * 100));
            return (
              <>
                <div className="dashboard-breakdown__totals">
                  <div><span>Revenue</span><strong>{formatCurrency(revenue)}</strong></div>
                  <div><span>COGS</span><strong>{formatCurrency(cogs)}</strong></div>
                  <div><span>Gross profit</span><strong>{formatCurrency(profit)}</strong></div>
                </div>
                {revenue > 0 ? (
                  <div className="dashboard-breakdown__visual" role="img" aria-label={`Revenue ${formatCurrency(revenue)}, cost of goods sold ${formatCurrency(cogs)}, gross profit ${formatCurrency(profit)}`}>
                    <div className="dashboard-breakdown__bar">
                      <span className="dashboard-breakdown__bar-cost" style={{ width: `${costWidth}%` }} />
                      <span className="dashboard-breakdown__bar-profit" style={{ width: `${profitWidth}%` }} />
                    </div>
                    <div className="dashboard-breakdown__legend">
                      <span><i className="dashboard-breakdown__dot dashboard-breakdown__dot--cost" /> Cost of goods sold</span>
                      <span><i className="dashboard-breakdown__dot dashboard-breakdown__dot--profit" /> Gross profit</span>
                    </div>
                  </div>
                ) : (
                  <p className="dashboard-breakdown__empty">No recorded sales for this period. Select another date range to see the breakdown.</p>
                )}
                {profit < 0 && <p className="dashboard-breakdown__note">Gross profit is negative for this period; the bar only visualizes non-negative portions.</p>}
              </>
            );
          })()}
        </section>
      )}

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
              {selectedPeriod}
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
              <p>Product availability at a glance</p>
            </div>
          </div>

          <div className="stock-overview__health" aria-label="Product stock status">
            <div className="stock-overview__health-header"><span><Activity size={16} /> Healthy products</span><strong>{healthyProducts} / {stockStatusTotal}</strong></div>
            <div className="stock-overview__stacked" role="img" aria-label={`${healthyProducts} healthy products, ${dashboard.lowStockProducts} low stock products and ${dashboard.outOfStockProducts} out of stock products`}>
              <span className="stock-overview__stacked-healthy" style={{ width: `${healthyPercent}%` }} />
              <span className="stock-overview__stacked-low" style={{ width: `${lowStockPercent}%` }} />
              <span className="stock-overview__stacked-out" style={{ width: `${outOfStockPercent}%` }} />
            </div>
            <p>{stockStatusTotal === 0 ? "Add products to see your stock health." : `${healthyPercent.toFixed(0)}% of products have healthy stock levels.`}</p>
          </div>
          <div className="stock-overview__items">
            <div className="stock-item">
              <div className="stock-item__header">
                <div className="stock-item__title">
                  <span className="stock-item__dot stock-item__dot--green" />
                  <span>Healthy Products</span>
                </div>

                <strong>{healthyProducts}</strong>
              </div>

              <div className="stock-item__bar">
                <span
                  className="stock-item__progress stock-item__progress--green"
                  style={{ width: `${healthyPercent}%` }}
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
                      lowStockPercent
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
                      outOfStockPercent
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
              <p>Latest stock movements</p>
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

                <strong>No recent transactions</strong>
                <span>Stock movements will appear here after your first transaction.</span>
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
                      <strong>{transaction.product.name}</strong>
                      <span className={isStockIn ? "transaction-item__type transaction-item__type--in" : "transaction-item__type transaction-item__type--out"}>{isStockIn ? "Stock In" : "Stock Out"}</span>
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
