import React, { useState, useEffect, useCallback } from 'react';
import { analyticsAPI } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import './Analytics.css';
import logger from '../../utils/logger';

const Analytics = () => {
    const [period, setPeriod] = useState('30');
    const [salesData, setSalesData] = useState(null);
    const [customerData, setCustomerData] = useState(null);
    const [productData, setProductData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('sales');

    const fetchAllAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const [salesRes, customerRes, productRes] = await Promise.all([
                analyticsAPI.getAdminSalesAnalytics({ period }),
                analyticsAPI.getAdminCustomerAnalytics(),
                analyticsAPI.getAdminProductAnalytics(),
            ]);

            setSalesData(salesRes?.data?.analytics || null);
            setCustomerData(customerRes?.data?.analytics || null);
            setProductData(productRes?.data?.analytics || null);
        } catch (error) {
            logger.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchAllAnalytics();
    }, [period, fetchAllAnalytics]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(Number(amount) || 0);
    };

    if (loading) {
        return (
            <div className="admin-layout">
                <AdminSidebar />
                <div className="admin-content">
                    <div className="loading-spinner" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                        <div className="spinner"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-content">
                <div className="analytics-header">
                    <div>
                        <h1>Analytics Overview</h1>
                        <p>Monitor platform performance and metrics</p>
                    </div>
                    <div className="period-selector">
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="form-select"
                        >
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 3 Months</option>
                            <option value="365">Last Year</option>
                        </select>
                    </div>
                </div>

                <div className="analytics-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
                        onClick={() => setActiveTab('sales')}
                    >
                        Sales & Revenue
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('customers')}
                    >
                        Customers
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        Products
                    </button>
                </div>

                <div className="analytics-body">
                    {activeTab === 'sales' && (
                        <div className="analytics-section fade-in">
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <h3>Total Revenue</h3>
                                    <div className="stat-value">
                                        {formatCurrency(salesData?.totalRevenue)}
                                    </div>
                                    <div className="stat-label">In selected period</div>
                                    <div className="stat-trend positive" style={{ color: '#10b981', fontSize: '0.825rem', marginTop: '6px' }}>
                                        <span className="trend-icon">↑</span> Tax & Shipping Inc.
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <h3>Total Orders</h3>
                                    <div className="stat-value">{salesData?.totalOrders || 0}</div>
                                    <div className="stat-label">In selected period</div>
                                </div>
                                <div className="stat-card">
                                    <h3>Avg. Order Value</h3>
                                    <div className="stat-value">
                                        {formatCurrency(salesData?.averageOrderValue)}
                                    </div>
                                    <div className="stat-label">Per successful order</div>
                                </div>
                            </div>

                            <div className="chart-container card">
                                <h3>Revenue Trend</h3>
                                <div className="line-chart-container">
                                    {salesData?.salesData && salesData.salesData.length > 0 ? (
                                        (() => {
                                            const data = salesData.salesData;
                                            const height = 300;
                                            const width = 800; // viewBox width
                                            const padding = 20;

                                            const maxRevenue =
                                                Math.max(...data.map((d) => Number(d.revenue) || 0)) || 100;

                                            // Calculate points
                                            const points = data.map((d, i) => {
                                                const x =
                                                    (i / (data.length - 1 || 1)) *
                                                        (width - 2 * padding) +
                                                    padding;
                                                const y =
                                                    height -
                                                    padding -
                                                    ((Number(d.revenue) || 0) / maxRevenue) *
                                                        (height - 2 * padding);
                                                return { x, y, ...d };
                                            });

                                            // Create path command
                                            const pathD = `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`;
                                            const areaD = `${pathD} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

                                            return (
                                                <svg
                                                    viewBox={`0 0 ${width} ${height}`}
                                                    className="chart-svg"
                                                    preserveAspectRatio="none"
                                                >
                                                    <defs>
                                                        <linearGradient
                                                            id="gradientArea"
                                                            x1="0"
                                                            x2="0"
                                                            y1="0"
                                                            y2="1"
                                                        >
                                                            <stop
                                                                offset="0%"
                                                                stopColor="#4f46e5"
                                                            />
                                                            <stop
                                                                offset="100%"
                                                                stopColor="#4f46e5"
                                                                stopOpacity="0"
                                                            />
                                                        </linearGradient>
                                                    </defs>

                                                    {/* Area under line */}
                                                    <path d={areaD} className="chart-area" />

                                                    {/* Line */}
                                                    <path d={pathD} className="chart-path" />

                                                    {/* Data points */}
                                                    {points.map((p, i) => (
                                                        <g key={i} className="chart-point-group">
                                                            <circle
                                                                cx={p.x}
                                                                cy={p.y}
                                                                className="chart-dot"
                                                            >
                                                                <title>{`${p.date ? new Date(p.date).toLocaleDateString() : 'N/A'}: ${formatCurrency(p.revenue)}`}</title>
                                                            </circle>
                                                        </g>
                                                    ))}
                                                </svg>
                                            );
                                        })()
                                    ) : (
                                        <div
                                            style={{
                                                height: '300px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#64748b',
                                            }}
                                        >
                                            No sales data available for selected period
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'customers' && (
                        <div className="analytics-section fade-in">
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <h3>Total Customers</h3>
                                    <div className="stat-value">{customerData?.totalCustomers || 0}</div>
                                </div>
                                <div className="stat-card">
                                    <h3>Repeat Rate</h3>
                                    <div className="stat-value">
                                        {(Number(customerData?.repeatCustomerRate) || 0).toFixed(1)}%
                                    </div>
                                    <div className="stat-label">Customers with {'>'}1 order</div>
                                </div>
                            </div>

                            <div className="card full-width">
                                <h3>Top Customers by Spend</h3>
                                <div className="table-responsive">
                                    <table className="analytics-table">
                                        <thead>
                                            <tr>
                                                <th>Customer</th>
                                                <th>Email</th>
                                                <th>Orders</th>
                                                <th>Total Spent</th>
                                                <th>Last Active</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {customerData?.topCustomers && customerData.topCustomers.length > 0 ? (
                                                customerData.topCustomers.map((customer, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <div className="customer-cell">
                                                                <div className="avatar-circle">
                                                                    {(customer.name || 'C').charAt(0).toUpperCase()}
                                                                </div>
                                                                {customer.name || 'Anonymous'}
                                                            </div>
                                                        </td>
                                                        <td>{customer.email}</td>
                                                        <td>{customer.totalOrders || 0}</td>
                                                        <td>{formatCurrency(customer.totalSpent)}</td>
                                                        <td>
                                                            {customer.lastOrderDate
                                                                ? new Date(customer.lastOrderDate).toLocaleDateString()
                                                                : 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                                                        No customer order activity recorded yet
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="analytics-section fade-in">
                            <div className="card full-width">
                                <h3>Top Selling Products</h3>
                                <div className="table-responsive">
                                    <table className="analytics-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Category</th>
                                                <th>Price</th>
                                                <th>Units Sold</th>
                                                <th>Revenue</th>
                                                <th>Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productData?.topProducts && productData.topProducts.length > 0 ? (
                                                productData.topProducts.map((product, index) => (
                                                    <tr key={index}>
                                                        <td><strong>{product.name}</strong></td>
                                                        <td>
                                                            <span className="badge badge-info" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '9999px', padding: '3px 8px', fontSize: '0.75rem' }}>
                                                                {product.category || 'General'}
                                                            </span>
                                                        </td>
                                                        <td>{formatCurrency(product.price)}</td>
                                                        <td>{product.totalSold || 0}</td>
                                                        <td>{formatCurrency(product.revenue)}</td>
                                                        <td>
                                                            <span
                                                                style={{
                                                                    background: (product.stock || 0) < 10 ? '#fef2f2' : '#ecfdf5',
                                                                    color: (product.stock || 0) < 10 ? '#dc2626' : '#059669',
                                                                    border: `1px solid ${(product.stock || 0) < 10 ? '#fee2e2' : '#a7f3d0'}`,
                                                                    borderRadius: '9999px',
                                                                    padding: '3px 8px',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                {product.stock || 0}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                                                        No product sales recorded yet
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="card full-width" style={{ marginTop: '2rem' }}>
                                <h3>Category Performance</h3>
                                <div className="category-grid">
                                    {productData?.categoryPerformance && Object.keys(productData.categoryPerformance).length > 0 ? (
                                        Object.entries(productData.categoryPerformance).map(
                                            ([category, data], index) => (
                                                <div key={index} className="category-item">
                                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>{category}</h4>
                                                    <div className="category-stats">
                                                        <div className="cat-stat">
                                                            <span>Revenue</span>
                                                            <strong>
                                                                {formatCurrency(data?.revenue)}
                                                            </strong>
                                                        </div>
                                                        <div className="cat-stat">
                                                            <span>Units</span>
                                                            <strong>{data?.unitsSold || 0}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )
                                    ) : (
                                        <div style={{ color: '#64748b', padding: '1rem' }}>
                                            No category data available yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
