import apiClient from "../libs/axios";
import { formatTHB } from "../utils/formatter";


let summaryData = {
    "total_revenue": "0.00",
    "total_orders": 0,
    "average_order_value": "0.00",
    "revenue_trend": 0,
    "orders_trend": 0,
    "aov_trend": 0
}

export async function initSummary() {
    const summaryContainer = document.getElementById("summary-cards");
    console.log("Summary module initialized");
    
    // Render skeleton loader
    summaryContainer.innerHTML = Array(3).fill(0).map(() => `
        <div class="card">
            <div class="card-header">
                <div class="skeleton skeleton-text" style="width: 100px; height: 16px;"></div>
            </div>
            <div class="skeleton skeleton-value" style="width: 150px; height: 28px;"></div>
            <div class="skeleton skeleton-trend" style="width: 120px; height: 14px;"></div>
        </div>
    `).join('');

    await getSummary();
    renderSummaryCard();
}

async function getSummary() {
    try {
        const { data } = await apiClient.get('/api/sales/summary')
        summaryData = data
    } catch (e) {
        // Handle in interceptor
    }
}

function renderTrend(value) {
    if (!value && value !== 0) return '';
    
    const isPositive = value > 0;
    const isNegative = value < 0;
    const absValue = Math.abs(value).toFixed(1);
    
    let trendClass = 'trend-neutral';
    let icon = '';
    
    if (isPositive) {
        trendClass = 'trend-up';
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
    } else if (isNegative) {
        trendClass = 'trend-down';
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
    }

    return `
        <div class="card-trend ${trendClass}">
            ${icon}
            <span>${absValue}%</span>
            <span class="trend-label">from last month</span>
        </div>
    `;
}

function renderSummaryCard() {
    const summaryContainer = document.getElementById("summary-cards");

    // Convert to currency string
    const totalRevenue = formatTHB(parseFloat(summaryData.total_revenue));
    const averageOrderValue = formatTHB(parseFloat(summaryData.average_order_value));

    const icons = {
        revenue: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="card-icon"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
        orders: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="card-icon"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`,
        aov: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="card-icon"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>`
    };

    summaryContainer.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Total Revenue</h3>
                ${icons.revenue}
            </div>
            <div class="card-value">${totalRevenue}</div>
            ${renderTrend(summaryData.revenue_trend)}
        </div>
        <div class="card">
            <div class="card-header">
                <h3>Total Orders</h3>
                ${icons.orders}
            </div>
            <div class="card-value">${summaryData.total_orders}</div>
            ${renderTrend(summaryData.orders_trend)}
        </div>
        <div class="card">
            <div class="card-header">
                <h3>Average Order Value</h3>
                ${icons.aov}
            </div>
            <div class="card-value">${averageOrderValue}</div>
            ${renderTrend(summaryData.aov_trend)}
        </div>
    `
}