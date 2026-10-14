import { Prisma } from "../generated/prisma/client.js";
import categoryRepository from "../repositories/categoryRepository.js";
import productRepository from "../repositories/productRepository.js";
import supplierRepository from "../repositories/supplierRepository.js";
import AppError from "../utils/AppError.js";
<<<<<<< HEAD
import {
  generateProductExcel,
  generateProductTemplate,
  readExcel,
} from "../utils/excel.js";
import {
  type ProductQuery,
} from "../validators/productQueryValidation.js";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "../validators/productValidation.js";
import auditLogService from "./auditLogService.js";
import activityNotificationService from "./activityNotificationService.js";
import imageService from "./imageService.js";

class ProductService {
  private async notifyProductActivity(
    type: "PRODUCT_CREATED" | "PRODUCT_UPDATED" | "PRODUCT_DELETED",
    productName: string,
    productId?: string,
  ) {
    const titles = {
      PRODUCT_CREATED: "New Product Added",
      PRODUCT_UPDATED: "Product Updated",
      PRODUCT_DELETED: "Product Deleted",
    };

    const messages = {
      PRODUCT_CREATED: `${productName} was added to inventory.`,
      PRODUCT_UPDATED: `${productName} details were updated.`,
      PRODUCT_DELETED: `${productName} was deleted from inventory.`,
    };

    const notifications =
      await activityNotificationService.createActivityNotifications({
        type,
        title: titles[type],
        message: messages[type],
        recipientRoles: ["ADMIN", "MANAGER"],
        ...(productId ? { productId } : {}),
      });

    activityNotificationService.emitNotifications(notifications);
  }

=======
import {generateProductExcel, generateProductTemplate, readExcel} from "../utils/excel.js";
import { productQuerySchema, type ProductQuery } from "../validators/productQueryValidation.js";
import type {CreateProductInput, UpdateProductInput} from "../validators/productValidation.js";
import auditLogService from "./auditLogService.js";

class ProductService {
>>>>>>> origin/main
  async create(data: CreateProductInput, userId: string) {
    const category = await categoryRepository.findById(data.categoryId);

    if (!category) {
      throw new AppError("Category not found.", 404);
    }

    const supplier = await supplierRepository.findById(data.supplierId);

    if (!supplier) {
      throw new AppError("Supplier not found.", 404);
    }

    const product = await productRepository.create({
      name: data.name,
      sku: data.sku,
      description: data.description!,
      price: new Prisma.Decimal(data.price),
<<<<<<< HEAD
      purchasePrice: new Prisma.Decimal(data.purchasePrice),
=======
>>>>>>> origin/main
      quantity: data.quantity,
      minStock: data.minStock,

      category: {
        connect: {
          id: data.categoryId,
        },
      },

      supplier: {
        connect: {
          id: data.supplierId,
        },
      },
    });

    await auditLogService.createLog({
      user: {
        connect: {
          id: userId,
        },
      },
      action: "CREATE",
      entity: "Product",
      entityId: product.id,
      details: `Product "${product.name}" created successfully.`,
    });

<<<<<<< HEAD
    await this.notifyProductActivity(
      "PRODUCT_CREATED",
      product.name,
      product.id,
    );

=======
>>>>>>> origin/main
    return product;
  }

  async findAll(query: ProductQuery) {
<<<<<<< HEAD
=======
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;    

>>>>>>> origin/main
    const result = await productRepository.findAll({
      ...(query.search !== undefined && { search: query.search }),
      ...(query.categoryId !== undefined && { categoryId: query.categoryId }),
      ...(query.supplierId !== undefined && { supplierId: query.supplierId }),
<<<<<<< HEAD
      ...(query.stockStatus !== undefined && {
        stockStatus: query.stockStatus,
      }),
=======
      ...(query.stockStatus !== undefined && { stockStatus: query.stockStatus }),
>>>>>>> origin/main
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      order: query.order,
    });

    return {
      products: result.products,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  }

  async findById(id: string) {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new AppError("Product not found.", 404);
    }

    return product;
  }

  async update(id: string, data: UpdateProductInput, userId: string) {
    // Check whether product exists
    await this.findById(id);

    // Check category if categoryId is provided
    if (
      data.categoryId &&
      !(await categoryRepository.findById(data.categoryId))
    ) {
      throw new AppError("Category not found.", 404);
    }

    // Check supplier if supplierId is provided
    if (
      data.supplierId &&
      !(await supplierRepository.findById(data.supplierId))
    ) {
      throw new AppError("Supplier not found.", 404);
    }

    const updateData: Prisma.ProductUpdateInput = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.sku !== undefined) {
      updateData.sku = data.sku;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (data.price !== undefined) {
<<<<<<< HEAD
      updateData.price = new Prisma.Decimal(data.price);
    }

    if (data.purchasePrice !== undefined) {
      updateData.purchasePrice = new Prisma.Decimal(data.purchasePrice);
=======
      updateData.price = data.price;
>>>>>>> origin/main
    }

    if (data.quantity !== undefined) {
      updateData.quantity = data.quantity;
    }

    if (data.minStock !== undefined) {
      updateData.minStock = data.minStock;
    }

    if (data.categoryId) {
      updateData.category = {
        connect: {
          id: data.categoryId,
        },
      };
    }

    if (data.supplierId) {
      updateData.supplier = {
        connect: {
          id: data.supplierId,
        },
      };
    }

    // Update product
    const product = await productRepository.update(id, updateData);

    // Create audit log
    await auditLogService.createLog({
      user: {
        connect: {
          id: userId,
        },
      },
      action: "UPDATE",
      entity: "Product",
      entityId: product.id,
      details: `Product "${product.name}" updated successfully.`,
    });

<<<<<<< HEAD
    await this.notifyProductActivity(
      "PRODUCT_UPDATED",
      product.name,
      product.id,
    );

=======
>>>>>>> origin/main
    return product;
  }

