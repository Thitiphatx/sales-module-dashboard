import apiClient from '../../../frontend/assets/js/lib/axios.js';

export async function initRecentSales() {
    const recentSalesContainer = document.getElementById("recent-sales");
    console.log("Recent Sales module initialized");

    try {
        const response = await apiClient.get('/api/sales', {
            params: { size: 5 }
        });

        const sales = response.data.items;
        renderTable(recentSalesContainer, sales);
    } catch (error) {
        recentSalesContainer.innerHTML = "<p class='error'>Failed to load recent sales.</p>";
    }
}

function renderTable(container, sales) {
    if (!sales || sales.length === 0) {
        container.innerHTML = "<p>No recent sales found.</p>";
        return;
    }

    const tableHTML = `
        <h3>Recent Sales</h3>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${sales.map(sale => `
                    <tr>
                        <td>#${sale.order_id}</td>
                        <td>${new Date(sale.date).toLocaleDateString()}</td>
                        <td>${sale.customer_name}</td>
                        <td>${sale.product_category}</td>
                        <td><span class="status-${sale.status}">${sale.status}</span></td>
                        <td>$${parseFloat(sale.total_amount).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = tableHTML;
}