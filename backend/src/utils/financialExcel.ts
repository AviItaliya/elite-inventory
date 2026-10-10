import ExcelJS from "exceljs";

interface FinancialSummary {
  revenue: string;
  cogs: string;
  grossProfit: string;
  salesTransactions: number;
}

interface FinancialExcelOptions {
  summary: FinancialSummary;
  startDate?: Date;
  endDate?: Date;
}

export const generateFinancialExcel = async ({
  summary,
  startDate,
  endDate,
}: FinancialExcelOptions): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Elite Inventory";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Financial Summary");

  sheet.columns = [
    { header: "Metric", key: "metric", width: 32 },
    { header: "Value", key: "value", width: 24 },
  ];

  sheet.mergeCells("A1:B1");
  sheet.getCell("A1").value = "Elite Inventory - Financial Report";
  sheet.getCell("A1").font = {
    bold: true,
    size: 16,
    color: { argb: "FFFFFFFF" },
  };
  sheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1D4ED8" },
  };
  sheet.getCell("A1").alignment = {
    horizontal: "center",
  };
  sheet.getRow(1).height = 30;

  sheet.addRow([]);
  sheet.addRow({
    metric: "Start Date",
    value: startDate?.toISOString().slice(0, 10) ?? "All time",
  });
  sheet.addRow({
    metric: "End Date",
    value: endDate
      ? new Date(endDate.getTime() - 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10)
      : "Present",
  });

  sheet.addRow([]);
  const headerRow = sheet.addRow({
    metric: "Metric",
    value: "Amount",
  });

  headerRow.font = { bold: true };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDCE6F1" },
    };
    cell.border = {
      bottom: { style: "thin" },
    };
  });

  sheet.addRow({
    metric: "Revenue",
    value: Number(summary.revenue),
  });
  sheet.addRow({
    metric: "Cost of Goods Sold (COGS)",
    value: Number(summary.cogs),
  });
  sheet.addRow({
    metric: "Gross Profit",
    value: Number(summary.grossProfit),
  });
  sheet.addRow({
    metric: "Recorded Sales Transactions",
    value: summary.salesTransactions,
  });

  // Format the financial values as numbers in Excel.
  for (const rowNumber of [8, 9, 10]) {
    sheet.getCell(`B${rowNumber}`).numFmt = "#,##0.00";
  }

  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = {
    from: "A7",
    to: "B7",
  };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};