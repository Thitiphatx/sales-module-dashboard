import apiClient from "../libs/axios";

export function initChart() {
    const chartContainer = document.getElementById("sales-chart");
    console.log("Chart module initialized");
    // Fetch and render data here
    chartContainer.innerHTML = "<p>Sales Chart Content</p>";
}

async function getChartData(groupBy) {
    try {
        const { data } = await apiClient.get('/api/chart-data', {
            params: { group_by: groupBy }
        })
        return data;
    } catch {
        // Handle in interceptor
    }
} 