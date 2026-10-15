import dashboardRepository from "../repositories/dashboardRepository.js";
import { generateFinancialExcel } from "../utils/financialExcel.js";
import { generatePdf } from "../utils/pdfGenerator.js";

interface ReportFilters {
  startDate?: Date;
  endDate?: Date; // Exclusive end date from the controller
}

const currency = (value: string | number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));

const dateLabel = (date: Date): string =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

class ReportService {
  async generateFinancialReport(filters: ReportFilters = {}): Promise<Buffer> {
    const summary = await dashboardRepository.getFinancialSummary(filters);
    const revenue = Number(summary.revenue);
    const cogs = Number(summary.cogs);
    const profit = Number(summary.grossProfit);
    const transactions = Number(summary.salesTransactions);
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const avgSale = transactions > 0 ? revenue / transactions : 0;
    const periodStart = filters.startDate
      ? dateLabel(filters.startDate)
      : "All time";
    const inclusiveEnd = filters.endDate
      ? new Date(filters.endDate.getTime() - 86_400_000)
      : undefined;
    const periodEnd = inclusiveEnd ? dateLabel(inclusiveEnd) : "Present";
    const generatedAt = new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }).format(new Date());
    const safeMargin = Math.max(0, Math.min(100, margin));

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Elite Inventory | Financial Performance Report</title>
  <style>
    * { box-sizing: border-box; }
    html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { margin: 0; color: #17233b; background: #fff; font-family: Arial, "Noto Sans", sans-serif; font-size: 12px; }
    .hero { background: #142d58; color: white; padding: 28px 30px 30px; border-radius: 12px; }
    .brandline { display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 17px; font-weight: 800; letter-spacing: .7px; }
    .badge { border: 1px solid #8fa9d4; border-radius: 100px; padding: 7px 12px; font-size: 9px; letter-spacing: 1.3px; font-weight: 700; }
    h1 { font-size: 25px; margin: 25px 0 7px; line-height: 1.2; }
    .subtitle { color: #c4d5f2; font-size: 11px; }
    .meta { display: flex; gap: 24px; margin-top: 22px; padding-top: 16px; border-top: 1px solid #47618a; }
    .meta-label { font-size: 9px; color: #b8cae7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
    .meta-value { font-size: 11px; font-weight: 700; }
    .section-title { margin: 25px 0 12px; font-size: 14px; font-weight: 800; }
    .section-subtitle { color: #728098; font-size: 10px; margin: -6px 0 15px; }
    .cards { display: flex; gap: 12px; }
    .card { flex: 1; min-width: 0; border-radius: 10px; padding: 16px 13px; border: 1px solid #e6ebf3; background: #f9fbff; }
    .card.revenue { border-top: 4px solid #3b82f6; background: #f2f7ff; }
    .card.cogs { border-top: 4px solid #f59e0b; background: #fffbf1; }
    .card.profit { border-top: 4px solid #10b981; background: #f1fcf7; }
    .card-label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .6px; color: #53647e; }
    .card-value { font-size: 17px; font-weight: 800; margin: 11px 0 7px; white-space: nowrap; }
    .card-note { font-size: 9px; color: #6b7a91; }
    .panel { border: 1px solid #e5ebf3; border-radius: 10px; padding: 18px 20px; page-break-inside: avoid; }
    .panel-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 13px; }
    .panel-title { font-size: 12px; font-weight: 800; }
    .margin-value { font-size: 19px; color: #059669; font-weight: 800; }
    .track { height: 12px; background: #eaf0f7; border-radius: 100px; overflow: hidden; }
    .fill { height: 100%; background: #10b981; border-radius: 100px; width: ${safeMargin.toFixed(2)}%; }
    .hint { margin-top: 9px; font-size: 10px; color: #6c7c92; }
    .stats { display: flex; gap: 12px; margin-top: 13px; }
    .stat { flex: 1; background: #f7f9fc; padding: 14px 16px; border-radius: 9px; }
    .stat-name { font-size: 10px; color: #65748b; margin-bottom: 7px; }
    .stat-number { font-size: 16px; font-weight: 800; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #f0f5fc; color: #435773; font-size: 9px; text-transform: uppercase; letter-spacing: .7px; text-align: left; padding: 12px 15px; }
    th:last-child, td:last-child { text-align: right; }
    td { padding: 12px 15px; border-bottom: 1px solid #e8edf5; }
    tr:last-child td { background: #f1fbf6; font-weight: 800; color: #087c55; border-bottom: 0; }
    .table-wrap { border: 1px solid #e5ebf3; border-radius: 10px; overflow: hidden; }
    .foot { display: flex; justify-content: space-between; border-top: 1px solid #e5ebf3; margin-top: 26px; padding-top: 12px; font-size: 9px; color: #77859b; }
    .disclaimer { color: #78869a; font-size: 9px; margin-top: 10px; line-height: 1.5; }
    @page { size: A4; }
  </style>
</head>
<body>
  <header class="hero">
    <div class="brandline"><div class="brand">ELITE INVENTORY</div><div class="badge">FINANCIAL REPORT</div></div>
    <h1>Financial Performance Report</h1>
    <div class="subtitle">Sales revenue, cost of goods sold and gross profitability</div>
    <div class="meta">
      <div><div class="meta-label">Reporting period</div><div class="meta-value">${periodStart} — ${periodEnd}</div></div>
      <div><div class="meta-label">Generated on (IST)</div><div class="meta-value">${generatedAt}</div></div>
    </div>
  </header>

  <div class="section-title">Financial overview</div>
  <div class="cards">
    <div class="card revenue"><div class="card-label">Total revenue</div><div class="card-value">${currency(revenue)}</div><div class="card-note">Recorded sales</div></div>
    <div class="card cogs"><div class="card-label">Cost of goods sold</div><div class="card-value">${currency(cogs)}</div><div class="card-note">Historical cost of sold stock</div></div>
    <div class="card profit"><div class="card-label">Gross profit</div><div class="card-value">${currency(profit)}</div><div class="card-note">Before operating expenses</div></div>
  </div>

  <div class="section-title">Profitability overview</div>
  <div class="panel">
    <div class="panel-head"><div class="panel-title">Gross profit margin</div><div class="margin-value">${margin.toFixed(2)}%</div></div>
    <div class="track"><div class="fill"></div></div>
    <div class="hint">Gross profit as a percentage of sales revenue. Bar is limited to 0–100% for display.</div>
  </div>

  <div class="section-title">Sales activity</div>
  <div class="stats">
    <div class="stat"><div class="stat-name">Recorded sales transactions</div><div class="stat-number">${transactions.toLocaleString("en-IN")}</div></div>
    <div class="stat"><div class="stat-name">Average revenue per transaction</div><div class="stat-number">${currency(avgSale)}</div></div>
  </div>

  <div class="section-title">Financial breakdown</div>
  <div class="section-subtitle">Summary for the selected reporting period</div>
  <div class="table-wrap"><table>
    <thead><tr><th>Metric</th><th>Amount (INR)</th></tr></thead>
    <tbody>
      <tr><td>Total sales revenue</td><td>${currency(revenue)}</td></tr>
      <tr><td>Less: Cost of goods sold</td><td>${currency(cogs)}</td></tr>
      <tr><td>Gross profit</td><td>${currency(profit)}</td></tr>
    </tbody>
  </table></div>

  <div class="foot"><span>Generated by Elite Inventory</span><span>Confidential • Financial summary</span></div>
  <div class="disclaimer">This report includes recorded sales transactions with complete financial snapshots. Gross profit excludes operating expenses, taxes and other non-inventory costs.</div>
</body>
</html>`;

    return generatePdf({ title: "Elite Inventory Financial Report", html });
  }

  async generateFinancialExcelReport(
    filters: ReportFilters = {},
  ): Promise<Buffer> {
    const summary = await dashboardRepository.getFinancialSummary(filters);
    return generateFinancialExcel({
      summary,
      ...(filters.startDate !== undefined
        ? { startDate: filters.startDate }
        : {}),
      ...(filters.endDate !== undefined ? { endDate: filters.endDate } : {}),
    });
  }
}

export default new ReportService();
