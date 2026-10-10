import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { addSupplier } from "../../store/slices/supplierSlice";

const CreateSupplier = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const mutationLoading = useAppSelector((state) => state.supplier.mutationLoading);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");

        if (
            !name.trim() ||
            !email.trim() ||
            !phone.trim()
        ) {
            setError("Please fill all fields.");
            return;
        }

        try {
            await dispatch(
                addSupplier({
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                })
            ).unwrap();
            navigate("/suppliers");
        } catch (error) {
            console.error("Failed to create supplier:", error);
            setError("Failed to create supplier.");
        }
    };

    return (
        <div className="products-page">
            <div className="products-page__header">
                <div>
                    <h1>Create Supplier</h1>
                    <p>Add a new product supplier.</p>
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
                            placeholder="Enter supplier name"
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
                            placeholder="Enter supplier email"
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
                            placeholder="Enter supplier phone"
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
                                ? "Creating..."
                                : "Create Supplier"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSupplier;