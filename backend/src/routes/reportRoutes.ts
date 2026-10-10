import { Router } from "express";
import reportController from "../controllers/reportController.js";
import authenticate from "../middlewares/authMiddleware.js";

const reportRoutes = Router();

reportRoutes.get("/financial/pdf", authenticate, reportController.downloadFinancialReport);
reportRoutes.get("/financial/excel", authenticate, reportController.downloadFinancialExcel);

export default reportRoutes;