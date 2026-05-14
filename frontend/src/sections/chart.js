import apiClient from "../libs/axios";
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getChartColor } from '../utils/utils'
import { formatTHB } from '../utils/formatter'

let statusChartInstance = null;
let categoryChartInstance = null;

Chart.register(ChartDataLabels);

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

    if (!chartData || chartData.length === 0) {
        ctx.parentElement.innerHTML = `
        <div class="chart-no-data">
            <svg width="200px" height="200px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.5 10.5H13.5V1.5C15.8869 1.5 18.1761 2.44821 19.864 4.13604C21.5518 5.82387 22.5 8.11305 22.5 10.5Z" stroke="#000" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10.5 4.5C8.71997 4.5 6.97991 5.02784 5.49987 6.01677C4.01983 7.00571 2.86628 8.41131 2.18509 10.0558C1.5039 11.7004 1.32567 13.51 1.67294 15.2558C2.0202 17.0016 2.87737 18.6053 4.13604 19.864C5.39472 21.1226 6.99836 21.9798 8.74419 22.3271C10.49 22.6743 12.2996 22.4961 13.9442 21.8149C15.5887 21.1337 16.9943 19.9802 17.9832 18.5001C18.9722 17.0201 19.5 15.28 19.5 13.5H10.5V4.5Z" stroke="#000" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>Sales data not available</p>
        </div>
        `
        return
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
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem, context) {
                            const orderCount = tooltipItem.raw
                            return `${orderCount} ${orderCount <= 1 ? 'order' : 'orders'}`
                        }
                    }
                },
                datalabels: {
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 16
                    },
                    formatter: (value, ctx) => {
                        // Get the total sum of the dataset
                        let sum = 0;
                        ctx.chart.data.datasets[0].data.map(data => {
                            sum += data;
                        });

                        let percentage = (value * 100 / sum).toFixed(1) + "%";
                        return percentage;
                    }
                }
            },
        },
    };

    statusChartInstance = new Chart(ctx, config)

}

function renderBarChart(ctx, chartData, field = "total_orders") {
    const select = document.getElementById("chart-category-select");

    // Destory previous instance before rendering
    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }

    if (!chartData || chartData.length === 0) {
        ctx.parentElement.innerHTML = `
        <div class="chart-no-data">
            <svg width="200px" height="200px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.5 10.5H13.5V1.5C15.8869 1.5 18.1761 2.44821 19.864 4.13604C21.5518 5.82387 22.5 8.11305 22.5 10.5Z" stroke="#000" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10.5 4.5C8.71997 4.5 6.97991 5.02784 5.49987 6.01677C4.01983 7.00571 2.86628 8.41131 2.18509 10.0558C1.5039 11.7004 1.32567 13.51 1.67294 15.2558C2.0202 17.0016 2.87737 18.6053 4.13604 19.864C5.39472 21.1226 6.99836 21.9798 8.74419 22.3271C10.49 22.6743 12.2996 22.4961 13.9442 21.8149C15.5887 21.1337 16.9943 19.9802 17.9832 18.5001C18.9722 17.0201 19.5 15.28 19.5 13.5H10.5V4.5Z" stroke="#000" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>Sales data not available</p>
        </div>
        `

        if (select) select.disabled = true;

        return
    }

    if (select) select.disabled = false;

    const xAxisLabel = {
        "total_orders": "Total Orders",
        "total_revenue": "Total Revenue (฿)",
        "average_order_value": "Average Order Value (฿)"
    }

    const fields = {
        "total_orders": {
            label: "Total Orders",
            unit: "order"
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
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const value = context.parsed.y;
                            // if field is currency convert to currency string
                            if (field === 'total_revenue' || field === 'average_order_value') {
                                return `${formatTHB(value)}`;
                            } else if (field === 'total_orders') {
                                return `${value} ${value <= 1 ? 'order' : 'orders'}`;
                            }
                            return value
                        }
                    }
                },
                datalabels: {
                    display: false
                }
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