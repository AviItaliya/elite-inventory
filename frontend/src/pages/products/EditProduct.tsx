import { useEffect } from "react";
import { useParams } from "react-router-dom";

import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";

import { useAppDispatch, useAppSelector } from "../../store/hooks";

import { fetchCategories } from "../../store/slices/categorySlice";
import { fetchSuppliers } from "../../store/slices/supplierSlice";
import { fetchProductById } from "../../store/slices/productSlice";
import EditProductForm from "./EditProductForm";

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();

  const dispatch = useAppDispatch();

  const { selectedProduct, loading, error } = useAppSelector(
    (state) => state.product
  );

  useEffect(() => {
    if (!id) return;

    void dispatch(fetchProductById(id));
    void dispatch(fetchCategories());
    void dispatch(fetchSuppliers());
  }, [dispatch, id]);

  if (!id) {
    return (
      <div className="products-page">
        <ErrorMessage message="Product ID not found." />
      </div>
    );
  }

  if (!selectedProduct || selectedProduct.id !== id) {
    return (
      <div className="products-page">
        {error ? (
          <ErrorMessage message={error} />
        ) : loading ? (
          <Loading />
        ) : (
          <ErrorMessage message="Product not found." />
        )}
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-page__header">
        <div>
          <h1>Edit Product</h1>
          <p>Update product information.</p>
        </div>
      </div>

      <div className="products-card">
        <EditProductForm
          key={selectedProduct.id}
          product={selectedProduct}
        />
      </div>
    </div>
  );
};

export default EditProduct;
