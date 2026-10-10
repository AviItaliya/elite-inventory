import { useEffect, useState } from "react";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchInventory, fetchInventoryFilters, setCategoryId, setSearchQuery, setStatus, setSupplierId } from "../../store/slices/inventorySlice";

function Inventory() {
    const dispatch = useAppDispatch();
    const {products, categories, suppliers, searchQuery, categoryId, supplierId, status, loading, error} = useAppSelector((state) => state.inventory);
    const [search, setSearch] = useState("");


    useEffect(() => {
        void dispatch(fetchInventoryFilters());
    }, [dispatch]);

    useEffect(() => {
        void dispatch(fetchInventory());
    }, [dispatch, searchQuery, categoryId, supplierId]);

    const getStockStatus = (quantity: number, minStock: number) => {
        if (quantity === 0) {
            return {
                label: "Out of Stock",
                className: "stock-status--out-of-stock",
            };
        }

        if (quantity < minStock) {
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

    const filteredProducts = products.filter((product) => {
        if (!status) {
            return true;
        }

        const productStatus = getStockStatus(
            product.quantity,
            product.minStock
        );

        return productStatus.label === status;
    });

    if (loading) {
        return (
            <div className="inventory-page">
                <div className="inventory-card">
                    <Loading />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="inventory-page">
                <div className="inventory-card">
                    <ErrorMessage message={error} />
                </div>
            </div>
        );
    }

    return (
        <div className="inventory-page">
            <div className="inventory-page__header">
                <div>
                    <h1>Inventory</h1>
                    <p>Manage stock in and stock out transactions.</p>
                </div>
            </div>

            <div className="inventory-card">
                <div className="inventory-filters">
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

                    <select
                        value={categoryId}
                        onChange={(event) => dispatch(setCategoryId(event.target.value))}
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
                        onChange={(event) => dispatch(setSupplierId(event.target.value))}
                    >
                        <option value="">All Suppliers</option>

                        {suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>
                                {supplier.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={status}
                        onChange={(event) => dispatch(setStatus(event.target.value))}
                    >
                        <option value="">All Status</option>
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                    </select>
                </div>

                <div className="inventory-table-wrapper">
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>SKU</th>
                                <th>Category</th>
                                <th>Supplier</th>
                                <th>Quantity</th>
                                <th>Min Stock</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="inventory-table__empty"
                                    >
                                        No products found.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => {
                                    const stockStatus = getStockStatus(
                                        product.quantity,
                                        product.minStock
                                    );

                                    return (
                                        <tr key={product.id}>
                                            <td>{product.name}</td>

                                            <td>{product.sku}</td>

                                            <td>
                                                {product.category.name}
                                            </td>

                                            <td>
                                                {product.supplier.name}
                                            </td>

                                            <td>{product.quantity}</td>

                                            <td>{product.minStock}</td>

                                            <td>
                                                <span
                                                    className={`stock-status ${stockStatus.className}`}
                                                >
                                                    {stockStatus.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Inventory;