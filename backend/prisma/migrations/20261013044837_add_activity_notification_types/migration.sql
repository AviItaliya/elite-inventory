-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'OUT_OF_STOCK';
ALTER TYPE "NotificationType" ADD VALUE 'STOCK_IN';
ALTER TYPE "NotificationType" ADD VALUE 'STOCK_OUT';
ALTER TYPE "NotificationType" ADD VALUE 'PRODUCT_CREATED';
ALTER TYPE "NotificationType" ADD VALUE 'PRODUCT_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'PRODUCT_DELETED';
ALTER TYPE "NotificationType" ADD VALUE 'CATEGORY_CREATED';
ALTER TYPE "NotificationType" ADD VALUE 'CATEGORY_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'CATEGORY_DELETED';
ALTER TYPE "NotificationType" ADD VALUE 'SUPPLIER_CREATED';
ALTER TYPE "NotificationType" ADD VALUE 'SUPPLIER_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'SUPPLIER_DELETED';
ALTER TYPE "NotificationType" ADD VALUE 'USER_CREATED';
ALTER TYPE "NotificationType" ADD VALUE 'USER_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'USER_ROLE_CHANGED';
ALTER TYPE "NotificationType" ADD VALUE 'PASSWORD_CHANGED';
ALTER TYPE "NotificationType" ADD VALUE 'REPORT_GENERATED';
ALTER TYPE "NotificationType" ADD VALUE 'EMAIL_SENT';
