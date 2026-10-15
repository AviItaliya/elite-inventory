import { Server } from "socket.io";
import type { Server as HTTPServer } from "node:http";
import { socketAuthMiddleware } from "../middlewares/socketAuthMiddleware.js";

let io: Server | null = null;

const allowedOrigins = [
  "http://localhost:5173",
  "https://elite-inventory-system-1.onrender.com",
  "https://elitefullstack-frontend.onrender.com",
  "https://elite-inventory-frontend.onrender.com"
];

export const initializeSocket = (httpServer: HTTPServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    const user = socket.data.user;

    if (!user?.id || !user?.role) {
      socket.disconnect(true);
      return;
    }

    console.log(`Authenticated socket connected: ${socket.id}`);

    // Inventory updates
    socket.join("inventory:subscribers");

    // Personal notifications
    socket.join(`user:${user.id}`);

    // Role-based events
    socket.join(`role:${user.role}`);

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id}`, reason);
    });
  });

  console.log("Socket.IO initialized");

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};
