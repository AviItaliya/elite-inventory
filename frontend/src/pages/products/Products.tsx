import { useEffect, useState } from "react";
import { Download, Edit, FileSpreadsheet, PlusCircle, RotateCcw, Search, Trash, Upload, Package, AlertTriangle, PackageX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { downloadProductTemplateFile, exportProductFile, fetchProducts, importProductFile, removeProduct, setCategoryId, setOrder,
         setPage, setSearchQuery, setSortBy, setSupplierId } from "../../store/slices/productSlice";
import { fetchCategories } from "../../store/slices/categorySlice";
import { fetchSuppliers } from "../../store/slices/supplierSlice";

const Products = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const categories = useAppSelector((state) => state.category.categories);
  const suppliers = useAppSelector((state) => state.supplier.suppliers);

  const { products, page, totalPages, searchQuery, categoryId, supplierId, sortBy, order, loading, error
  } = useAppSelector((state) => state.product);
  const [search, setSearch] = useState(searchQuery);
  const [deleteError, setDeleteError] = useState("");
  const money = (value: number | string) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  const lowStockCount = products.filter(
    (p) => p.quantity > 0 && p.quantity <= p.minStock,
  ).length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;

  const canCreate = user?.role === "ADMIN" || user?.role === "MANAGER";
  const canEdit = user?.role === "ADMIN" || user?.role === "MANAGER";
  const canDelete = user?.role === "ADMIN";

  useEffect(() => {
    void dispatch(fetchProducts());
  }, [dispatch, page, searchQuery, categoryId, supplierId, sortBy, order]);

  useEffect(() => {
    void dispatch(fetchCategories());
    void dispatch(fetchSuppliers());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="products-page">
        <Loading />
      </div>
    );
  }

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity === 0) {
      return {
        label: "Out of Stock",
        className: "stock-status--out-of-stock",
      };
    }

    if (quantity <= minStock) {
      return {
        label: "Low Stock",
        className: "stock-status--low-stock",
      };
    }

    return {
      label: "In Stock",
      className: "stock-status--in-stock",
    };
  };

  const redirect = () => {
    navigate("/products/create");
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );
    if (!confirmed) {
      return;
    }

    try {
      setDeleteError("");
      await dispatch(removeProduct(id)).unwrap();
    } catch (error) {
      console.error("Failed to delete product:", error);
      setDeleteError("Failed to delete product.");
    }
  };

  const handleExport = async () => {
    try {
      const blob = await dispatch(exportProductFile()).unwrap();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "products.xlsx";
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export products:", error);
    }
  };

  const handleTemplateDownload = async () => {
    try {
      const blob = await dispatch(downloadProductTemplateFile()).unwrap();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "product-template.xlsx";
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download product template:", error);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      await dispatch(importProductFile(file)).unwrap();
      await dispatch(fetchProducts());
    } catch (error) {
      console.error("Failed to import products:", error);
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="products-page">
      <div className="products-page__header">
        <div>
          <h1>Products</h1>
          <p>Manage your inventory products.</p>
        </div>
        <div className="products-page__actions">
          {canDelete && (
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => navigate("/products/deleted")}
            >
              <RotateCcw size={18} />
              Recycle Bin
            </button>
          )}

          {canCreate && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={redirect}
            >
              <PlusCircle size={18} />
              Add Product
            </button>
          )}
        </div>
      </div>
      <div
        className="catalog-insights"
        aria-label="Inventory overview for current page"
      >
        <div className="catalog-insight">
          <span className="catalog-insight__icon catalog-insight__icon--blue">
            <Package size={20} />
          </span>
          <div>
            <span>Products on this page</span>
            <strong>{products.length}</strong>
          </div>
        </div>
        <div className="catalog-insight">
          <span className="catalog-insight__icon catalog-insight__icon--amber">
            <AlertTriangle size={20} />
          </span>
          <div>
            <span>Low stock</span>
            <strong>{lowStockCount}</strong>
          </div>
        </div>
        <div className="catalog-insight">
          <span className="catalog-insight__icon catalog-insight__icon--red">
            <PackageX size={20} />
          </span>
          <div>
            <span>Out of stock</span>
            <strong>{outOfStockCount}</strong>
          </div>
        </div>
      </div>
      <div className="products-card">
        {deleteError && <ErrorMessage message={deleteError} />}
        {error && (
          <ErrorState
            message={error}
            onRetry={() => void dispatch(fetchProducts())}
          />
        )}
        <div className="products-filters">
          <div className="searchbar">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  dispatch(setSearchQuery(search));
                }
              }}
            />
          </div>

          <div className="dropdown-menu">
            <select
              value={categoryId}
              onChange={(event) => {
                dispatch(setCategoryId(event.target.value));
              }}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={supplierId}
              onChange={(event) => {
                dispatch(setSupplierId(event.target.value));
              }}
            >
              <option value="">All Suppliers</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(event) => {
                dispatch(setSortBy(event.target.value));
              }}
            >
              <option value="createdAt">Date Added</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="quantity">Quantity</option>
            </select>

            <select
              value={order}
              onChange={(event) => {
                dispatch(setOrder(event.target.value));
              }}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          <div className="products-actions">
            {user?.role === "ADMIN" && (
              <>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={handleExport}
                >
                  <Download size={17} />
                  Export
                </button>

                <label className="btn btn--secondary">
                  <Upload size={17} />
                  Import
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleImport}
                    hidden
                  />
                </label>
              </>
            )}

            {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
              <button
                type="button"
                className="btn btn--secondary"
                onClick={handleTemplateDownload}
              >
                <FileSpreadsheet size={17} />
                Template
              </button>
            )}
          </div>
        </div>

        {!error && (
          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Supplier</th>
                  <th>Selling Price</th>
                  <th>Quantity</th>
                  <th>Min Stock</th>
                  <th>Status</th>
                  {(canEdit || canDelete) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={canEdit || canDelete ? 9 : 8}>
                      <EmptyState
                        title="No products found"
                        message={
                          searchQuery || categoryId || supplierId
                            ? "No products match your search or filters."
                            : "Add your first product to get started."
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const status = getStockStatus(
                      product.quantity,
                      product.minStock,
                    );
                    return (
                      <tr key={product.id}>
                        <td>
                          <span className="catalog-product-cell">
                            {product.imageUrl ? (
                              <img
                                className="catalog-product-thumb"
                                src={product.imageUrl}
                                alt=""
                                loading="lazy"
                              />
                            ) : (
                              <span className="catalog-product-thumb catalog-product-thumb--empty">
                                <Package size={19} />
                              </span>
                            )}
                            <span className="catalog-product-name">
                              {product.name}
                            </span>
                          </span>
                        </td>
                        <td>
                          <span className="catalog-sku">{product.sku}</span>
                        </td>
                        <td>{product.category.name}</td>
                        <td>{product.supplier.name}</td>
                        <td className="catalog-price">
                          {money(product.price)}
                        </td>
                        <td>{product.quantity}</td>
                        <td>{product.minStock}</td>
                        <td>
                          <span className={`stock-status ${status.className}`}>
                            {status.label}
                          </span>
                        </td>

                        {(canEdit || canDelete) && (
                          <td>
                            {canEdit && (
                              <button
                                type="button"
                                className="edit-icon"
                                aria-label={`Edit ${product.name}`}
                                title="Edit product"
                                onClick={() =>
                                  navigate(`/products/${product.id}/edit`)
                                }
                              >
                                <Edit size={18} />
                              </button>
                            )}

                            {canDelete && (
                              <button
                                type="button"
                                className="trash-icon"
                                aria-label={`Delete ${product.name}`}
                                title="Delete product"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash size={18} />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {!error && totalPages > 1 && (
          <div className="users-pagination">
            <button
              type="button"
              className="btn btn--primary"
              disabled={loading || page <= 1}
              onClick={() => dispatch(setPage(page - 1))}
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              className="btn btn--primary"
              disabled={loading || page >= totalPages}
              onClick={() => dispatch(setPage(page + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;