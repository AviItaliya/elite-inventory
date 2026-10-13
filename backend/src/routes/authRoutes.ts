import { Router } from "express";
import authController from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { loginRateLimit, passwordResetRateLimit, registrationRateLimit } from "../middlewares/rateLimitMiddleware.js";

const authRoutes = Router();
authRoutes.post("/register", registrationRateLimit, authController.register);
authRoutes.post("/login", loginRateLimit, authController.login);
authRoutes.post("/refresh-token", authController.refreshToken);
authRoutes.post("/forgot-password", passwordResetRateLimit, authController.forgotPassword);
authRoutes.post("/reset-password", passwordResetRateLimit, authController.resetPassword);
authRoutes.get("/profile", authMiddleware, authController.profile);
authRoutes.post("/logout", authController.logout);

export default authRoutes;

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
