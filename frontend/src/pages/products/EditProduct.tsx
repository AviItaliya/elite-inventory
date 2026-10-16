import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../store/hooks";

import {
  clearSelectedProduct,
  fetchProductById,
} from "../../store/slices/productSlice";

import { fetchCategories } from "../../store/slices/categorySlice";
import { fetchSuppliers } from "../../store/slices/supplierSlice";

import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";

import EditProductForm from "./EditProductForm";

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { selectedProduct, loading, error } = useAppSelector(
    (state) => state.product,
  );

  useEffect(() => {
    dispatch(clearSelectedProduct());

    if (id) {
      void dispatch(fetchProductById(id));
    }

    void dispatch(fetchCategories());
    void dispatch(fetchSuppliers());

    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, id]);

  if (!id) {
    return (
      <div className="products-page">
        <ErrorMessage message="Invalid product ID." />
      </div>
    );
  }

  if (loading && (!selectedProduct || selectedProduct.id !== id)) {
    return (
        <Loading />
    );
  }

  if (error && (!selectedProduct || selectedProduct.id !== id)) {
    return (
      <div className="products-page">
        <ErrorMessage message={error} />

        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => navigate("/products")}
        >
          <ArrowLeft size={18} />
          Back to Products
        </button>
      </div>
    );
  }

  if (!selectedProduct || selectedProduct.id !== id) {
    return (
      <div className="products-page">
        <Loading />
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-page__header">
        <div>
          <h1>Edit Product</h1>
          <p>Update product information, pricing, stock and image.</p>
        </div>
      </div>

      <div className="products-card">
        <EditProductForm key={selectedProduct.id} product={selectedProduct} />
      </div>
    </div>
  );
};

export default EditProduct;
