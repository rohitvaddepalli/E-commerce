import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const hasNavigated = useRef(false);

    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
        }
        if (location.state?.email) {
            setFormData((prev) => ({ ...prev, email: location.state.email }));
        }
    }, [location.state]);

    React.useEffect(() => {
        // Only navigate if authenticated, user data AND role are loaded, auth is not loading, and we haven't navigated yet
        if (isAuthenticated && user?.role && !authLoading && !hasNavigated.current) {
            hasNavigated.current = true;

            // If redirected from checkout with orderId, go to order details or success page?
            // For now, standard redirect logic
            const redirectPath = sessionStorage.getItem('redirectAfterLogin');
            if (redirectPath) {
                sessionStorage.removeItem('redirectAfterLogin');
                navigate(redirectPath, { replace: true });
            } else if (user.role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else if (user.role === 'seller') {
                navigate('/seller/dashboard', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
    }, [isAuthenticated, user, authLoading, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(formData.email, formData.password);

        setLoading(false);

        if (!result.success) {
            setError(result.message);
            toast.error(result.message);
        } else {
            toast.success('Logged in successfully!');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-left">
                    <div className="auth-branding">
                        <div className="brand-logo">M</div>
                        <h1>Welcome Back!</h1>
                        <p>Login to access your marketplace account</p>
                    </div>
                    <div className="auth-illustration">
                        <div className="floating-card card-1"></div>
                        <div className="floating-card card-2"></div>
                        <div className="floating-card card-3"></div>
                    </div>
                </div>

                <div className="auth-right">
                    <div className="auth-form-wrapper">
                        <h2>Login to Your Account</h2>
                        <p className="auth-subtitle">Enter your credentials to continue</p>

                        {successMessage && (
                            <div
                                className="auth-success"
                                style={{
                                    backgroundColor: '#ecfdf5',
                                    color: '#047857',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {successMessage}
                            </div>
                        )}

                        {error && (
                            <div className="auth-error">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM10 6v4m0 4h.01"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div className="input-with-icon">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path
                                            d="M3 4h14a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        />
                                        <path
                                            d="M1 6l9 6 9-6"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-input"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div className="input-with-icon">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path
                                            d="M5 8V6a5 5 0 0110 0v2M3 8h14a2 2 0 012 2v6a2 2 0 01-2 2H3a2 2 0 01-2-2v-6a2 2 0 012-2z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        />
                                    </svg>
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-input"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <Link to="/forgot-password" className="forgot-link">
                                    Forgot Password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={loading}
                                style={{ width: '100%' }}
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner"></div>
                                        Logging in...
                                    </>
                                ) : (
                                    'Login'
                                )}
                            </button>
                        </form>

                        <p className="auth-switch">
                            Don't have an account?{' '}
                            <Link to="/register" className="auth-link">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
