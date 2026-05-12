import apiClient from "../libs/axios";
import Chart from 'chart.js/auto';
import { getChartColor } from '../utils/utils'
import { formatTHB } from '../utils/formatter'

let statusChartInstance = null;
let categoryChartInstance = null;

export async function initChart() {
    const chartContainer = document.getElementById("sales-chart");
    const statusCtx = document.getElementById('status-chart')
    const categoryCtx = document.getElementById('category-chart')

    const [statusData, categoryData] = await Promise.all([
        getChartData("status"),
        getChartData("category")
    ]);

    renderDoughnutChart(statusCtx, statusData);
    renderBarChart(categoryCtx, categoryData);

    const select = document.getElementById("chart-category-select");
    select.addEventListener("change", (e) => {
        renderBarChart(categoryCtx, categoryData, e.target.value);
    });
}

async function getChartData(groupBy) {
    try {
        const { data } = await apiClient.get('/api/sales/chart-data', {
            params: { group_by: groupBy }
        })
        return data;
    } catch {
        // Handle in interceptor
    }
}

async function renderDoughnutChart(ctx, chartData) {
    // destory previous instance before rendering
    if (statusChartInstance) {
        statusChartInstance.destroy();
    }

    const statusColors = {
        "shipped": "#4AD1A2",
        "pending": "#fcb700",
        "cancelled": "#ff627d"
    }

    const data = {
        labels: chartData.map(row => {
            const str = String(row.label)
            return str.charAt(0).toLocaleUpperCase() + str.slice(1)
        }),
        datasets: [
            {
                data: chartData.map(row => parseFloat(row.total_orders)),
                backgroundColor: chartData.map(row => statusColors[row.label])
            }
        ]
    };

    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Sales Order Status Chart'
                }
            },
        },
    };


    statusChartInstance = new Chart(ctx, config)

}

function renderBarChart(ctx, chartData, field = "total_orders") {
    // destory previous instance before rendering
    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }

    const xAxisLabel = {
        "total_orders": "Total Orders",
        "total_revenue": "Total Revenue (฿)",
        "average_order_value": "Average Order Value (฿)"
    }

    const fields = {
        "total_orders": {
            label: "Total Orders",
            unit: "Order"
        },
        "total_revenue": {
            label: "Total Revenue (฿)",
            unit: ""
        },
        "average_order_value": {
            label: "Average Order Value (฿)",
            unit: ""
        }
    }

    const data = {
        labels: chartData.map(row => row.label),
        datasets: [
            {
                data: chartData.map(row => row[field]),
                backgroundColor: chartData.map((_, index) => getChartColor(index)),
            }
        ]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Sales Order By Category Chart'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const value = context.parsed.y;
                            
                            // if field is currency convert by using formatTHB
                            if (field === 'total_revenue' || field === 'average_order_value') {
                                return `${formatTHB(value)}`;
                            } else {
                                return `${value} ${fields[field].unit}`;
                            }
                        }
                    }
                },
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Category Names',
                        font: {
                            family: 'Inter',
                            lineHeight: 1.2,
                        },
                        padding: { top: 20, left: 0, right: 0, bottom: 0 }
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: fields[field].label,
                        font: {
                            family: 'Inter',
                            lineHeight: 1.2
                        },
                        padding: { top: 30, left: 0, right: 0, bottom: 0 }
                    }
                }
            }
        },
    };


    categoryChartInstance = new Chart(ctx, config)
}