import React from 'react';
import ReactDOM from 'react-dom/client';
import { getCLS, getFCP, getLCP, getTTFB } from 'web-vitals';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// ── Web Vitals / Real User Monitoring (RUM) ──────────────────────────────────
const reportWebVital = (metric) => {
    if (process.env.NODE_ENV === 'development') {
        console.info(`[Web Vitals] ${metric.name}:`, Math.round(metric.value), metric.rating);
        return;
    }

    const endpoint =
        process.env.REACT_APP_ANALYTICS_URL ||
        `${process.env.REACT_APP_API_URL || ''}/api/metrics/vitals`;

    const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
        url: window.location.href,
        userAgent: navigator.userAgent,
    });

    if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }));
    } else {
        fetch(endpoint, { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
    }
};

getCLS(reportWebVital);
getFCP(reportWebVital);
getLCP(reportWebVital);
getTTFB(reportWebVital);
