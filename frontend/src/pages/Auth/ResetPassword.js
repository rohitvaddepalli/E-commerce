import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import './ResetPassword.css';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        code: token || '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    useDocumentTitle('Reset Password');

    const { code, password, confirmPassword } = formData;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            setSuccess(true);
            setTimeout(() => {
                navigate('/login', { replace: true });
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-page">
            <div className="reset-password-container">
                <div className="reset-password-card">
                    {!success ? (
                        <>
                            <div className="reset-password-header">
                                <h1>Set New Password</h1>
                                <p>Enter your new password below.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="reset-password-form">
                                {error && <div className="error-message">{error}</div>}

                                <div className="form-group">
                                    <label htmlFor="code">Reset Code</label>
                                    <input
                                        type="text"
                                        id="code"
                                        name="code"
                                        value={code}
                                        onChange={handleChange}
                                        placeholder="Enter the code you received"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password">New Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={password}
                                        onChange={handleChange}
                                        placeholder="At least 6 characters"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Re-enter new password"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg btn-block"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating Password...' : 'Reset Password'}
                                </button>
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
                            <h2>Password Reset Successfully!</h2>
                            <p>Redirecting to login...</p>
                            <Link to="/login" className="btn btn-primary btn-block">
                                Go to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
