import { useEffect, useState } from "react";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import { PlusCircle } from "lucide-react";
<<<<<<< HEAD

import { useAppDispatch, useAppSelector } from "../../store/hooks";

import {
  fetchTransactions,
  setTransactionPage,
  addTransaction,
} from "../../store/slices/transactionSlice";

import type { InventoryTransactionType } from "../../services/inventoryTransactionService";

import { fetchProducts } from "../../store/slices/productSlice";

function Transactions() {
  const dispatch = useAppDispatch();

  // =========================
  // Redux State
  // =========================

  const products = useAppSelector((state) => state.product.products);

  const { transactions, page, totalPages, loading, error, mutationLoading } =
    useAppSelector((state) => state.transaction);

  const user = useAppSelector((state) => state.auth.user);

  // =========================
  // Local State
  // =========================

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [transactionType, setTransactionType] =
    useState<InventoryTransactionType>("STOCK_IN");

  const [transactionProductId, setTransactionProductId] = useState("");

  const [transactionQuantity, setTransactionQuantity] = useState("");

  const [transactionRemarks, setTransactionRemarks] = useState("");

  const [transactionError, setTransactionError] = useState("");

  // =========================
  // Permissions
  // =========================

  const canCreate = user?.role === "ADMIN" || user?.role === "MANAGER";

  // =========================
  // Selected Product
  // =========================

  const selectedProduct = products.find(
    (product) => product.id === transactionProductId,
  );

  const availableStock = selectedProduct?.quantity ?? 0;

  const isStockOut = transactionType === "STOCK_OUT";

  // =========================
  // Fetch Transactions
  // =========================

=======
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {fetchTransactions,setTransactionPage,addTransaction} from "../../store/slices/transactionSlice";
import type { InventoryTransactionType } from "../../services/inventoryTransactionService";
import { fetchProducts } from "../../store/slices/productSlice";

function Transactions() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [transactionType, setTransactionType] = useState<InventoryTransactionType>("STOCK_IN");
  const [transactionProductId, setTransactionProductId] = useState("");
  const [transactionQuantity, setTransactionQuantity] = useState("");
  const [transactionRemarks, setTransactionRemarks] = useState("");
  const [transactionError, setTransactionError] = useState("");

  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.product.products);
  const { transactions, page, totalPages, loading, error, mutationLoading } = useAppSelector((state) => state.transaction);
  const user = useAppSelector((state) => state.auth.user);

  const canCreate = user?.role === "ADMIN" || user?.role === "MANAGER";

>>>>>>> origin/main
  useEffect(() => {
    void dispatch(fetchTransactions());
  }, [dispatch, page]);

<<<<<<< HEAD
  // =========================
  // Open Modal
  // =========================

=======
>>>>>>> origin/main
  const handleOpenModal = () => {
    setTransactionType("STOCK_IN");
    setTransactionProductId("");
    setTransactionQuantity("");
    setTransactionRemarks("");
    setTransactionError("");
<<<<<<< HEAD

    setIsModalOpen(true);

    void dispatch(fetchProducts());
  };

  // =========================
  // Close Modal
  // =========================

=======
    setIsModalOpen(true);
    void dispatch(fetchProducts());
  };

>>>>>>> origin/main
  const handleCloseModal = () => {
    if (mutationLoading) {
      return;
    }
<<<<<<< HEAD

=======
>>>>>>> origin/main
    setIsModalOpen(false);
    setTransactionError("");
  };