  async delete(id: string, userId: string) {
    const product = await this.findById(id);

<<<<<<< HEAD
    // Delete product from PostgreSQL
    const deletedProduct = await productRepository.delete(id);

    // Preserve existing audit log
=======
    const deletedProduct = await productRepository.delete(id);

>>>>>>> origin/main
    await auditLogService.createLog({
      user: {
        connect: {
          id: userId,
        },
      },
      action: "DELETE",
      entity: "Product",
      entityId: product.id,
      details: `Product "${product.name}" deleted successfully.`,
    });

<<<<<<< HEAD
    // Preserve existing notification
    await this.notifyProductActivity("PRODUCT_DELETED", product.name);

    // Clean up Cloudinary image after database deletion
    if (product.imagePublicId) {
      try {
        await imageService.deleteImage(product.imagePublicId);
      } catch (error) {
        console.error("Failed to clean up deleted product image:", error);
      }
    }

=======
>>>>>>> origin/main
    return deletedProduct;
  }

  async exportProducts() {
    const products = await productRepository.exportProducts();

    return generateProductExcel(products);
  }

  async importProducts(filePath: string) {
    const rows = await readExcel(filePath);

    const products: Prisma.ProductCreateManyInput[] = [];

    const errors: {
      row: number;
      message: string;
    }[] = [];

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];

      try {
        /*
         * -------------------------
         * BASIC VALIDATION
         * -------------------------
         */

        if (!row.name) {
          throw new Error("Product name is required.");
        }

        if (!row.sku) {
          throw new Error("SKU is required.");
        }

        if (!row.category) {
          throw new Error("Category is required.");
        }

        if (!row.supplier) {
          throw new Error("Supplier is required.");
        }

<<<<<<< HEAD
        const sellingPrice = Number(row.price);

        if (
          row.price === undefined ||
          row.price === null ||
          row.price === "" ||
          !Number.isFinite(sellingPrice) ||
          sellingPrice <= 0
        ) {
          throw new Error("Selling price must be greater than 0.");
        }

        const purchasePrice =
          row.purchasePrice === undefined ||
          row.purchasePrice === null ||
          row.purchasePrice === ""
            ? 0
            : Number(row.purchasePrice);
        if (!Number.isFinite(purchasePrice) || purchasePrice < 0) {
          throw new Error("Purchase price cannot be negative.");
=======
        if (Number(row.price) <= 0) {
          throw new Error("Price must be greater than 0.");
>>>>>>> origin/main
        }

        if (Number(row.quantity) < 0) {
          throw new Error("Quantity cannot be negative.");
        }

        if (Number(row.minStock) < 0) {
          throw new Error("Min Stock cannot be negative.");
        }

        /*
         * -------------------------
         * FIND CATEGORY
         * -------------------------
         */

        const category = await productRepository.findCategoryByName(
          String(row.category),
        );

        if (!category) {
          throw new AppError(`Category '${row.category}' not found.`, 404);
        }

        /*
         * -------------------------
         * FIND SUPPLIER
         * -------------------------
         */

        const supplier = await productRepository.findSupplierByName(
          String(row.supplier),
        );

        if (!supplier) {
          throw new AppError(`Supplier '${row.supplier}' not found.`, 404);
        }

        /*
         * -------------------------
         * CHECK SKU
         * -------------------------
         */

        const existingProduct = await productRepository.findBySku(
          String(row.sku),
        );

        if (existingProduct) {
          throw new AppError(`SKU '${row.sku}' already exists.`);
        }

        /*
         * -------------------------
         * ADD PRODUCT TO ARRAY
         * -------------------------
         */

        products.push({
          name: String(row.name),
          sku: String(row.sku),
          description: null,
<<<<<<< HEAD
          purchasePrice: new Prisma.Decimal(purchasePrice),
          price: new Prisma.Decimal(sellingPrice),
=======
          price: new Prisma.Decimal(row.price),
>>>>>>> origin/main
          quantity: Number(row.quantity),
          minStock: Number(row.minStock),
          categoryId: category.id,
          supplierId: supplier.id,
        });
      } catch (error) {
        errors.push({
          row: index + 2,
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    /*
     * -------------------------
     * BULK CREATE
     * -------------------------
     *
     * IMPORTANT:
     * This must be OUTSIDE the loop.
     */

    let imported = 0;

    if (products.length > 0) {
      const result = await productRepository.bulkCreateProducts(products);

      imported = result.count;
    }

    /*
     * -------------------------
     * RETURN IMPORT RESULT
     * -------------------------
     */

    return {
      totalRows: rows.length,
      imported,
      skipped: rows.length - imported,
      errors,
    };
  }

  async downloadTemplate() {
    return generateProductTemplate();
  }
}

export default new ProductService();
