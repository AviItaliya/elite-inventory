import { Package, AlertTriangle, PackageX } from "lucide-react";
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

    const totalUnits = filteredProducts.reduce((sum, product) => sum + product.quantity, 0);
    const lowStockCount = filteredProducts.filter((product) => product.quantity > 0 && product.quantity < product.minStock).length;
    const outOfStockCount = filteredProducts.filter((product) => product.quantity === 0).length;

    if (loading) {
        return (
            <div className="inventory-page">
                    <Loading />
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

            <div className="inventory-overview" aria-label="Inventory overview for displayed products">
                <div className="inventory-overview__item"><span className="inventory-overview__icon inventory-overview__icon--blue"><Package size={20} /></span><div><small>Units in filtered inventory</small><strong>{totalUnits.toLocaleString("en-IN")}</strong></div></div>
                <div className="inventory-overview__item"><span className="inventory-overview__icon inventory-overview__icon--amber"><AlertTriangle size={20} /></span><div><small>Low-stock products</small><strong>{lowStockCount}</strong></div></div>
                <div className="inventory-overview__item"><span className="inventory-overview__icon inventory-overview__icon--red"><PackageX size={20} /></span><div><small>Out-of-stock products</small><strong>{outOfStockCount}</strong></div></div>
            </div>
            <div className="inventory-card">
                <div className="inventory-card__heading"><div><h2>Stock overview</h2><p>Browse and filter your inventory</p></div><span>{filteredProducts.length} products shown</span></div>
                <div className="inventory-filters">
                    <input
                        aria-label="Search inventory products"
                        type="text"
                        placeholder="Search products and press Enter..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                dispatch(setSearchQuery(search));
                            }
                        }}
                    />

                    <select
                        aria-label="Filter by category"
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
                        aria-label="Filter by supplier"
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
                        aria-label="Filter by stock status"
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

                                            <td><strong className="inventory-quantity">{product.quantity.toLocaleString("en-IN")}</strong><div className="inventory-stock-meter" aria-hidden="true"><span style={{ width: `${Math.min(100, product.minStock > 0 ? product.quantity / (product.minStock * 2) * 100 : product.quantity > 0 ? 100 : 0)}%` }} /></div></td>

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