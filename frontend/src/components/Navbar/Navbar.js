import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useSocket } from '../../context/SocketContext';
import './Navbar.css';

const Navbar = () => {
    const { isAuthenticated, user, isSeller, isAdmin, logout } = useAuth();
    const { getCartCount } = useCart();
    const { unreadCount, markAllRead } = useSocket();
    const location = useLocation();
    const navigate = useNavigate();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Hide Navbar on seller and admin dashboard routes
    if (location.pathname.startsWith('/seller') || location.pathname.startsWith('/admin')) {
        return null;
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            navigate('/products');
        }
    };

    const handleLogout = async () => {
        setUserMenuOpen(false);
        await logout();
        navigate('/');
    };

    const cartCount = getCartCount();

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content">
                    {/* Logo */}
                    <Link to="/" className="navbar-logo" aria-label="Marketplace Home">
                        <div className="logo-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                        </div>
                        <span className="logo-text">Marketplace</span>
                    </Link>

                    {/* Search Bar */}
                    <form className="navbar-search" onSubmit={handleSearchSubmit}>
                        <div className="search-input-wrapper">
                            <svg className="search-icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input
                                type="text"
                                placeholder="Search products, brands, categories..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                aria-label="Search products"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    className="search-clear-btn"
                                    onClick={() => setSearchTerm('')}
                                    aria-label="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Navigation Links & Actions */}
                    <div className="navbar-links">
                        {!isSeller && (
                            <>
                                <Link to="/products" className="nav-link">
                                    Explore Products
                                </Link>
                                <Link to="/stores" className="nav-link">
                                    Stores
                                </Link>
                            </>
                        )}

                        {isAuthenticated ? (
                            <>
                                {!isSeller && !isAdmin && (
                                    <>
                                        <Link
                                            to="/customer/orders"
                                            className="nav-icon-btn"
                                            onClick={markAllRead}
                                            aria-label="Notifications"
                                            title="Notifications"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                            </svg>
                                            {unreadCount > 0 && (
                                                <span className="notification-badge">{unreadCount}</span>
                                            )}
                                        </Link>

                                        <Link to="/cart" className="nav-icon-btn cart-btn" aria-label="Shopping Cart">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="9" cy="21" r="1"></circle>
                                                <circle cx="20" cy="21" r="1"></circle>
                                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                            </svg>
                                            {cartCount > 0 && (
                                                <span className="cart-badge">{cartCount}</span>
                                            )}
                                        </Link>
                                    </>
                                )}

                                {/* User Profile Pill & Dropdown */}
                                <div className="user-menu-wrapper" ref={dropdownRef}>
                                    <button
                                        className="user-menu-btn"
                                        onClick={() => setUserMenuOpen((prev) => !prev)}
                                        aria-expanded={userMenuOpen}
                                        aria-haspopup="true"
                                    >
                                        <img
                                            src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                            alt={user?.name || 'Account'}
                                            className="user-avatar"
                                        />
                                        <span className="user-name">{user?.name?.split(' ')[0] || 'Account'}</span>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </button>

                                    {userMenuOpen && (
                                        <div className="user-dropdown">
                                            <div className="user-dropdown-header">
                                                <p className="user-fullname">{user?.name}</p>
                                                <p className="user-email">{user?.email}</p>
                                                <span className={`role-badge role-${user?.role || 'customer'}`}>
                                                    {user?.role ? user.role.toUpperCase() : 'CUSTOMER'}
                                                </span>
                                            </div>

                                            <div className="dropdown-divider"></div>

                                            {user?.role === 'admin' ? (
                                                <Link
                                                    to="/admin/dashboard"
                                                    className="dropdown-item"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                                                    Admin Dashboard
                                                </Link>
                                            ) : user?.role === 'seller' ? (
                                                <>
                                                    <Link
                                                        to="/seller/dashboard"
                                                        className="dropdown-item"
                                                        onClick={() => setUserMenuOpen(false)}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                                                        Seller Dashboard
                                                    </Link>
                                                    <Link
                                                        to="/seller/products"
                                                        className="dropdown-item"
                                                        onClick={() => setUserMenuOpen(false)}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                                                        Manage Products
                                                    </Link>
                                                </>
                                            ) : (
                                                <>
                                                    <Link
                                                        to="/customer/dashboard"
                                                        className="dropdown-item"
                                                        onClick={() => setUserMenuOpen(false)}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                                        My Account
                                                    </Link>
                                                    <Link
                                                        to="/customer/orders"
                                                        className="dropdown-item"
                                                        onClick={() => setUserMenuOpen(false)}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line></svg>
                                                        My Orders
                                                    </Link>
                                                    <Link
                                                        to="/customer/wishlist"
                                                        className="dropdown-item"
                                                        onClick={() => setUserMenuOpen(false)}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                                        Wishlist
                                                    </Link>
                                                </>
                                            )}

                                            <div className="dropdown-divider"></div>

                                            <button className="dropdown-item logout-btn" onClick={handleLogout}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="auth-nav-buttons">
                                <Link to="/login" className="btn btn-ghost btn-sm">
                                    Login
                                </Link>
                                <Link to="/register" className="btn btn-primary btn-sm">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
