export type StockAlertType = "LOW_STOCK" | "OUT_OF_STOCK";

export interface StockAlert {
  type: StockAlertType;
  title: string;
  message: string;
}

export const getStockAlert = (
  productName: string,
  previousQuantity: number,
  newQuantity: number,
  minStock: number,
): StockAlert | null => {
  // Product has just become out of stock.
  if (previousQuantity > 0 && newQuantity === 0) {
    return {
      type: "OUT_OF_STOCK",
      title: "Out of Stock Alert",
      message: `${productName} is now out of stock.`,
    };
  }

  // Product has just crossed the low-stock threshold.
  if (
    previousQuantity > minStock &&
    newQuantity > 0 &&
    newQuantity <= minStock
  ) {
    return {
      type: "LOW_STOCK",
      title: "Low Stock Alert",
      message: `${productName} has only ${newQuantity} units remaining.`,
    };
  }

  return null;
};
