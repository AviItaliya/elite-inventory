import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/roleMiddleware.js";
import { Role } from "../generated/prisma/enums.js";
import productController from "../controllers/productController.js";
import upload from "../middlewares/uploadMiddleware.js";


const productRoutes = Router();

/**
 * @swagger
 * /api/products/create:
 *   post:
 *     summary: Create a product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sku
 *               - price
 *               - quantity
 *               - categoryId
 *               - supplierId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Office Chair
 *               sku:
 *                 type: string
 *                 example: CHAIR001
 *               description:
 *                 type: string
 *                 example: Ergonomic office chair
 *               price:
 *                 type: number
 *                 example: 5999
 *               quantity:
 *                 type: integer
 *                 example: 20
 *               minStock:
 *                 type: integer
 *                 example: 5
 *               categoryId:
 *                 type: string
 *                 example: category_id
 *               supplierId:
 *                 type: string
 *                 example: supplier_id
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
productRoutes.post("/create", authMiddleware, authorize(Role.ADMIN, Role.MANAGER), productController.create);

/**
 * @swagger
 * /api/products/get-all:
 *   get:
 *     summary: Get all products
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: Products fetched successfully
 */
productRoutes.get("/get-all", authMiddleware, productController.findAll);

/**
 * @swagger
 * /api/products/export:
 *   get:
 *     summary: Export all products to Excel
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Excel file containing all products
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 */
productRoutes.get("/export", authMiddleware, productController.exportProducts);

/**
 * @swagger
 * /api/products/import:
 *   post:
 *     summary: Import products from Excel
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file containing product data
 *     responses:
 *       200:
 *         description: Products imported successfully
 *       400:
 *         description: Excel file is required or validation failed
 *       401:
 *         description: Unauthorized
 */
productRoutes.post("/import", authMiddleware, authorize(Role.ADMIN), upload.single("file"), productController.importProducts);

/**
 * @swagger
 * /api/products/template:
 *   get:
 *     summary: Download product Excel template
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product Excel template
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 */
productRoutes.get("/template", authMiddleware, authorize(Role.ADMIN, Role.MANAGER), productController.downloadTemplate);

/**
 * @swagger
 * /api/products/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
productRoutes.get("/:id", authMiddleware, productController.findById);

/**
 * @swagger
 * /api/products/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Office Chair Pro
 *               sku:
 *                 type: string
 *                 example: CHAIR002
 *               description:
 *                 type: string
 *                 example: Updated office chair
 *               price:
 *                 type: number
 *                 example: 6499
 *               quantity:
 *                 type: integer
 *                 example: 25
 *               minStock:
 *                 type: integer
 *                 example: 5
 *               categoryId:
 *                 type: string
 *                 example: category_id
 *               supplierId:
 *                 type: string
 *                 example: supplier_id
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
productRoutes.put("/:id", authMiddleware, authorize(Role.ADMIN, Role.MANAGER), productController.update);

/**
 * @swagger
 * /api/products/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
productRoutes.delete("/:id", authMiddleware, authorize(Role.ADMIN), productController.delete);

export default productRoutes;