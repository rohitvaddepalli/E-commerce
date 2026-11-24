import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    useDocumentTitle('Forgot Password');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Emulate request
            await new Promise((resolve) => setTimeout(resolve, 500));
            setSubmitted(true);
        } catch (err) {
            setError(err.message || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-page">
            <div className="forgot-password-container">
                <div className="forgot-password-card">
                    {!submitted ? (
                        <>
                            <div className="forgot-password-header">
                                <h1>Forgot Password?</h1>
                                <p>
                                    Enter your email address and we'll send you instructions to reset your
                                    password.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="forgot-password-form">
                                {error && <div className="error-message">{error}</div>}

                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your.email@example.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg btn-block"
                                    disabled={loading}
                                >
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </button>

                                <div className="forgot-password-footer">
                                    <Link to="/login" className="back-to-login">
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M15 10H5M5 10l4 4M5 10l4-4" />
                                        </svg>
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="success-container">
                            <div className="success-icon">
                                <svg
                                    width="48"
                                    height="48"
                                    viewBox="0 0 48 48"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                >
                                    <circle cx="24" cy="24" r="20" />
                                    <path d="M14 24l8 8 16-16" />
                                </svg>
                            </div>
                            <h2>Check Your Email</h2>
                            <p>
                                We've sent password reset instructions to{' '}
                                <strong>{email}</strong>.
                            </p>
                            <Link to="/login" className="btn btn-primary btn-block">
                                Back to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
