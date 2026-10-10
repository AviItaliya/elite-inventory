import { AlertTriangle, Eye, EyeOff, LockKeyhole, Mail, Package } from "lucide-react";
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { login } from "../../store/slices/authSlice";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const authLoading = useAppSelector((state) => state.auth.loginLoading);
    const isFormValid = email.trim() !== "" && password.trim() !== "";

    const handleSubmit = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        try {
    await dispatch(
        login({
            email,
            password,
        })
    ).unwrap();

    navigate("/dashboard");
} catch (error) {
    console.log("LOGIN ERROR:", error);
    setError("Invalid Email or Password");
}
    };

    return (
        <main className="login-page">
            <div className="login-container">
                <section className="login-info">
                    <div className="login-info__brand">
                        <div className="login-info__logo">
                            <a href="#"><img src="logo2.png" alt="logo" width="250px" /></a>
                        </div>
                    </div>

                    <div className="login-info__content">
                        <h1>Welcome Back</h1>
                        <p>Sign in to your account to continue managing your inventory.</p>
                        <div className="login-feature">
                            <div className="login-feature__icon">
                                <Package size={16} />
                            </div>

                            <div>
                                <strong>Track Stock</strong>
                                <span>Real-time inventory tracking</span>
                            </div>
                        </div>

                        <div className="login-feature">
                            <div className="login-feature__icon">
                                <Package size={16} />
                            </div>
                            <div>
                                <strong>Manage Products</strong>
                                <span>Organize your products easily</span>
                            </div>
                        </div>

                        <div className="login-feature">
                            <div className="login-feature__icon">
                                <Package size={16} />
                            </div>
                            <div>
                                <strong>Manage Inventory</strong>
                                <span>Keep your stock organized</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="login-form-section">
                    <div className="login-form-container">
                        <h2>Sign In</h2>
                        <p className="login-form-description">Enter your email and password to access your account</p>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <div className="login-input">
                                    <Mail size={16} />
                                    <input type="email" id="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="login-input">
                                    <LockKeyhole size={16} />
                                    <input type={showPassword ? "text" : "password"} id="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required />
                                    <button type="button" className="login-password-toggle" onClick={() => setShowPassword((prev) => !prev)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? (<EyeOff size={16} />) : <Eye size={16} />}</button>
                                </div>
                                <div className="login-form__forgot">
                                    <Link to="/forgot-password">
                                        Forgot Password?
                                    </Link>
                                </div>
                                {error && (
                                <div className="login-error">
                                    <AlertTriangle size={16} color="red" />{error}
                                </div>
                            )}
                            </div>
                            <button type="submit" className="btn btn--primary" disabled={!isFormValid || authLoading}>{authLoading ? "Signing In..." : "Sign In"}</button>
                        </form>
                    </div>
                </section>
            </div>
        </main>
    )
}

export default Login