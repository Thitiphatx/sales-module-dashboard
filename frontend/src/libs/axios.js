import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add a response interceptor for global error handling
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        let message = 'An unexpected error occurred';

        if (error.response) {
            // The request was made and the server responded with a status code
            message = error.response.data.message || `Error ${error.response.status}: ${error.response.statusText}`;
        } else if (error.request) {
            // The request was made but no response was received
            message = 'Network Error: No response from server. Please check your connection.';
        } else {
            // Something happened in setting up the request
            message = error.message;
        }

        showError(message);
        console.error('API Error:', message);
        
        return Promise.reject(error);
    }
);

export default apiClient;
