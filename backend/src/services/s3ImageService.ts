import { fileTypeFromBuffer } from "file-type";
import type { ImageFolder } from "./imageService.js";
import { randomUUID } from "node:crypto";
import s3 from "../config/s3.js";
import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface UploadedS3Image {
    key: string;
}

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const bucketName = process.env.AWS_S3_BUCKET;

class S3ImageService {
    async uploadImage(file: Express.Multer.File, folder: ImageFolder): Promise<UploadedS3Image> {
        if(!file?.buffer) {
            throw new Error("Image file is required.");
        }

        if(!bucketName) {
            throw new Error("AWS_S3_BUCKET is not configured.");
        }

        const detectedType = await fileTypeFromBuffer(file.buffer);
        if(!detectedType || !allowedMimeTypes.has(detectedType.mime)) {
            throw new Error("Invalid image content. Only JPG, PNG, and WebP are allowed.");
        }
        const extension = detectedType.mime === "image/jpeg" ? "jpg" : detectedType.mime === "image/png" ? "png" : "webp";
        const key = `${folder}/${randomUUID()}.${extension}`;
        await s3.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: detectedType.mime,
        }));
        return {key};
    }

    async getImageUrl(key: string): Promise<string> {
        if(!bucketName) {
            throw new Error("AWS_S3_BUCKET is not configured.");
        }

        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key
        });

        return getSignedUrl (s3, command, {
            expiresIn: 300,
        });
    }

    async deleteImage(key:string): Promise<void> {
        if(!key) {
            return;
        }

        if(!bucketName) {
            throw new Error("AWS_S3_BUCKET is not configured.");
        }
        await s3.send(new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
        }));
    }
}

export default new S3ImageService();