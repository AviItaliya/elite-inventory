import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {fetchCategories} from "../../store/slices/categorySlice";
import {fetchSuppliers} from "../../store/slices/supplierSlice";
import {addProduct} from "../../store/slices/productSlice";

const CreateProduct = () => {

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const categories = useAppSelector((state) => state.category.categories);
    const suppliers = useAppSelector((state) => state.supplier.suppliers);
    const mutationLoading = useAppSelector((state) => state.product.mutationLoading);
    const reduxError = useAppSelector((state) => state.product.error);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [sku, setSku] = useState("");
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [minStock, setMinStock] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [supplierId, setSupplierId] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
    void dispatch(fetchCategories());
    void dispatch(fetchSuppliers());
}, [dispatch]);

    const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
) => {
    event.preventDefault();
    setError("");
    if (!name || !sku || !price || !categoryId || !supplierId) {
        setError("Please fill all required fields.");
        return;
    }
    try {
        await dispatch(
            addProduct({
                name,
                description,
                sku,
                price: Number(price),
                quantity: Number(quantity),
                minStock: Number(minStock),
                categoryId,
                supplierId,
            })
        ).unwrap();
        navigate("/products");
    } catch (error) {
        console.error("Failed to create product:", error);
        setError((error as string) || reduxError || "Failed to create product.");
    }
};

  return (
    <div className="products-page">
        <div className="products-page__header">
            <div    >
                <h1>Create Product</h1>
                <p>Add a new product to your inventory.</p>
            </div>
        </div>      

        <div className="products-card">
            <form className="product-form" onSubmit={handleSubmit}>
                {error && (
                    <div className="product-form__error">
                        {error}
                    </div>
                )}
                <div className="product-form__group">
                    <label htmlFor="name">Product Name</label>
                    <input type="text" id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter product name" />
                </div>

                <div className="product-form__group">
                    <label htmlFor="description">Description</label>
                    <textarea value={description} id="description" onChange={(event) => setDescription(event.target.value)} placeholder="Enter product description" />
                </div>

                <div className="product-form__group">
                    <label htmlFor="sku">SKU</label>
                    <input type="text" id="sku" value={sku} onChange={(event) => setSku(event.target.value)} placeholder="Enter SKU" />
                </div>

                <div className="product-form__group">
                    <label htmlFor="price">Price</label>
                    <input type="number" id="price" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Enter price" />
                </div>

                <div className="product-form__group">
                    <label htmlFor="qty">Quantity</label>
                    <input type="number" id="qty" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="Enter quantity" />
                </div>

                <div className="product-form__group">
                    <label htmlFor="minStock">Minimum Stock</label>
                    <input type="number" id="minStock" value={minStock} onChange={(event) => setMinStock(event.target.value)} placeholder="Enter minimum stock" />
                </div>

                <div className="product-form__group">
                    <label htmlFor="category">Category</label>
                    <select value={categoryId} id="category" onChange={(event) => setCategoryId(event.target.value)}>
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>
                </div>

                <div className="product-form__group">
                    <label htmlFor="supplier">Supplier</label>
                    <select value={supplierId} id="supplier" onChange={(event) => setSupplierId(event.target.value)}>
                        <option value="">Select Supplier</option>
                        {suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                        ))}
                    </select>
                </div>
            <div className="product-form__actions">
                <button type="button" className="btn btn--danger" disabled={mutationLoading} onClick={() => navigate("/products")}>Cancle</button>
                <button type="submit" className="btn btn--primary" disabled={mutationLoading}>{mutationLoading ? "Creating..." : "Create Product"}</button>
            </div>
            </form>
        </div>
    </div>
  );
}
export default CreateProduct