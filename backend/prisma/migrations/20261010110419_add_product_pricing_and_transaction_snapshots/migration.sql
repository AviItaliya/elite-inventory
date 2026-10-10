-- AlterTable
ALTER TABLE "InventoryTransaction" ADD COLUMN     "costOfGoods" DECIMAL(14,2),
ADD COLUMN     "grossProfit" DECIMAL(14,2),
ADD COLUMN     "purchasePriceSnapshot" DECIMAL(12,2),
ADD COLUMN     "revenue" DECIMAL(14,2),
ADD COLUMN     "sellingPriceSnapshot" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "purchasePrice" DECIMAL(12,2) NOT NULL DEFAULT 0;
