import { rateLimit } from "express-rate-limit";

const createRateLimiter = (windowMs: number, limit: number, message: string) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });

export const loginRateLimit = createRateLimiter(15 * 60 * 1000, 10,
  "Too many login attempts. Please try again in 15 minutes.",
);

export const registrationRateLimit = createRateLimiter(60 * 60 * 1000, 5,
  "Too many registration attempts. Please try again later.",
);

export const passwordResetRateLimit = createRateLimiter(15 * 60 * 1000, 5,
  "Too many password-reset requests. Please try again in 15 minutes.",
);

// Separate refresh-token abuse protection from login limits.
export const refreshRateLimit = createRateLimiter(15 * 60 * 1000, 60,
  "Too many token refresh requests. Please try again later.",
);
