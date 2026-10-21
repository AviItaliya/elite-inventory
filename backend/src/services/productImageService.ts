import productRepository from "../repositories/productRepository.js";
import AppError from "../utils/AppError.js";
import imageService from "./imageService.js";
import s3ImageService from "./s3ImageService.js";

type ImageProvider = "CLOUDINARY" | "S3";

class ProductImageService {
  private getConfiguredProvider(): ImageProvider {
    return process.env.IMAGE_STORAGE_PROVIDER?.toLowerCase() === "s3" ? "S3" : "CLOUDINARY";
  }
  private async deleteStoredImage(
    provider: string | null,
    publicId: string | null,
    imageKey: string | null,
  ): Promise<void> {
    const actualProvider = provider ?? (publicId ? "CLOUDINARY" : imageKey ? "S3" : null);
    if(actualProvider === "S3" && imageKey) {
      await s3ImageService.deleteImage(imageKey);
      return;
    }
    if(actualProvider === "CLOUDINARY" && publicId) {
      await imageService.deleteImage(publicId);
    }
  }

  async uploadOrReplace(productId: string, file: Express.Multer.File) {
    if(!file) {
      throw new AppError("Product image is required.", 400);
    }
    const product = await productRepository.findById(productId);
    if(!product) {
      throw new AppError("Product not found.", 404);
    }
    const provider = this.getConfiguredProvider();
    let imageUrl: string | null = null;
    let imagePublicId: string | null = null;
    let imageKey: string | null = null;
    if(provider === "S3") {
      const uploadedImage = await s3ImageService.uploadImage(file, "products");
      imageKey = uploadedImage.key;
    } else {
      const uploadedImage = await imageService.uploadImage(file, "products");
      imageUrl = uploadedImage.url;
      imagePublicId = uploadedImage.publicId;
    }
    let updatedProduct;
    try {
      updatedProduct = await productRepository.updateImage(productId, imageUrl, imagePublicId, provider, imageKey);
    } catch (error) {
      try {
        await this.deleteStoredImage(provider, imagePublicId, imageKey);
      } catch (cleanupError) {
        console.error("Failed to clean up uploaded product image:", cleanupError);
      }
      throw error;
    }
    try {
      await this.deleteStoredImage(
        product.imageProvider,
        product.imagePublicId,
        product.imageKey,
      );
    } catch (error) {
      console.error("Failed to delete previous product image:", error);
    }
    if(provider === "S3" && imageKey) {
      return {
        ...updatedProduct,
        imageUrl: await s3ImageService.getImageUrl(imageKey)
      };
    }
    return updatedProduct;
  }

  async deleteImage(productId: string) {
    const product = await productRepository.findById(productId);
    if(!product) {
      throw new AppError("Product not found.", 404);
    }
    if(!product.imagePublicId && !product.imageKey) {
      throw new AppError("This product does not have an image.", 400);
    }
    await this.deleteStoredImage(product.imageProvider, product.imagePublicId, product.imageKey);
    return productRepository.updateImage(productId, null, null, null, null);
  }
}
export default new ProductImageService();