<<<<<<< HEAD
  // =========================
  // Handle Transaction
  // =========================

  const handleTransaction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setTransactionError("");

    // Validate product
    if (!transactionProductId) {
=======
  const handleTransaction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTransactionError("");
if (!transactionProductId) {
>>>>>>> origin/main
      setTransactionError("Please select a product.");
      return;
    }

<<<<<<< HEAD
    // Validate quantity
    const requestedQuantity = Number(transactionQuantity);

    if (
      !transactionQuantity ||
      !Number.isSafeInteger(requestedQuantity) ||
      requestedQuantity <= 0
    ) {
      setTransactionError("Please enter a valid positive integer quantity.");
      return;
    }

    // Validate STOCK_OUT
    if (isStockOut) {
      if (!selectedProduct) {
        setTransactionError(
          "Selected product was not found. Please refresh and try again.",
        );
        return;
      }

      if (requestedQuantity > availableStock) {
        setTransactionError(
          `Insufficient stock. Available: ${availableStock}, Requested: ${requestedQuantity}.`,
        );
        return;
      }
    }

=======
    if (!transactionQuantity || Number(transactionQuantity) <= 0) {
      setTransactionError("Please enter a valid quantity.");
      return;
    }

>>>>>>> origin/main
    try {
      await dispatch(
        addTransaction({
          productId: transactionProductId,
          type: transactionType,
<<<<<<< HEAD
          quantity: requestedQuantity,
=======
          quantity: Number(transactionQuantity),
>>>>>>> origin/main
          remarks: transactionRemarks,
        }),
      ).unwrap();

      // Reset form
      setTransactionProductId("");
      setTransactionQuantity("");
      setTransactionRemarks("");
      setTransactionError("");

      // Close modal
      setIsModalOpen(false);

<<<<<<< HEAD
      // Refresh transaction history and product stock
      await Promise.all([
        dispatch(fetchTransactions()),
        dispatch(fetchProducts()),
      ]);
    } catch (error: unknown) {
      console.error("Failed to create transaction:", error);

      setTransactionError(
        typeof error === "string" ? error : "Failed to create transaction.",
      );
    }
  };

  // =========================
  // Format Date
  // =========================

=======
      // Refresh transaction history
      void dispatch(fetchTransactions());
    } catch (error) {
      console.error("Failed to create transaction:", error);

      setTransactionError("Failed to create transaction.");
    }
  };

>>>>>>> origin/main
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

