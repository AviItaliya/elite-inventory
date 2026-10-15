import type { Request, Response } from "express";
import { z } from "zod";
import fcmTokenService from "../services/fcmTokenService.js";

const tokenSchema = z.object({
    token: z.string().trim().min(1).max(4096),
});

class FcmTokenController {
    async register(req:Request, res:Response) {
        try {
            const parsed = tokenSchema.safeParse(req.body);
            if(!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid FCM token.",
                });
            }

            const userId = req.user?.id;
            if(!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized.",
                });
            }

            await fcmTokenService.registerToken(userId, parsed.data.token);
            return res.status(200).json({
                success: true,
                message: "FCM token registerd successfully.",
            });
        } catch (error) {
            console.error("FCM token registration failed:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to registre FCM token.",
            });
        }
    }

    async remove(req:Request, res:Response) {
        try {
            const parsed = tokenSchema.safeParse(req.body);
            if(!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid FCM token.",
                });
            }

            const userId = req.user?.id;

            if(!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized.",
                });
            }

            await fcmTokenService.removeToken(userId, parsed.data.token);

            return res.status(200).json({
                success: true,
                message: "FCM token removed successfully.",
            });
        } catch (error) {
            console.error("FCM token removal failed:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to remove FCM token.",
            });
        }
    }
}

export default new FcmTokenController();
