interface ErrorMessageProps {
    message?: string;
}

const ErrorMessage = ({
    message = "Something went wrong. Please try again.",
}: ErrorMessageProps) => {
    return (
        <div className="error-message">
            {message}
        </div>
    );
};

export default ErrorMessage;