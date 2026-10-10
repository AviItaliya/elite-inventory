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

const app = express();
app.use(helmet());
// app.use(cors({
//     origin: "http://localhost:5173",
//     credentials: true,
// }));
const allowedOrigins = [
  "http://localhost:5173",
  "https://6w8hd8q0-5173.inc1.devtunnels.ms",
  "https://elite-inventory-system-1.onrender.com",
  "https://elitefullstack-frontend.onrender.com",
  "https://elite-inventory-phi.vercel.app",
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
app.use(express.json());
app.use(requestIdMiddleware);

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
app.use(apiRateLimit);

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
