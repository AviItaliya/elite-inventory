import productRepository from "../repositories/productRepository.js";
import imageService from "./imageService.js";
import AppError from "../utils/AppError.js";

class ProductImageService {
  // ==========================================
  // Upload / Replace Product Image
  // ==========================================

  async uploadOrReplace(productId: string, file: Express.Multer.File) {
    if (!file) {
      throw new AppError("Product image is required.", 400);
    }

    const product = await productRepository.findById(productId);

    if (!product) {
      throw new AppError("Product not found.", 404);
    }

    // Upload new image to Cloudinary
    const uploadedImage = await imageService.uploadImage(file, "products");

    let updatedProduct;

    try {
      // Save new image reference in PostgreSQL
      updatedProduct = await productRepository.updateImage(
        productId,
        uploadedImage.url,
        uploadedImage.publicId,
      );
    } catch (error) {
      // Database failed: clean up newly uploaded image
      try {
        await imageService.deleteImage(uploadedImage.publicId);
      } catch (cleanupError) {
        console.error(
          "Failed to clean up uploaded product image:",
          cleanupError,
        );
      }

      throw error;
    }

    // Delete old image only after successful DB update
    if (
      product.imagePublicId &&
      product.imagePublicId !== uploadedImage.publicId
    ) {
      try {
        await imageService.deleteImage(product.imagePublicId);
      } catch (error) {
        console.error("Failed to delete previous product image:", error);
      }
    }

    return updatedProduct;
  }

  // ==========================================
  // Delete Product Image
  // ==========================================

  async deleteImage(productId: string) {
    const product = await productRepository.findById(productId);

    if (!product) {
      throw new AppError("Product not found.", 404);
    }

    if (!product.imagePublicId) {
      throw new AppError("This product does not have an image.", 400);
    }

    // Remove image references from PostgreSQL first
    const updatedProduct = await productRepository.updateImage(
      productId,
      null,
      null,
    );

    // Delete Cloudinary image after successful DB update
    try {
      await imageService.deleteImage(product.imagePublicId);
    } catch (error) {
      console.error("Failed to delete product image from Cloudinary:", error);
    }

    return updatedProduct;
  }
}

export default new ProductImageService();
