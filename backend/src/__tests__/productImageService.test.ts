import { jest } from "@jest/globals";

type MockArgs = unknown[];

const mockFindById = jest.fn<(...args: MockArgs) => Promise<unknown>>();
const mockUpdateImage = jest.fn<
  (
    id: string,
    imageUrl: string | null,
    imagePublicId: string | null,
    imageProvider: string | null,
    imageKey: string | null,
  ) => Promise<unknown>
>();
const mockCloudinaryUpload = jest.fn<(...args: MockArgs) => Promise<unknown>>();
const mockCloudinaryDelete = jest.fn<(...args: MockArgs) => Promise<void>>();
const mockS3Upload = jest.fn<(...args: MockArgs) => Promise<unknown>>();
const mockS3Delete = jest.fn<(...args: MockArgs) => Promise<void>>();
const mockS3GetImageUrl = jest.fn<(...args: MockArgs) => Promise<string>>();

jest.unstable_mockModule("../repositories/productRepository.js", () => ({
  default: {
    findById: mockFindById,
    updateImage: mockUpdateImage,
  },
}));

jest.unstable_mockModule("../services/imageService.js", () => ({
  default: {
    uploadImage: mockCloudinaryUpload,
    deleteImage: mockCloudinaryDelete,
  },
}));

jest.unstable_mockModule("../services/s3ImageService.js", () => ({
  default: {
    uploadImage: mockS3Upload,
    deleteImage: mockS3Delete,
    getImageUrl: mockS3GetImageUrl,
  },
}));

const { default: productImageService } =
  await import("../services/productImageService.js");

const mockFile = {
  buffer: Buffer.from("test image"),
  originalname: "test.jpg",
  mimetype: "image/jpeg",
} as Express.Multer.File;

const existingProduct = {
  id: "product-1",
  imageUrl: "https://cloudinary.example/old.jpg",
  imagePublicId: "products/old-image",
  imageProvider: "CLOUDINARY",
  imageKey: null,
};

