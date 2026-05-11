import apiClient from '../libs/axios';
import { formatTHB } from '../utils/formatter';

const state = {
    items: [],
    total: 0,
    page: 1,
    size: 5,
    pages: 0,
    filters: {
        customer_name: '',
        product_category: '',
        status: '',
        date_from: '',
        date_to: '',
        min_amount: '',
        max_amount: ''
    }
};

export async function initRecentSales() {
    await fetchAndRender();
    setupFilterListeners();
}

async function fetchAndRender() {
    const tbody = document.getElementById("recent-sales-tbody");
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="loading-state">
                        <p>Loading...</p>
                    </div>
                </td>
            </tr>
        `;
    }

    try {
        const params = { page: state.page, size: state.size, ...state.filters };
        Object.keys(params).forEach(key => { if (params[key] === '') delete params[key]; });

        const { data } = await apiClient.get('/api/sales', { params });

        state.items = data.items;
        state.total = data.total;
        state.page = data.page;
        state.size = data.size;
        state.pages = data.pages;

        renderTable();
        renderPagination();
    } catch (error) {
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="error">Failed to load recent sales.</td>
                </tr>
            `;
        }
    }
}

function renderTable() {
    const tbody = document.getElementById("recent-sales-tbody");
    if (!tbody) return;

    if (state.items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">No recent sales found.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = state.items.map(sale => `
        <tr>
            <td>${sale.order_id}</td>
            <td>${new Date(sale.date).toLocaleDateString()}</td>
            <td>${sale.customer_name}</td>
            <td>${sale.product_category}</td>
            <td class="tag-column">
                <span class="tag status-${sale.status}">${sale.status}</span>
            </td>
            <td class="amount-column">${formatTHB(sale.total_amount, false)}</td>
        </tr>
    `).join('');
}

function renderPagination() {
    const container = document.getElementById("recent-sales-pagination-container");
    if (!container) return;

    const start = state.total === 0 ? 0 : (state.page - 1) * state.size + 1;
    const end = Math.min(state.page * state.size, state.total);

    let options = '';
    for (let i = 1; i <= state.pages; i++) {
        options += `<option value="${i}" ${i === state.page ? 'selected' : ''}>Page ${i}</option>`;
    }

    container.innerHTML = `
        <div class="pagination-info">Showing ${start} to ${end} of ${state.total} results</div>
        <div class="pagination-controls">
            <button class="pagination-btn" id="prev-page" ${state.page <= 1 ? 'disabled' : ''}>Previous</button>
            <select id="page-select" class="pagination-select">
                ${options}
            </select>
            <button class="pagination-btn" id="next-page" ${state.page >= state.pages ? 'disabled' : ''}>Next</button>
        </div>
    `;

    // Re-select elements because they were just re-created
    const pageSelect = document.getElementById("page-select");
    const prevPage = document.getElementById("prev-page");
    const nextPage = document.getElementById("next-page");

    if (pageSelect) {
        pageSelect.addEventListener("change", (e) => {
            state.page = parseInt(e.target.value);
            fetchAndRender();
        });
    }

    if (prevPage) {
        prevPage.addEventListener("click", () => {
            if (state.page > 1) { state.page--; fetchAndRender(); }
        });
    }

    if (nextPage) {
        nextPage.addEventListener("click", () => {
            if (state.page < state.pages) { state.page++; fetchAndRender(); }
        });
    }
}

function setupFilterListeners() {
    const filterForm = document.getElementById("filter-form");
    const resetBtn = filterForm?.querySelector('button[type="reset"]');

    if (filterForm && resetBtn) {
        const handleDisableResetButton = () => {
            const formData = new FormData(filterForm);
            const hasValues = Array.from(formData.values()).some(value => value.trim() !== "");
            resetBtn.disabled = !hasValues;
        };
        handleDisableResetButton();

        // Update reset button while typing
        filterForm.addEventListener("input", handleDisableResetButton);

        filterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const formData = new FormData(filterForm);

            // Update State
            state.filters.customer_name = formData.get("customer_name") || '';
            state.filters.product_category = formData.get("product_category") || '';
            state.filters.status = formData.get("status") || '';
            state.filters.date_from = formData.get("date_from") || '';
            state.filters.date_to = formData.get("date_to") || '';
            state.filters.min_amount = formData.get("min_amount") || '';
            state.filters.max_amount = formData.get("max_amount") || '';
            state.page = 1;
            fetchAndRender();
        });

        filterForm.addEventListener("reset", () => {
            Object.keys(state.filters).forEach(key => state.filters[key] = '');
            state.page = 1;
            handleDisableResetButton();
            fetchAndRender();
        });
    }
}
