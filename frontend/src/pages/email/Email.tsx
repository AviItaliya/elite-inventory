import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { sendDailyEmail, sendLowStockEmail, sendWeeklyEmail } from "../../store/slices/emailSlice";


const Email = () => {
    const dispatch = useAppDispatch();
    const {loading, message, error} = useAppSelector((state) => state.email);
    return (
        <div className="email-page">
            <div className="email-page__header">
                <div>
                    <h1>Email Reports</h1>
                    <p>Send inventory reports to the administrator.</p>
                </div>
            </div>

            {message && (
                <div className="email-message email-message--success">
                    {message}
                </div>
            )}

            {error && (
                <div className="email-message email-message--error">
                    {error}
                </div>
            )}

            <div className="email-cards">
                <div className="email-card">
                    <div className="email-card__content">
                        <h2>Daily Inventory Summary</h2>
                        <p>
                            Send the current inventory summary including
                            products, categories, suppliers and low-stock
                            products.
                        </p>
                    </div>

                    <button
                        type="button" className="btn btn--primary"
                        onClick={() => {void dispatch(sendDailyEmail());}}
                        disabled={loading !== ""}
                    >
                        {loading === "daily"
                            ? "Sending..."
                            : "Send Report"}
                    </button>
                </div>

                <div className="email-card">
                    <div className="email-card__content">
                        <h2>Low Stock Alert</h2>
                        <p>
                            Send an alert containing products that need to be
                            restocked.
                        </p>
                    </div>

                    <button
                        type="button" className="btn btn--primary"
                        onClick={() => {void dispatch(sendLowStockEmail());}}
                        disabled={loading !== ""}
                    >
                        {loading === "low-stock"
                            ? "Sending..."
                            : "Send Alert"}
                    </button>
                </div>

                <div className="email-card">
                    <div className="email-card__content">
                        <h2>Weekly Inventory Report</h2>
                        <p>
                            Send the weekly inventory report as an Excel
                            attachment.
                        </p>
                    </div>

                    <button
                        type="button" className="btn btn--primary"
                        onClick={() =>{void dispatch(sendWeeklyEmail());}}
                        disabled={loading !== ""}
                    >
                        {loading === "weekly"
                            ? "Sending..."
                            : "Send Report"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Email;