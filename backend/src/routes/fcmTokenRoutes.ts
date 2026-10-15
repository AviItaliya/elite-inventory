import { Router } from "express";
import fcmTokenController from "../controllers/fcmTokenController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const fcmTokenRoutes = Router();

fcmTokenRoutes.post("/register", authMiddleware, (req, res) => fcmTokenController.register(req, res));
fcmTokenRoutes.delete("/remove", authMiddleware, (req, res) => fcmTokenController.remove(req, res));

export default fcmTokenRoutes;