<<<<<<< HEAD
  // =========================
  // Loading State
  // =========================

  if (loading && transactions.length === 0) {
=======
  if (loading) {
>>>>>>> origin/main
    return (
      <div className="transactions-page">
        <div className="transactions-card">
          <Loading />
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  // =========================
  // Error State
  // =========================

  if (error && transactions.length === 0) {
=======
  if (error) {
>>>>>>> origin/main
    return (
      <div className="transactions-page">
        <div className="transactions-card">
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  // =========================
  // Render
  // =========================

  return (
    <div className="transactions-page">
      {/* =========================
          Page Header
      ========================= */}

=======
  return (
    <div className="transactions-page">
      {/* Page Header */}
>>>>>>> origin/main
      <div className="transactions-page__header">
        <div>
          <h1>Transaction History</h1>

          <p>View all stock in and stock out transactions.</p>
        </div>

        {canCreate && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleOpenModal}
          >
            <PlusCircle />
            Create Transaction
          </button>
        )}
      </div>

<<<<<<< HEAD
      {/* =========================
          Transaction History
      ========================= */}

      <div className="transactions-card">
        {error && <ErrorMessage message={error} />}

=======
      {/* Transactions Card */}
      <div className="transactions-card">
        {/* Table */}
>>>>>>> origin/main
        <div className="transactions-table-wrapper">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Remarks</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="transactions-table__empty">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.product.name}</td>

                    <td>{transaction.product.sku}</td>

                    <td>
                      <span
                        className={`transaction-type ${
                          transaction.type === "STOCK_IN"
                            ? "transaction-type--in"
                            : "transaction-type--out"
                        }`}
                      >
                        {transaction.type === "STOCK_IN"
                          ? "Stock In"
                          : "Stock Out"}
                      </span>
                    </td>

                    <td>{transaction.quantity}</td>

                    <td>{transaction.remarks || "-"}</td>

                    <td>{formatDate(transaction.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
<<<<<<< HEAD

        <div className="transactions-pagination">
          <button
            type="button"
            disabled={page === 1 || loading}
=======
        <div className="transactions-pagination">
          <button
            type="button"
            disabled={page === 1}
>>>>>>> origin/main
            onClick={() => {
              dispatch(setTransactionPage(page - 1));
            }}
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
<<<<<<< HEAD
            disabled={page >= totalPages || loading}
=======
            disabled={page === totalPages}
>>>>>>> origin/main
            onClick={() => {
              dispatch(setTransactionPage(page + 1));
            }}
          >
            Next
          </button>
        </div>
      </div>

<<<<<<< HEAD
      {/* =========================
          Create Transaction Modal
      ========================= */}

=======
      {/* Create Transaction Modal */}
>>>>>>> origin/main
      {isModalOpen && canCreate && (
        <div
          className="transaction-modal"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="transaction-modal__content">
            {/* Modal Header */}
<<<<<<< HEAD

=======
>>>>>>> origin/main
            <div className="transaction-modal__header">
              <div>
                <h2>Create Transaction</h2>

                <p>Add or remove product stock.</p>
              </div>

              <button
                type="button"
                className="transaction-modal__close"
                onClick={handleCloseModal}
                disabled={mutationLoading}
              >
                ×
              </button>
            </div>

            {/* Form */}
<<<<<<< HEAD

            <form className="transaction-form" onSubmit={handleTransaction}>
              {/* Action */}

=======
            <form className="transaction-form" onSubmit={handleTransaction}>
              {/* Action */}
>>>>>>> origin/main
              <div className="transaction-form__group">
                <label htmlFor="transactionType">Action *</label>

                <select
                  id="transactionType"
                  value={transactionType}
<<<<<<< HEAD
                  disabled={mutationLoading}
                  onChange={(event) => {
                    setTransactionType(
                      event.target.value as InventoryTransactionType,
                    );

                    setTransactionQuantity("");
                    setTransactionError("");
                  }}
                >
                  <option value="STOCK_IN">Stock In</option>

=======
                  onChange={(event) =>
                    setTransactionType(
                      event.target.value as InventoryTransactionType,
                    )
                  }
                >
                  <option value="STOCK_IN">Stock In</option>
>>>>>>> origin/main
                  <option value="STOCK_OUT">Stock Out</option>
                </select>
              </div>

              {/* Product */}
<<<<<<< HEAD

=======
>>>>>>> origin/main
              <div className="transaction-form__group">
                <label htmlFor="transactionProduct">Product *</label>

                <select
                  id="transactionProduct"
                  value={transactionProductId}
<<<<<<< HEAD
                  disabled={mutationLoading}
                  onChange={(event) => {
                    setTransactionProductId(event.target.value);

                    setTransactionQuantity("");
                    setTransactionError("");
                  }}
=======
                  onChange={(event) =>
                    setTransactionProductId(event.target.value)
                  }
>>>>>>> origin/main
                >
                  <option value="">Select product</option>

                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>

<<<<<<< HEAD
              {/* Available Stock - STOCK_OUT Only */}

              {isStockOut && selectedProduct && (
                <div className="transaction-form__stock-info">
                  <span>Available Stock:</span>

                  <strong>{availableStock} units</strong>

                  {availableStock === 0 && (
                    <p className="transaction-form__stock-warning">
                      This product is out of stock.
                    </p>
                  )}
                </div>
              )}

              {/* Quantity */}

=======
              {/* Quantity */}
>>>>>>> origin/main
              <div className="transaction-form__group">
                <label htmlFor="transactionQuantity">Quantity *</label>

                <input
                  id="transactionQuantity"
                  type="number"
                  min="1"
<<<<<<< HEAD
                  step="1"
                  max={
                    isStockOut && selectedProduct ? availableStock : undefined
                  }
                  placeholder="Enter quantity"
                  value={transactionQuantity}
                  disabled={mutationLoading}
                  onChange={(event) => {
                    setTransactionQuantity(event.target.value);

                    setTransactionError("");
                  }}
=======
                  placeholder="Enter quantity"
                  value={transactionQuantity}
                  onChange={(event) =>
                    setTransactionQuantity(event.target.value)
                  }
>>>>>>> origin/main
                />
              </div>

              {/* Remarks */}
<<<<<<< HEAD

=======
>>>>>>> origin/main
              <div className="transaction-form__group">
                <label htmlFor="transactionRemarks">Remarks</label>

                <textarea
                  id="transactionRemarks"
                  placeholder="Enter remarks"
                  value={transactionRemarks}
<<<<<<< HEAD
                  disabled={mutationLoading}
                  onChange={(event) => {
                    setTransactionRemarks(event.target.value);
                  }}
=======
                  onChange={(event) =>
                    setTransactionRemarks(event.target.value)
                  }
>>>>>>> origin/main
                />
              </div>

              {/* Error */}
<<<<<<< HEAD

              {transactionError && <ErrorMessage message={transactionError} />}

              {/* Actions */}

=======
              {transactionError && <ErrorMessage message={transactionError} />}

              {/* Actions */}
>>>>>>> origin/main
              <div className="transaction-form__actions">
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={handleCloseModal}
                  disabled={mutationLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn--primary"
<<<<<<< HEAD
                  disabled={
                    mutationLoading ||
                    (isStockOut && selectedProduct?.quantity === 0)
                  }
=======
                  disabled={mutationLoading}
>>>>>>> origin/main
                >
                  {mutationLoading ? "Creating..." : "Create Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;
