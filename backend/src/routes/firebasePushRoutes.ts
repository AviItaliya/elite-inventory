import { Router } from "express";
import firebasePushController from "../controllers/firebasePushController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const firebasePushRoutes = Router();

firebasePushRoutes.post("/test", authMiddleware, (req, res) =>
  firebasePushController.sendTestNotification(req, res),
);

export default firebasePushRoutes;