describe("ProductImageService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.IMAGE_STORAGE_PROVIDER = "cloudinary";

    mockFindById.mockResolvedValue(existingProduct);
    mockUpdateImage.mockImplementation(
      async (
        _id: string,
        imageUrl: string | null,
        imagePublicId: string | null,
        imageProvider: string | null,
        imageKey: string | null,
      ) => ({
        ...existingProduct,
        imageUrl,
        imagePublicId,
        imageProvider,
        imageKey,
      }),
    );

    mockCloudinaryUpload.mockResolvedValue({
      url: "https://cloudinary.example/new.jpg",
      publicId: "products/new-image",
    });

    mockCloudinaryDelete.mockResolvedValue(undefined);

    mockS3Upload.mockResolvedValue({
      key: "products/new-image.jpg",
    });

    mockS3Delete.mockResolvedValue(undefined);

    mockS3GetImageUrl.mockResolvedValue(
      "https://signed-s3.example/new-image.jpg",
    );
  });

  afterAll(() => {
    delete process.env.IMAGE_STORAGE_PROVIDER;
  });

  it("uploads a product image to Cloudinary by default", async () => {
    const result = await productImageService.uploadOrReplace(
      "product-1",
      mockFile,
    );

    expect(mockCloudinaryUpload).toHaveBeenCalledWith(mockFile, "products");
    expect(mockS3Upload).not.toHaveBeenCalled();

    expect(mockUpdateImage).toHaveBeenCalledWith(
      "product-1",
      "https://cloudinary.example/new.jpg",
      "products/new-image",
      "CLOUDINARY",
      null,
    );

    expect(result.imageUrl).toBe("https://cloudinary.example/new.jpg");
  });

  it("uploads to S3 and returns a signed URL when S3 is configured", async () => {
    process.env.IMAGE_STORAGE_PROVIDER = "s3";

    const result = await productImageService.uploadOrReplace(
      "product-1",
      mockFile,
    );

    expect(mockS3Upload).toHaveBeenCalledWith(mockFile, "products");
    expect(mockCloudinaryUpload).not.toHaveBeenCalled();

    expect(mockUpdateImage).toHaveBeenCalledWith(
      "product-1",
      null,
      null,
      "S3",
      "products/new-image.jpg",
    );

    expect(mockS3GetImageUrl).toHaveBeenCalledWith("products/new-image.jpg");
    expect(result.imageUrl).toBe("https://signed-s3.example/new-image.jpg");
  });

  it("rejects uploads when the product does not exist", async () => {
    mockFindById.mockResolvedValue(null);

    await expect(
      productImageService.uploadOrReplace("missing-product", mockFile),
    ).rejects.toMatchObject({
      message: "Product not found.",
      statusCode: 404,
    });

    expect(mockCloudinaryUpload).not.toHaveBeenCalled();
    expect(mockS3Upload).not.toHaveBeenCalled();
  });

  it("rejects uploads when no file is provided", async () => {
    await expect(
      productImageService.uploadOrReplace(
        "product-1",
        undefined as unknown as Express.Multer.File,
      ),
    ).rejects.toMatchObject({
      message: "Product image is required.",
      statusCode: 400,
    });

    expect(mockCloudinaryUpload).not.toHaveBeenCalled();
    expect(mockS3Upload).not.toHaveBeenCalled();
  });

  it("deletes the previous Cloudinary image after replacement", async () => {
    await productImageService.uploadOrReplace("product-1", mockFile);

    expect(mockCloudinaryDelete).toHaveBeenCalledWith("products/old-image");
  });

  it("clears the database image fields when deleting a Cloudinary image", async () => {
    const result = await productImageService.deleteImage("product-1");

    expect(mockCloudinaryDelete).toHaveBeenCalledWith("products/old-image");

    expect(mockUpdateImage).toHaveBeenCalledWith(
      "product-1",
      null,
      null,
      null,
      null,
    );

    expect(result.imageUrl).toBeNull();
    expect(result.imagePublicId).toBeNull();
  });

  it("deletes an S3 image using its stored key", async () => {
    mockFindById.mockResolvedValue({
      ...existingProduct,
      imageUrl: null,
      imagePublicId: null,
      imageProvider: "S3",
      imageKey: "products/existing-image.jpg",
    });

    await productImageService.deleteImage("product-1");

    expect(mockS3Delete).toHaveBeenCalledWith("products/existing-image.jpg");

    expect(mockCloudinaryDelete).not.toHaveBeenCalled();

    expect(mockUpdateImage).toHaveBeenCalledWith(
      "product-1",
      null,
      null,
      null,
      null,
    );
  });

  it("preserves database image references when storage deletion fails", async () => {
    mockS3Delete.mockRejectedValue(new Error("S3 deletion failed"));

    mockFindById.mockResolvedValue({
      ...existingProduct,
      imageUrl: null,
      imagePublicId: null,
      imageProvider: "S3",
      imageKey: "products/existing-image.jpg",
    });

    await expect(productImageService.deleteImage("product-1")).rejects.toThrow(
      "S3 deletion failed",
    );

    expect(mockUpdateImage).not.toHaveBeenCalled();
  });

  it("cleans up the newly uploaded image if the database update fails", async () => {
    mockUpdateImage.mockRejectedValue(new Error("Database update failed"));

    await expect(
      productImageService.uploadOrReplace("product-1", mockFile),
    ).rejects.toThrow("Database update failed");

    expect(mockCloudinaryDelete).toHaveBeenCalledWith("products/new-image");
  });

  it("rejects deleting an image when the product does not exist", async () => {
    mockFindById.mockResolvedValue(null);

    await expect(
      productImageService.deleteImage("missing-product"),
    ).rejects.toMatchObject({
      message: "Product not found.",
      statusCode: 404,
    });

    expect(mockCloudinaryDelete).not.toHaveBeenCalled();
    expect(mockS3Delete).not.toHaveBeenCalled();
  });
});
