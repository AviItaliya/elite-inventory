import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { FormEvent } from "react";

import type { Product } from "../../services/productService";

import { useAppDispatch, useAppSelector } from "../../store/hooks";

import { editProduct } from "../../store/slices/productSlice";

interface EditProductFormProps {
  product: Product;
}

const EditProductForm = ({ product }: EditProductFormProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { mutationLoading } = useAppSelector(
    (state) => state.product
  );

  const categories = useAppSelector(
    (state) => state.category.categories
  );

  const suppliers = useAppSelector(
    (state) => state.supplier.suppliers
  );

  // Initialize form directly from product data

  const [name, setName] = useState(product.name);

  const [description, setDescription] = useState(
    product.description ?? ""
  );

  const [sku, setSku] = useState(product.sku);

  const [purchasePrice, setPurchasePrice] = useState(
    String(product.purchasePrice)
  );

  const [price, setPrice] = useState(
    String(product.price)
  );

  const [quantity, setQuantity] = useState(
    String(product.quantity)
  );

  const [minStock, setMinStock] = useState(
    String(product.minStock)
  );

  const [categoryId, setCategoryId] = useState(
    product.categoryId
  );

  const [supplierId, setSupplierId] = useState(
    product.supplierId
  );

  const [submitError, setSubmitError] = useState("");

  // Submit updated product

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSubmitError("");

    // Required field validation

    if (
      !name.trim() ||
      !sku.trim() ||
      !purchasePrice ||
      !price ||
      !categoryId ||
      !supplierId ||
      quantity === "" ||
      minStock === ""
    ) {
      setSubmitError("Please fill all required fields.");
      return;
    }

    // Convert numeric values

    const purchasePriceValue = Number(purchasePrice);
    const sellingPriceValue = Number(price);
    const quantityValue = Number(quantity);
    const minStockValue = Number(minStock);

    // Price validation

    if (
      !Number.isFinite(purchasePriceValue) ||
      purchasePriceValue < 0 ||
      !Number.isFinite(sellingPriceValue) ||
      sellingPriceValue <= 0
    ) {
      setSubmitError(
        "Please enter valid purchase and selling prices."
      );
      return;
    }

    // Stock validation

    if (
      !Number.isInteger(quantityValue) ||
      quantityValue < 0 ||
      !Number.isInteger(minStockValue) ||
      minStockValue < 0
    ) {
      setSubmitError(
        "Quantity and minimum stock must be non-negative integers."
      );
      return;
    }

    try {
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
        })
      ).unwrap();

      navigate("/products");
    } catch (error) {
      console.error("Failed to update product:", error);

      setSubmitError(
        typeof error === "string"
          ? error
          : "Failed to update product."
      );
    }
  };

  return (
    <form
      className="product-form"
      onSubmit={handleSubmit}
    >
      {/* Submit Error */}

      {submitError && (
        <div className="product-form__error">
          {submitError}
        </div>
      )}

      {/* Product Name */}

      <div className="product-form__group">
        <label htmlFor="name">
          Product Name
        </label>

        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          required
        />
      </div>

      {/* SKU */}

      <div className="product-form__group">
        <label htmlFor="sku">
          SKU
        </label>

        <input
          id="sku"
          type="text"
          value={sku}
          onChange={(event) =>
            setSku(event.target.value)
          }
          required
        />
      </div>

      {/* Description */}

      <div className="product-form__group product-form__full">
        <label htmlFor="description">
          Description
        </label>

        <input
          id="description"
          type="text"
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
        />
      </div>

      {/* Purchase Price */}

      <div className="product-form__group">
        <label htmlFor="purchasePrice">
          Purchase Price
        </label>

        <input
          id="purchasePrice"
          type="number"
          min="0"
          step="0.01"
          value={purchasePrice}
          onChange={(event) =>
            setPurchasePrice(event.target.value)
          }
          required
        />
      </div>

      {/* Selling Price */}

      <div className="product-form__group">
        <label htmlFor="price">
          Selling Price
        </label>

        <input
          id="price"
          type="number"
          min="0.01"
          step="0.01"
          value={price}
          onChange={(event) =>
            setPrice(event.target.value)
          }
          required
        />
      </div>

      {/* Quantity */}

      <div className="product-form__group">
        <label htmlFor="quantity">
          Quantity
        </label>

        <input
          id="quantity"
          type="number"
          min="0"
          step="1"
          value={quantity}
          onChange={(event) =>
            setQuantity(event.target.value)
          }
          required
        />
      </div>

      {/* Minimum Stock */}

      <div className="product-form__group">
        <label htmlFor="minStock">
          Minimum Stock
        </label>

        <input
          id="minStock"
          type="number"
          min="0"
          step="1"
          value={minStock}
          onChange={(event) =>
            setMinStock(event.target.value)
          }
          required
        />
      </div>

      {/* Category */}

      <div className="product-form__group">
        <label htmlFor="category">
          Category
        </label>

        <select
          id="category"
          value={categoryId}
          onChange={(event) =>
            setCategoryId(event.target.value)
          }
          required
        >
          <option value="">
            Select Category
          </option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Supplier */}

      <div className="product-form__group">
        <label htmlFor="supplier">
          Supplier
        </label>

        <select
          id="supplier"
          value={supplierId}
          onChange={(event) =>
            setSupplierId(event.target.value)
          }
          required
        >
          <option value="">
            Select Supplier
          </option>

          {suppliers.map((supplier) => (
            <option
              key={supplier.id}
              value={supplier.id}
            >
              {supplier.name}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}

      <div className="product-form__actions">
        <button
          type="button"
          className="btn btn--danger"
          disabled={mutationLoading}
          onClick={() => navigate("/products")}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="btn btn--primary"
          disabled={mutationLoading}
        >
          {mutationLoading
            ? "Updating..."
            : "Update Product"}
        </button>
      </div>
    </form>
  );
};

export default EditProductForm;