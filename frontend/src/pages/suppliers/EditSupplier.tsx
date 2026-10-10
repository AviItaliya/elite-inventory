import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearSelectedSupplier, editSupplier, fetchSupplierById } from "../../store/slices/supplierSlice";

const EditSupplier = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const {loading, mutationLoading, error} = useAppSelector((state) => state.supplier);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    useEffect(() => {
        if (!id) {
            return;
        }
        const loadSupplier = async () => {
            try {
                const result = await dispatch(fetchSupplierById(id)).unwrap();
                setName(result.name);
                setEmail(result.email);
                setPhone(result.phone);
            } catch (error) {
                console.error("Failed to load supplier:", error);
            }
        };
        void loadSupplier();
        return () => {
            dispatch(clearSelectedSupplier());
        };            
    }, [dispatch, id]);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!id) {
            return;
        }
        if (
            !name.trim() ||
            !email.trim() ||
            !phone.trim()
        ) {
            return;
        }

        try {
            await dispatch(editSupplier({id, supplier: {
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
            }
        })).unwrap();
        navigate("/suppliers");
        } catch (error) {
            console.error("Failed to update supplier:",error);
        }
    };

    if (loading) {
        return (
            <div className="products-page">
                <Loading />
            </div>
        );
    }

    if (error && !name) {
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
                    <h1>Edit Supplier</h1>
                    <p>Update supplier information.</p>
                </div>
            </div>

            <div className="products-card">
                <form
                    className="product-form"
                    onSubmit={handleSubmit}
                >
                    <div className="product-form__group">
                        <label htmlFor="supplier-name">
                            Supplier Name
                        </label>

                        <input
                            type="text"
                            id="supplier-name"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                        />
                    </div>

                    <div className="product-form__group">
                        <label htmlFor="supplier-email">
                            Email
                        </label>

                        <input
                            type="email"
                            id="supplier-email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                        />
                    </div>

                    <div className="product-form__group">
                        <label htmlFor="supplier-phone">
                            Phone
                        </label>

                        <input
                            type="text"
                            id="supplier-phone"
                            value={phone}
                            onChange={(event) =>
                                setPhone(event.target.value)
                            }
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
                            onClick={() => navigate("/suppliers")}
                        >
                            Cancel
                        </button>

                        <button type="submit" className="btn btn--primary" disabled={mutationLoading}>
                            {mutationLoading
                                ? "Updating..."
                                : "Update Supplier"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditSupplier;