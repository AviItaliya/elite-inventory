import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import cookieParser from "cookie-parser";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
import transactionRoutes from "./routes/inventoryTransactionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import apiRateLimit from "./middlewares/apiRateLimit.js";
import requestIdMiddleware from "./middlewares/requestIdMiddleware.js";
import logger from "./utils/logger.js";
import swaggerSpec from "./config/swagger.js";
import swaggerUi from "swagger-ui-express";
import reportRoutes from "./routes/reportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import fcmTokenRoutes from "./routes/fcmTokenRoutes.js";
import firebasePushRoutes from "./routes/firebasePushRoutes.js";

const app = express();
// Render terminates HTTPS at its reverse proxy. Trust only the first proxy hop.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
app.use(helmet());
// app.use(cors({
//     origin: "http://localhost:5173",
//     credentials: true,
// }));
const allowedOrigins = [
  "http://localhost:5173",
  "https://elite-inventory-system-1.onrender.com",
  "https://elitefullstack-frontend.onrender.com",
  "https://elite-inventory-frontend.onrender.com",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(requestIdMiddleware);
app.use(morgan("dev"));

app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    logger.info("HTTP request completed", {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });
  next();
});

app.use(cookieParser());
app.use("/api", apiRateLimit);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Inventory API is running successfully.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/inventory-transactions", transactionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/notifications/fcm-token", fcmTokenRoutes);
app.use("/api/notifications/push", firebasePushRoutes);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: "Elite Inventory API Docs",
  }),
);

app.get("/api-docs.json", (_req, res) => {
  res.json(swaggerSpec);
});

app.use(errorMiddleware);

export default app;
