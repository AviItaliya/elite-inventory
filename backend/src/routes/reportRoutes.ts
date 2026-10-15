import { Router } from "express";
import reportController from "../controllers/reportController.js";
import authenticate from "../middlewares/authMiddleware.js";

const reportRoutes = Router();

/**
 * @swagger
 * /api/reports/financial/pdf:
 *   get:
 *     summary: Download financial report as PDF
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: PDF financial report
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 */
reportRoutes.get("/financial/pdf", authenticate, reportController.downloadFinancialReport);

/**
 * @swagger
 * /api/reports/financial/excel:
 *   get:
 *     summary: Download financial report as Excel
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Excel financial report
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 */
reportRoutes.get("/financial/excel", authenticate, reportController.downloadFinancialExcel);

export default reportRoutes;
