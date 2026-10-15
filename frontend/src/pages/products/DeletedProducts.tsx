import { useEffect, useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";

import {
  getDeletedProducts,
  restoreDeletedProduct,
  type DeletedProduct,
} from "../../services/productService";

import "../../styles/_recycleBin.scss";

const DeletedProducts = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<DeletedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedProduct, setSelectedProduct] = useState<DeletedProduct | null>(
    null,
  );

  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    let active = true;

    getDeletedProducts()
      .then((data) => {
        if (active) setProducts(data);
      })
      .catch(() => {
        if (active) setError("Failed to fetch deleted products.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleRestore = async () => {
    if (!selectedProduct || restoring) return;

    try {
      setRestoring(true);
      setError("");
      setSuccess("");

      await restoreDeletedProduct(selectedProduct.id);

      setProducts((previous) =>
        previous.filter((product) => product.id !== selectedProduct.id),
      );

      setSuccess(`Product "${selectedProduct.name}" restored successfully.`);

      setSelectedProduct(null);
    } catch {
      setError("Failed to restore product.");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="products-page recycle-bin">
      <div className="products-page__header">
        <div>
          <h1>Recycle Bin</h1>
          <p>View and restore deleted inventory products.</p>
        </div>

        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => navigate("/products")}
        >
          <ArrowLeft size={18} />
          Back to Products
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      {success && (
        <p className="recycle-bin__success" role="status">
          {success}
        </p>
      )}

      {loading ? (
        <Loading />
      ) : (
        <div className="products-card">
          {products.length === 0 ? (
            <div className="recycle-bin__empty">
              <RotateCcw size={36} />
              <h3>Recycle Bin is empty</h3>
              <p>No deleted products found.</p>
            </div>
          ) : (
            <div className="recycle-bin__scroll">
              <table className="recycle-bin__table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Deleted At</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>

                      <td>{product.sku}</td>

                      <td>{product.category?.name ?? "—"}</td>

                      <td>
                        {product.deletedAt
                          ? new Date(product.deletedAt).toLocaleString()
                          : "—"}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="btn btn--primary"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <RotateCcw size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {selectedProduct && (
        <div
          className="recycle-bin__overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !restoring) {
              setSelectedProduct(null);
            }
          }}
        >
          <div
            className="recycle-bin__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="restore-title"
          >
            <h2 id="restore-title">Restore Product?</h2>

            <p>
              Are you sure you want to restore{" "}
              <strong>{selectedProduct.name}</strong>?
            </p>

            <div className="recycle-bin__dialog-actions">
              <button
                type="button"
                className="btn"
                disabled={restoring}
                onClick={() => setSelectedProduct(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn--primary"
                disabled={restoring}
                onClick={() => void handleRestore()}
              >
                {restoring ? "Restoring..." : "Restore Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeletedProducts;
