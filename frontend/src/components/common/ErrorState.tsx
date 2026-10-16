import "../../styles/_states.scss";
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}
const ErrorState = ({
  message = "Something went wrong.",
  onRetry,
}: ErrorStateProps) => (
  <div className="error-state" role="alert">
    <h3>Unable to load data</h3>
    <p>{message}</p>
    {onRetry && (
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Try Again
      </button>
    )}
  </div>
);
export default ErrorState;
