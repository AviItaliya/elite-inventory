import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {fetchCategories} from "../../store/slices/categorySlice";
import {fetchSuppliers} from "../../store/slices/supplierSlice";
import {fetchProductById, editProduct} from "../../store/slices/productSlice";

const EditProduct = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const {selectedProduct, loading, mutationLoading, error} = useAppSelector((state) => state.product);
    const categories = useAppSelector((state) => state.category.categories);
    const suppliers = useAppSelector((state) => state.supplier.suppliers);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [sku, setSku] = useState("");
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [minStock, setMinStock] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [supplierId, setSupplierId] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [initializedProductId, setInitializedProductId] = useState<string | null>(null);

    useEffect(() => {
    if (!id) {
        return;
    }
        void dispatch(fetchProductById(id));
        void dispatch(fetchCategories());
        void dispatch(fetchSuppliers());
    }, [dispatch, id]);

    if (selectedProduct && initializedProductId !== selectedProduct.id) {
        setName(selectedProduct.name);
        setDescription(selectedProduct.description);
        setSku(selectedProduct.sku);
        setPrice(String(selectedProduct.price));
        setQuantity(String(selectedProduct.quantity));
        setMinStock(String(selectedProduct.minStock));
        setCategoryId(String(selectedProduct.categoryId));
        setSupplierId(String(selectedProduct.supplierId));
        setInitializedProductId(selectedProduct.id);
    }

const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
) => {
    event.preventDefault();
    setSubmitError("");
    if (!id) {
        setSubmitError("Product ID not found.");
        return;
    }
    if (!name || !sku || !categoryId || !price || !supplierId) {
        setSubmitError("Please fill all required fields.");
        return;
    }
    try {
        await dispatch(
            editProduct({
                id,
                product: {
                    name,
                    description,
                    sku,
                    price: Number(price),
                    quantity: Number(quantity),
                    minStock: Number(minStock),
                    categoryId,
                    supplierId,
                },
            })
        ).unwrap();
        navigate("/products");
    } catch (error) {
        console.error("Failed to update product:", error);
        setSubmitError((error as string) || "Failed to update product.");
    }
};

    if(loading && !selectedProduct) {
        return (
            <div className="products-page"><Loading /></div>
        );
    }

    if(error && !selectedProduct) {
        return (
            <div className="products-page"><ErrorMessage message={error} /></div>
        );
    }

  return (
    <div className="products-page">
        <div className="products-page__header">
            <div><h1>Edit Product</h1><p>Update product information.</p></div>    
            <button type="button" onClick={() => navigate("/products")}>Back to Products</button>
        </div>      
        <div className="products-card">
            <form className="product-form" onSubmit={handleSubmit}>
                {submitError && (
                    <div className="product-form__error">{submitError}</div>
                )}
                <div className="product-form__group">
                    <label htmlFor="">Product Name</label>
                    <input type="text" value={name} onChange={(event) => setName(event.target.value)} />
                </div>

                <div className="product-form__group">
                    <label htmlFor="">SKU</label>
                    <input type="text" value={sku} onChange={(event) => setSku(event.target.value)} />
                </div>

                <div className="product-form__group product-form__full">
                    <label htmlFor="">Description</label>
                    <input type="text" value={description} onChange={(event) => setDescription(event.target.value)} />
                </div>

                <div className="product-form__group">
                    <label htmlFor="">Price</label>
                    <input type="number" value={price} onChange={(event) => setPrice(event.target.value)} />
                </div>

                <div className="product-form__group">
                    <label htmlFor="">Quantity</label>
                    <input type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
                </div>

                <div className="product-form__group">
                    <label htmlFor="">Minimum Stock</label>
                    <input type="number" value={minStock} onChange={(event) => setMinStock(event.target.value)} />
                </div>

                <div className="product-form__group">
                    <label htmlFor="">Category</label>
                    <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>
                </div>

                <div className="product-form__group">
                    <label htmlFor="">Supplier</label>
                    <select value={supplierId} onChange={(event) => setSupplierId(event.target.value)}>
                        <option value="">Select Supplier</option>
                        {suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                        ))}
                    </select>
                </div>

                <div className="product-form__actions">
                    <button type="button" className="btn btn--danger" disabled={mutationLoading} onClick={() => navigate("/products")}>Cancel</button>
                    <button type="submit" className="btn btn--primary" disabled={mutationLoading}>{mutationLoading ? "Updating..." : "Update Product"}</button>
                </div>

            </form>
        </div>
    </div>
  );
}
export default EditProduct