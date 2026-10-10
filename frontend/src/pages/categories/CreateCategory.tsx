import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { addCategory } from "../../store/slices/categorySlice";

const CreateCategory = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const mutationLoading = useAppSelector((state) => state.category.mutationLoading);
    const reduxError = useAppSelector((state) => state.category.error);

    const [name, setName] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Category name is required.");
            return;
        }

        try {
            await dispatch (addCategory({
                name: name.trim(),
            })).unwrap();

            navigate("/categories");
        } catch (error) {
            console.error("Failed to create category:", error);
            setError(reduxError || "Failed to create category.");
        }
    };

    return (
        <div className="products-page">
            <div className="products-page__header">
                <div>
                    <h1>Create Category</h1>
                    <p>Add a new product category.</p>
                </div>
            </div>

            <div className="products-card">
                <form className="product-form" onSubmit={handleSubmit}>
                    <div className="product-form__group product-form__full">
                        <label htmlFor="category-name">
                            Category Name
                        </label>

                        <input
                            type="text"
                            id="category-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Enter category name"
                        />
                    </div>

                    {error && (
                        <div className="product-form__error">
                            {error}
                        </div>
                    )}

                    <div className="product-form__actions">
                        <button
                            type="button" className="btn btn--danger" disabled={mutationLoading}
                            onClick={() => navigate("/categories")}
                        >
                            Cancel
                        </button>

                        <button type="submit" className="btn btn--primary" disabled={mutationLoading}>
                            {mutationLoading ? "Creating..." : "Create Category"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCategory;