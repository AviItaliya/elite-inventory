import { useEffect, useState } from "react";
import ProductImageEditor from "../../components/common/ProductImageEditor";
import { saveProductImage } from "../../services/productService";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchCategories } from "../../store/slices/categorySlice";
import { fetchSuppliers } from "../../store/slices/supplierSlice";
import { addProduct } from "../../store/slices/productSlice";

const CreateProduct = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const categories = useAppSelector((state) => state.category.categories);
  const suppliers = useAppSelector((state) => state.supplier.suppliers);
  const mutationLoading = useAppSelector(
    (state) => state.product.mutationLoading,
  );
  const mutationError = useAppSelector((state) => state.product.mutationError);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minStock, setMinStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [error, setError] = useState("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [purchasePrice, setPurchasePrice] = useState("");
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isSubmitting = saving || mutationLoading;

  useEffect(() => {
    void dispatch(fetchCategories());
    void dispatch(fetchSuppliers());
  }, [dispatch]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setError("");

    if (!createdProductId) {
      if (
        !name.trim() ||
        !sku.trim() ||
        !price ||
        !purchasePrice ||
        quantity === "" ||
        minStock === "" ||
        !categoryId ||
        !supplierId
      ) {
        setError("Please fill all required fields.");
        return;
      }
      if (
        !Number.isFinite(Number(price)) ||
        Number(price) <= 0 ||
        !Number.isFinite(Number(purchasePrice)) ||
        Number(purchasePrice) < 0
      ) {
        setError("Please enter valid purchase and selling prices.");
        return;
      }
      if (
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) < 0 ||
        !Number.isInteger(Number(minStock)) ||
        Number(minStock) < 0
      ) {
        setError("Quantity and minimum stock must be non-negative integers.");
        return;
      }
    }

    setSaving(true);
    try {
      let productId = createdProductId;
      if (!productId) {
        const created = await dispatch(
          addProduct({
            name: name.trim(),
            description: description.trim(),
            sku: sku.trim(),
            purchasePrice: Number(purchasePrice),
            price: Number(price),
            quantity: Number(quantity),
            minStock: Number(minStock),
            categoryId,
            supplierId,
          }),
        ).unwrap();
        productId = created.id;
        setCreatedProductId(productId);
      }
      if (productImage) {
        try {
          await saveProductImage(productId, productImage);
        } catch {
          setError(
            "Product saved, but image upload failed. Retry the image or go to Products and edit it.",
          );
          return;
        }
      }
      navigate("/products");
    } catch (err) {
      console.error("Failed to create product:", err);
      setError(
        typeof err === "string"
          ? err
          : mutationError || "Failed to create product.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="products-page">
      <div className="products-page__header">
        <div>
          <h1>Create Product</h1>
          <p>Add a new product to your inventory.</p>
        </div>
      </div>

      <div className="products-card">
        <form className="product-form" onSubmit={handleSubmit}>
          <div className="product-form__full">
            <ProductImageEditor
              onFileSelected={setProductImage}
              disabled={isSubmitting}
            />
          </div>
          {error && (
            <div className="product-form__error" role="alert">
              {error}
            </div>
          )}
          {createdProductId && (
            <p role="status">
              Product details saved. Only the image upload remains.{" "}
              <button
                type="button"
                className="btn btn--secondary"
                disabled={isSubmitting}
                onClick={() => navigate(`/products/${createdProductId}/edit`)}
              >
                Open Edit Product
              </button>
            </p>
          )}
          <div className="product-form__group">
            <label htmlFor="name">Product Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSubmitting || Boolean(createdProductId)}
              placeholder="Enter product name"
            />
          </div>

          <div className="product-form__group">
            <label htmlFor="description">Description</label>
            <textarea
              value={description}
              id="description"
              onChange={(event) => setDescription(event.target.value)}
              disabled={isSubmitting || Boolean(createdProductId)}
              placeholder="Enter product description"
            />
          </div>

          <div className="product-form__group">
            <label htmlFor="sku">SKU</label>
            <input
              type="text"
              id="sku"
              value={sku}
              onChange={(event) => setSku(event.target.value)}
              disabled={isSubmitting || Boolean(createdProductId)}
              placeholder="Enter SKU"
            />
          </div>

          <div className="product-form__group">
            <label htmlFor="price">Selling Price</label>
            <input
              type="number"
              id="price"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              disabled={isSubmitting || Boolean(createdProductId)}
              placeholder="Enter price"
              required
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
              onChange={(e) => setPurchasePrice(e.target.value)}
              disabled={isSubmitting || Boolean(createdProductId)}
              placeholder="Enter purchase price"
              required
            />
          </div>

          <div className="product-form__group">
            <label htmlFor="qty">Quantity</label>
            <input
              type="number"
              id="qty"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              disabled={isSubmitting || Boolean(createdProductId)}
              placeholder="Enter quantity"
            />
          </div>

          <div className="product-form__group">
            <label htmlFor="minStock">Minimum Stock</label>
            <input
              type="number"
              id="minStock"
              value={minStock}
              onChange={(event) => setMinStock(event.target.value)}
              disabled={isSubmitting || Boolean(createdProductId)}
              placeholder="Enter minimum stock"
            />
          </div>

          <div className="product-form__group">
            <label htmlFor="category">Category</label>
            <select
              value={categoryId}
              id="category"
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={isSubmitting || Boolean(createdProductId)}
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
              value={supplierId}
              id="supplier"
              onChange={(event) => setSupplierId(event.target.value)}
              disabled={isSubmitting || Boolean(createdProductId)}
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
              disabled={isSubmitting}
              onClick={() => navigate("/products")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : createdProductId
                  ? "Retry Image Upload"
                  : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateProduct;
