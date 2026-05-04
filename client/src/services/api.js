import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add a request interceptor to include the token in headers
API.interceptors.request.use((req) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
        req.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return req;
});

export const authAPI = {
    login: (credentials) => API.post('/auth/login', credentials),
    register: (userData) => API.post('/auth/register', userData),
};

export const customerAPI = {
    getAll: () => API.get('/customers'),
    getById: (id) => API.get(`/customers/${id}`),
    create: (data) => API.post('/customers', data),
    update: (id, data) => API.put(`/customers/${id}`, data),
    delete: (id) => API.delete(`/customers/${id}`),
};

export const transactionAPI = {
    getByCustomer: (customerId) => API.get(`/transactions/${customerId}`),
    create: (data) => API.post('/transactions', data),
    delete: (id) => API.delete(`/transactions/${id}`),
    getStats: () => API.get('/transactions/stats/daily'),
};

export default API;
