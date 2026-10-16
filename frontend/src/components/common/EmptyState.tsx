import "../../styles/_states.scss";
interface EmptyStateProps {
  title?: string;
  message?: string;
}
const EmptyState = ({
  title = "No records found",
  message = "There is no data to display.",
}: EmptyStateProps) => (
  <div className="empty-state">
    <h3>{title}</h3>
    <p>{message}</p>
  </div>
);
export default EmptyState;
