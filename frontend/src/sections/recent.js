import apiClient from '../libs/axios';
import { formatTHB } from '../utils/formatter';

const FILTER_FIELDS = [
    'customer_name',
    'product_category',
    'status',
    'date_from',
    'date_to',
    'min_amount',
    'max_amount'
];

const state = {
    items: [],
    total: 0,
    page: 1,
    size: 5,
    pages: 0,
    filters: Object.fromEntries(FILTER_FIELDS.map(f => [f, '']))
};

export async function initRecentSales() {
    setupFilterListeners();
    setupPaginationListeners();
    await loadRecentSales();
}

async function loadRecentSales() {
    const tbody = document.getElementById('recent-sales-tbody');
    const container = document.getElementById('recent-sales-pagination-container');

    renderLoading(tbody);
    await getRecentData();

    renderTable(tbody);
    renderPagination(container);
}

function renderLoading(tbody) {
    tbody.innerHTML = `
        <tr>
            <td colspan="6">
                <div class="table-content-text">
                    <p>Loading…</p>
                </div>
            </td>
        </tr>
    `;
}

async function getRecentData() {
    try {
        const params = {
            page: state.page,
            size: state.size,
        };

        FILTER_FIELDS.forEach(key => {
            const value = state.filters[key];
            if (value !== '' && value !== null && value !== undefined) {
                params[key] = value;
            }
        });

        const { data } = await apiClient.get('/api/sales/recent', {
            params
        });

        // Set pagination result to state
        Object.assign(state, {
            items: data.items,
            total: data.total,
            page: data.page,
            size: data.size,
            pages: data.pages,
        });

    } catch {
        // Handle in interceptor
    }
}

function renderTable(tbody) {
    if (!state.items.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="table-content-text">
                        <p>Sales data are empty</p>
                    </div>
                </td>
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
                <span class="tag status-${sale.status}">
                    ${sale.status}
                </span>
            </td>
            <td class="amount-column">
                ${formatTHB(sale.total_amount, false)}
            </td>
        </tr>
    `).join('');
}

function renderPagination(container) {
    const start = state.total === 0 ? 0 : (state.page - 1) * state.size + 1;
    const end = Math.min(
        state.page * state.size,
        state.total
    );
    const pageOptions = Array.from(
        { length: state.pages },
        (_, i) => {
            const page = i + 1;

            return `
                <option
                    value="${page}"
                    ${page === state.page ? 'selected' : ''}
                >
                    Page ${page}
                </option>
            `;
        }
    ).join('');
    container.innerHTML = `
        <div class="table-footer">
            <div class="pagination-info">
                Showing ${start} to ${end} of ${state.total} results
            </div>

            <div class="pagination-controls">
                <button
                    id="prev-page"
                    ${state.page <= 1 ? 'disabled' : ''}
                >
                    Previous
                </button>

                <select
                    id="page-select"
                >
                    ${pageOptions}
                </select>

                <button
                    id="next-page"
                    ${state.page >= state.pages ? 'disabled' : ''}
                >
                    Next
                </button>
            </div>
        </div>
    `;
}

// Toggle disabled of clear filter button
function renderClearFilter(form) {
    const resetBtn = form?.querySelector('button[type="reset"]');
    if (!resetBtn) return;
    const isActive = FILTER_FIELDS.some(name =>
        form.querySelector(`[name="${name}"]`)
            ?.value
            .trim()
    );
    resetBtn.disabled = !isActive;
}

function setupPaginationListeners() {
    document.addEventListener('change', async e => {
        if (e.target.id !== 'page-select') return;
        state.page = parseInt(e.target.value);
        await loadRecentSales();
    });

    document.addEventListener('click', async e => {
        if (e.target.id === 'prev-page' && state.page > 1) {
            state.page--;
            await loadRecentSales();
        }
        if (e.target.id === 'next-page' && state.page < state.pages) {
            state.page++;
            await loadRecentSales();
        }
    });
}

function setupFilterListeners() {
    const filterForm = document.getElementById('filter-form');
    if (!filterForm) return;
    renderClearFilter(filterForm);
    filterForm.addEventListener('input', () => {
        renderClearFilter(filterForm);
    });
    filterForm.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(filterForm);
        FILTER_FIELDS.forEach(key => {
            state.filters[key] = formData.get(key) || '';
        });
        state.page = 1;
        await loadRecentSales();
    });

    filterForm.addEventListener('reset', async () => {
        // Clear each filter field inside state
        FILTER_FIELDS.forEach(key => {
            state.filters[key] = '';
        });
        state.page = 1;
        renderClearFilter(filterForm);
        await loadRecentSales();
    });
}