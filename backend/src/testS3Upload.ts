import { readFile } from "node:fs/promises";
import path from "node:path";
import s3ImageService from "./services/s3ImageService.js";

async function testS3Upload() {
    try {
        const filePath = path.join(
            process.cwd(), "uploads", "test-product.jpg"
        );

        const buffer = await readFile(filePath);
        const file = {
            buffer, originalname: "test-product.jpg",
            mimetype: "image/jpeg",
            size: buffer.length,
        } as Express.Multer.File;
        console.log("Uploading image to Amazon S3...");
        const result = await s3ImageService.uploadImage(file, "products");
        console.log("Image uploaded successfully!");
        console.log("S3 Object Key:", result.key);
        const imageUrl = await s3ImageService.getImageUrl(result.key);
        console.log("presigned URL generated successfully!");
        console.log("URL:", imageUrl);
    } catch (error) {
        console.error("S3 test failed:", error);
        process.exitCode = 1;
    }
}

testS3Upload();