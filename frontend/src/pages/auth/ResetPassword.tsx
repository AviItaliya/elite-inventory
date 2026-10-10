import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../services/authService";

const ResetPassword = () => {

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const result = await resetPassword(token, newPassword);
      setMessage(result);
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      console.error("Reset password failed:", error);
      setError("Invalid or expired reset token.");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <h1>Reset Password</h1> 
          <p> Enter your new password below. </p>
        </div>

        {message && (
          <div className="auth-message auth-message--success"> {message} </div>
        )}

        {error && (
          <div className="auth-message auth-message--error"> {error} </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          
          {/* New Password */}
          <div className="form-group">            
            <label htmlFor="newPassword"> New Password </label>
            <div className="password-input">              
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                disabled={loading}
              />

              <button
                type="button"
                className="password-input__toggle"
                onClick={() => setShowNewPassword((prev) => !prev)}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >                
                {showNewPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword"> Confirm Password </label>
            <div className="password-input">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                disabled={loading}
              />

              <button
                type="button"
                className="password-input__toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >                
                {showConfirmPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn--primary" disabled={loading}>            
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="auth-card__footer">          
          <Link to="/login"> Back to Login </Link>
        </div>
      </div>
    </div>
  );
};
export default ResetPassword;