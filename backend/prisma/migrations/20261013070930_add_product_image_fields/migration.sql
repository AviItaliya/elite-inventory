-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'USER_DELETED';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "imagePublicId" TEXT,
ADD COLUMN     "imageUrl" TEXT;
