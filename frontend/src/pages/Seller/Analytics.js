import React, { useState, useEffect, useCallback } from 'react';
import { analyticsAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Analytics.css';
import logger from '../../utils/logger';

const Analytics = () => {
    const [salesData, setSalesData] = useState(null);
    const [customerData, setCustomerData] = useState(null);
    const [productData, setProductData] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30');
    const [activeTab, setActiveTab] = useState('sales');

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const [sales, customers, products, forecast] = await Promise.all([
                analyticsAPI.getSalesAnalytics({ period }).catch(() => ({ data: { analytics: null } })),
                analyticsAPI.getCustomerAnalytics().catch(() => ({ data: { analytics: null } })),
                analyticsAPI.getProductAnalytics().catch(() => ({ data: { analytics: null } })),
                analyticsAPI.getInventoryForecast({ days: period }).catch(() => ({ data: { forecast: [] } })),
            ]);

            setSalesData(sales?.data?.analytics || null);
            setCustomerData(customers?.data?.analytics || null);
            setProductData(products?.data?.analytics || null);
            setForecastData(forecast?.data?.forecast || []);
        } catch (error) {
            logger.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const renderSalesChart = () => {
        const list = salesData?.salesData || [];
        if (!list.length) {
            return (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No sales recorded for this period yet.
                </div>
            );
        }

        const maxRevenue = Math.max(...list.map((d) => d.revenue || 0), 1);

        return (
            <div className="chart-container">
                <div className="chart-bars">
                    {list.map((data, index) => (
                        <div key={index} className="chart-bar-wrapper">
                            <div
                                className="chart-bar"
                                style={{
                                    height: `${Math.max(((data.revenue || 0) / maxRevenue) * 200, 6)}px`,
                                    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                                }}
                                title={`₹${Number(data.revenue || 0).toFixed(2)}`}
                            >
                                <span className="chart-value">₹{Number(data.revenue || 0).toFixed(0)}</span>
                            </div>
                            <div className="chart-label">
                                {data.date
                                    ? new Date(data.date).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                      })
                                    : ''}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
                <Sidebar />
                <div style={{ flex: 1, marginLeft: '260px', padding: 'var(--spacing-xl)' }}>
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            <Sidebar />
            <div style={{ flex: 1, marginLeft: '260px', padding: 'var(--spacing-xl)' }}>
                <div className="container" style={{ padding: 0 }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 'var(--spacing-xl)',
                        }}
                    >
                        <div>
                            <h1 className="page-title">Analytics Dashboard</h1>
                            <p>Track your sales, customers, and inventory</p>
                        </div>
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="form-select"
                            style={{ width: 'auto' }}
                        >
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                        </select>
                    </div>

                    {/* Tabs */}
                    <div className="analytics-tabs">
                        <button
                            className={`tab-button ${activeTab === 'sales' ? 'active' : ''}`}
                            onClick={() => setActiveTab('sales')}
                        >
                            📊 Sales
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'customers' ? 'active' : ''}`}
                            onClick={() => setActiveTab('customers')}
                        >
                            👥 Customers
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
                            onClick={() => setActiveTab('products')}
                        >
                            📦 Products
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'forecast' ? 'active' : ''}`}
                            onClick={() => setActiveTab('forecast')}
                        >
                            🔮 Forecast
                        </button>
                    </div>

                    {/* Sales Analytics */}
                    {activeTab === 'sales' && (
                        <>
                            <div className="analytics-stats">
                                <div className="stat-card">
                                    <div
                                        className="stat-icon"
                                        style={{
                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                        }}
                                    >
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3>₹{Number(salesData?.totalRevenue ?? 0).toFixed(2)}</h3>
                                        <p>Total Revenue</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div
                                        className="stat-icon"
                                        style={{
                                            background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
                                        }}
                                    >
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"
                                                stroke="white"
                                                strokeWidth="2"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3>{salesData?.totalOrders ?? 0}</h3>
                                        <p>Total Orders</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div
                                        className="stat-icon"
                                        style={{
                                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        }}
                                    >
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3>₹{Number(salesData?.averageOrderValue ?? 0).toFixed(2)}</h3>
                                        <p>Avg Order Value</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <h2>Sales Trend</h2>
                                {renderSalesChart()}
                            </div>
                        </>
                    )}

                    {/* Customer Analytics */}
                    {activeTab === 'customers' && (
                        <>
                            <div className="analytics-stats">
                                <div className="stat-card">
                                    <div
                                        className="stat-icon"
                                        style={{
                                            background: 'linear-gradient(135deg, #ec4899, #db2777)',
                                        }}
                                    >
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3>{customerData?.totalCustomers ?? 0}</h3>
                                        <p>Total Customers</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div
                                        className="stat-icon"
                                        style={{
                                            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                                        }}
                                    >
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 8v6M23 11h-6"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3>{Number(customerData?.repeatCustomerRate ?? 0).toFixed(1)}%</h3>
                                        <p>Repeat Customer Rate</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <h2>Top Customers</h2>
                                {(!customerData?.topCustomers || customerData.topCustomers.length === 0) ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                        No customer order data available yet.
                                    </div>
                                ) : (
                                    <div className="customer-table">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Customer</th>
                                                    <th>Orders</th>
                                                    <th>Total Spent</th>
                                                    <th>Last Order</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {customerData.topCustomers.map((customer, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <div>
                                                                <div style={{ fontWeight: '600' }}>
                                                                    {customer.name}
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        fontSize: '0.85rem',
                                                                        color: 'var(--text-secondary)',
                                                                    }}
                                                                >
                                                                    {customer.email}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{customer.totalOrders}</td>
                                                        <td
                                                            style={{
                                                                fontWeight: '600',
                                                                color: 'var(--primary-color)',
                                                            }}
                                                        >
                                                            ₹{Number(customer.totalSpent || 0).toFixed(2)}
                                                        </td>
                                                        <td>
                                                            {customer.lastOrderDate
                                                                ? new Date(customer.lastOrderDate).toLocaleDateString()
                                                                : 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Product Analytics */}
                    {activeTab === 'products' && (
                        <>
                            <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                                <h2>Top Performing Products</h2>
                                {(!productData?.topProducts || productData.topProducts.length === 0) ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                        No product sales recorded yet.
                                    </div>
                                ) : (
                                    <div className="product-performance">
                                        {productData.topProducts.map((product, index) => (
                                            <div key={index} className="performance-item">
                                                <div className="performance-rank">#{index + 1}</div>
                                                <div className="performance-details">
                                                    <h4>{product.name}</h4>
                                                    <p>{product.category}</p>
                                                </div>
                                                <div className="performance-stats">
                                                    <div className="stat">
                                                        <span className="stat-label">Sold</span>
                                                        <span className="stat-value">
                                                            {product.totalSold}
                                                        </span>
                                                    </div>
                                                    <div className="stat">
                                                        <span className="stat-label">Revenue</span>
                                                        <span className="stat-value">
                                                            ₹{Number(product.revenue || 0).toFixed(0)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="card">
                                <h2>Category Performance</h2>
                                {Object.keys(productData?.categoryPerformance || {}).length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                        No category sales data recorded yet.
                                    </div>
                                ) : (
                                    <div className="category-grid">
                                        {Object.entries(productData?.categoryPerformance || {}).map(
                                            ([category, data]) => (
                                                <div key={category} className="category-card">
                                                    <h3>{category}</h3>
                                                    <div className="category-stats">
                                                        <div>
                                                            <span className="label">Revenue</span>
                                                            <span className="value">
                                                                ₹{Number(data?.revenue || 0).toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="label">Units Sold</span>
                                                            <span className="value">
                                                                {data?.unitsSold || 0}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Inventory Forecast */}
                    {activeTab === 'forecast' && (
                        <div className="card">
                            <h2>Inventory Forecast</h2>
                            <p
                                style={{
                                    color: 'var(--text-secondary)',
                                    marginBottom: 'var(--spacing-lg)',
                                }}
                            >
                                Based on sales velocity over the last {period} days
                            </p>
                            {(!forecastData || forecastData.length === 0) ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                    No products found in inventory.
                                </div>
                            ) : (
                                <div className="forecast-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Current Stock</th>
                                                <th>Avg Daily Sales</th>
                                                <th>Days Until Stockout</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {forecastData.map((product, index) => (
                                                <tr key={index}>
                                                    <td style={{ fontWeight: '600' }}>
                                                        {product.name}
                                                    </td>
                                                    <td>{product.currentStock}</td>
                                                    <td>{Number(product.averageDailySales || 0).toFixed(2)}</td>
                                                    <td>
                                                        <span
                                                            className={
                                                                (product.daysUntilStockout || 999) < 7
                                                                    ? 'urgent'
                                                                    : 'warning'
                                                            }
                                                        >
                                                            {(product.daysUntilStockout || 999) < 900
                                                                ? `${product.daysUntilStockout} days`
                                                                : 'Well-stocked'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {product.reorderRecommended ? (
                                                            <span className="badge badge-warning">
                                                                Reorder Recommended
                                                            </span>
                                                        ) : (
                                                            <span className="badge badge-success">
                                                                Optimal Stock
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
