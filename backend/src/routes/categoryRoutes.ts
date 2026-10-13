import { Router } from "express";
import { Role } from "../generated/prisma/client.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/roleMiddleware.js";
import categoryController from "../controllers/categoryController.js";

const categoryRoutes = Router();

categoryRoutes.post("/create", authMiddleware, authorize(Role.ADMIN, Role.MANAGER), categoryController.create);
categoryRoutes.get("/get-all", authMiddleware, categoryController.findAll);
categoryRoutes.get("/:id", authMiddleware, categoryController.findById);
categoryRoutes.put("/:id", authMiddleware, authorize(Role.ADMIN, Role.MANAGER), categoryController.update);
categoryRoutes.delete("/:id", authMiddleware, authorize(Role.ADMIN), categoryController.delete);

export default categoryRoutes;

/**
 * @swagger
 * /api/categories/create:
 *   post:
 *     tags: [Categories]
 *     summary: Create a category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Category fields accepted by createCategorySchema.
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation error
 *
 * /api/categories/get-all:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *
 * /api/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get a category by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category fetched successfully
 *       404:
 *         description: Category not found
 *   put:
 *     tags: [Categories]
 *     summary: Update a category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Category fields accepted by updateCategorySchema.
 *     responses:
 *       200:
 *         description: Category updated successfully
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully
 */