import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FormEvent } from "react";
import ProductImageEditor from "../../components/common/ProductImageEditor";
import { saveProductImage, removeProductImage, type Product } from "../../services/productService";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { editProduct } from "../../store/slices/productSlice";

interface EditProductFormProps {
  product: Product;
}

const EditProductForm = ({ product }: EditProductFormProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { mutationLoading } = useAppSelector((state) => state.product);
  const categories = useAppSelector((state) => state.category.categories);
  const suppliers = useAppSelector((state) => state.supplier.suppliers);
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [sku, setSku] = useState(product.sku);
  const [purchasePrice, setPurchasePrice] = useState(String(product.purchasePrice));
  const [price, setPrice] = useState(String(product.price));
  const [quantity, setQuantity] = useState(String(product.quantity));
  const [minStock, setMinStock] = useState(String(product.minStock));
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [supplierId, setSupplierId] = useState(product.supplierId);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [partialSuccess, setPartialSuccess] = useState(false);
  const [detailsSaved, setDetailsSaved] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving || mutationLoading) return;
    setSubmitError("");
    if (!detailsSaved) setPartialSuccess(false);
    if (
      !name.trim() ||
      !sku.trim() ||
      purchasePrice === "" ||
      price === "" ||
      quantity === "" ||
      minStock === "" ||
      !categoryId ||
      !supplierId
    ) {
      setSubmitError("Please fill all required fields.");
      return;
    }

    const purchasePriceValue = Number(purchasePrice);
    const sellingPriceValue = Number(price);
    const quantityValue = Number(quantity);
    const minStockValue = Number(minStock);

    if (
      !Number.isFinite(purchasePriceValue) ||
      purchasePriceValue < 0 ||
      !Number.isFinite(sellingPriceValue) ||
      sellingPriceValue <= 0
    ) {
      setSubmitError("Please enter valid purchase and selling prices.");
      return;
    }

    if (
      !Number.isInteger(quantityValue) ||
      quantityValue < 0 ||
      !Number.isInteger(minStockValue) ||
      minStockValue < 0
    ) {
      setSubmitError("Quantity and minimum stock must be non-negative integers.");
      return;
    }
    setSaving(true);

    if (!detailsSaved) {
      try {
        // Step 1: Update product details.
        await dispatch(
          editProduct({
            id: product.id,
            product: {
              name: name.trim(),
              description: description.trim(),
              sku: sku.trim(),
              purchasePrice: purchasePriceValue,
              price: sellingPriceValue,
              quantity: quantityValue,
              minStock: minStockValue,
              categoryId,
              supplierId,
            },
          }),
        ).unwrap();
        setDetailsSaved(true);
      } catch (error) {
        console.error("Failed to update product:", error);
        setSubmitError(
          typeof error === "string" ? error : "Failed to update product.",
        );
        setSaving(false);
        return;
      }
    }

    try {
      // Step 2: Save image changes, if any.
      if (selectedImage) {
        await saveProductImage(
          product.id,
          selectedImage,
          Boolean(product.imageUrl),
        );
      } else if (removeImage && product.imageUrl) {
        await removeProductImage(product.id);
      }

      // Step 3: Navigate only after all operations succeed.
      navigate("/products");
    } catch (error) {
      console.error("Failed to update product image:", error);
      setPartialSuccess(true);
      setSubmitError("Product details were updated successfully, but the image change failed. Please retry saving the image.");
    } finally {
      setSaving(false);
    }
  };
  const isSaving = saving || mutationLoading;

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      {/* Product Image */}
      <div className="product-form__full">
        <ProductImageEditor
          imageUrl={product.imageUrl}
          onFileSelected={setSelectedImage}
          onRemoveChange={setRemoveImage}
          disabled={isSaving}
        />
      </div>

      {submitError && (
        <div className="product-form__error" role="alert">
          {submitError}
        </div>
      )}

      {partialSuccess && (
        <p role="status">
          Your product details are already saved. Only the image operation needs
          to be retried.
        </p>
      )}

      <div className="product-form__group">
        <label htmlFor="name">Product Name</label>

        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isSaving || detailsSaved}
          required
        />
      </div>

      <div className="product-form__group">
        <label htmlFor="sku">SKU</label>

        <input
          id="sku"
          type="text"
          value={sku}
          onChange={(event) => setSku(event.target.value)}
          disabled={isSaving || detailsSaved}
          required
        />
      </div>

      <div className="product-form__group product-form__full">
        <label htmlFor="description">Description</label>

        <input
          id="description"
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isSaving || detailsSaved}
        />
      </div>

      <div className="product-form__group">
        <label htmlFor="purchasePrice">Purchase Price</label>

        <input
          id="purchasePrice"
          type="number"
          min="0"
          step="0.01"
          value={purchasePrice}
          onChange={(event) => setPurchasePrice(event.target.value)}
          disabled={isSaving || detailsSaved}
          required
        />
      </div>

      <div className="product-form__group">
        <label htmlFor="price">Selling Price</label>

        <input
          id="price"
          type="number"
          min="0.01"
          step="0.01"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          disabled={isSaving || detailsSaved}
          required
        />
      </div>

      <div className="product-form__group">
        <label htmlFor="quantity">Quantity</label>

        <input
          id="quantity"
          type="number"
          min="0"
          step="1"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          disabled={isSaving || detailsSaved}
          required
        />
      </div>

      <div className="product-form__group">
        <label htmlFor="minStock">Minimum Stock</label>

        <input
          id="minStock"
          type="number"
          min="0"
          step="1"
          value={minStock}
          onChange={(event) => setMinStock(event.target.value)}
          disabled={isSaving || detailsSaved}
          required
        />
      </div>

      <div className="product-form__group">
        <label htmlFor="category">Category</label>

        <select
          id="category"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          disabled={isSaving || detailsSaved}
          required
        >
          <option value="">Select Category</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="product-form__group">
        <label htmlFor="supplier">Supplier</label>

        <select
          id="supplier"
          value={supplierId}
          onChange={(event) => setSupplierId(event.target.value)}
          disabled={isSaving || detailsSaved}
          required
        >
          <option value="">Select Supplier</option>

          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </div>

      <div className="product-form__actions">
        <button
          type="button"
          className="btn btn--danger"
          disabled={isSaving}
          onClick={() => navigate("/products")}
        >
          Cancel
        </button>

        <button type="submit" className="btn btn--primary" disabled={isSaving}>
          {isSaving
            ? "Updating..."
            : detailsSaved
              ? "Retry Image Change"
              : "Update Product"}
        </button>
      </div>
    </form>
  );
};

export default EditProductForm;