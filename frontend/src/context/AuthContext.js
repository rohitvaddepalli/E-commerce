import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { authAPI, setAuthTokenGetter } from '../services/api';
import logger from '../utils/logger';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getToken = useCallback(() => {
        return localStorage.getItem('token');
    }, []);

    // Route every backend request through the JWT token stored in localStorage
    useEffect(() => {
        setAuthTokenGetter(() => getToken());
    }, [getToken]);

    // Fetch user profile if a token exists
    const refreshAuth = useCallback(async () => {
        const token = getToken();
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const response = await authAPI.getMe();
            if (response.data.success && response.data.user) {
                setUser(response.data.user);
            } else {
                setUser(null);
                localStorage.removeItem('token');
            }
        } catch (error) {
            logger.error('Auth check failed:', error);
            if (error.response?.status === 401) {
                setUser(null);
                localStorage.removeItem('token');
            }
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    // Initial check on mount
    useEffect(() => {
        refreshAuth();
    }, [refreshAuth]);

    // Login with email and password
    const login = useCallback(
        async (email, password) => {
            try {
                const response = await authAPI.login({ email, password });
                if (response.data.success && response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    setUser(response.data.user);
                    return { success: true };
                }
                return {
                    success: false,
                    message: response.data.message || 'Login failed',
                };
            } catch (error) {
                logger.error('Login error:', error);
                const message = error.response?.data?.message || error.message || 'Login failed';
                return { success: false, message };
            }
        },
        []
    );

    // Register with name, email, password, role, phone
    const register = useCallback(
        async (data) => {
            try {
                const response = await authAPI.register(data);
                if (response.data.success && response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    setUser(response.data.user);
                    return {
                        success: true,
                        role: response.data.user?.role || 'customer'
                    };
                }
                return {
                    success: false,
                    message: response.data.message || 'Registration failed',
                };
            } catch (error) {
                logger.error('Registration error:', error);
                const message =
                    error.response?.data?.message || error.message || 'Registration failed';
                return { success: false, message };
            }
        },
        []
    );

    // Simple Google auth fallback
    const loginWithGoogle = useCallback(async () => {
        logger.info('Google sign-in clicked');
    }, []);

    // Logout
    const logout = useCallback(async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            logger.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    }, []);

    // Update user profile locally
    const updateUser = useCallback((updatedUser) => {
        setUser(updatedUser);
    }, []);

    const value = useMemo(
        () => ({
            user,
            loading,
            login,
            register,
            loginWithGoogle,
            logout,
            updateUser,
            refreshAuth,
            getToken,
            isAuthenticated: !!user,
            isSeller: user?.role === 'seller',
            isCustomer: user?.role === 'customer' || !user?.role,
            isAdmin: user?.role === 'admin',
        }),
        [user, loading, login, register, loginWithGoogle, logout, updateUser, refreshAuth, getToken]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
