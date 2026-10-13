import type { Socket } from "socket.io";
import { verifyAccessToken } from "../utils/jwt.js";

export const socketAuthMiddleware = (
  socket: Socket,
  next: (error?: Error) => void,
): void => {
  try {
    const token: unknown = socket.handshake.auth.token;

    if (typeof token !== "string" || token.trim().length === 0) {
      next(new Error("Authentication token is required"));
      return;
    }

    const payload = verifyAccessToken(token);

    if (typeof payload.id !== "string" || !payload.id || typeof payload.email !== "string" || !payload.email ||
        typeof payload.role !== "string" || !["ADMIN", "MANAGER", "STAFF"].includes(payload.role)
    ) {
      next(new Error("Invalid token payload"));
      return;
    }

    socket.data.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    next(new Error("Invalid or expired access token"));
  }
};