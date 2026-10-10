import type { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/jwt.js";

const authMiddleware = (req:Request, res:Response, next:NextFunction) => {
    const authHeader = req.headers.authorization;
    if(!authHeader) {
        throw new AppError("Authorization header is missing", 401);
    }
    if(!authHeader.startsWith("Bearer ")) {
        throw new AppError("Invalid authorization format", 401);
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = verifyAccessToken(token!);
        req.user = {
            id:payload.id,
            email:payload.email,
            role:payload.role
        };
        next();
    } catch (error) {
        throw new AppError("Invalid or expired access token", 401);        
    }
};
export default authMiddleware;
