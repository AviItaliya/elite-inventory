import type { NextFunction, Request, Response } from "express"
import AppError from "../utils/AppError.js"

const authorize = (...roles: string[]) => {
    return (req:Request, res:Response, next:NextFunction) => {
        if(!req.user) {
            throw new AppError("Unauthorized", 401);
        }
        if(!roles.includes(req.user.role)) {
            throw new AppError("Forbidden", 403);
        }
        next();
    };
};
export default authorize;