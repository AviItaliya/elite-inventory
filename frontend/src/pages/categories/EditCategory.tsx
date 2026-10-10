import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  clearSelectedCategory,
  editCategory,
  fetchCategoryById,
} from "../../store/slices/categorySlice";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedCategory, loading, mutationLoading, error } = useAppSelector(
    (state) => state.category,
  );

  const [name, setName] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!id) {
        return;
    }

    const loadCategory = async () => {
        try {
            const result = await dispatch(
                fetchCategoryById(id)
            ).unwrap();

            setName(result.name);
        } catch (error) {
            console.error("Failed to load category:", error);
        }
    };

    void loadCategory();

    return () => {
        dispatch(clearSelectedCategory());
    };
}, [dispatch, id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!id) {
      setFormError("Category id is missing.");
      return;
    }
    setFormError("");
    if (!name.trim()) {
      setFormError("Category name is required.");
      return;
    }
    try {
      await dispatch(
        editCategory({ id, category: { name: name.trim() } }),
      ).unwrap();
      navigate("/categories");
    } catch (error) {
      console.error("Failed to update category:", error);
      setFormError("Failed to update category.");
    }
  };

  if (loading && !selectedCategory) {
    return (
      <div className="products-page">
        <Loading />
      </div>
    );
  }

  if (!selectedCategory && error && !name) {
    return (
      <div className="products-page">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-page__header">
        <div>
          <h1>Edit Category</h1>
          <p>Update category information.</p>
        </div>
      </div>

      <div className="products-card">
        <form className="product-form" onSubmit={handleSubmit}>
          <div className="product-form__group product-form__full">
            <label htmlFor="category-name">Category Name</label>

            <input
              type="text"
              id="category-name"
              value={name}
              onChange={(event) => {setName(event.target.value);
                setFormError("");
              }}
              placeholder="Enter category name"
            />
          </div>

          {(formError || error) && <div className="product-form__error">{formError || error}</div>}

          <div className="product-form__actions">
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => navigate("/categories")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn--primary"
              disabled={mutationLoading}
            >
              {mutationLoading ? "Updating..." : "Update Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategory;
