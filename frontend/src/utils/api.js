// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : '/api';

// API Helper Functions
const api = {
    // Generic request handler
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = localStorage.getItem('token');

        const isFormData = options.body instanceof FormData;

        const config = {
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        };

        // Automatically set Content-Type for JSON, but let browser handle it for FormData
        if (!isFormData && !config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Une erreur est survenue');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // GET request
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    // POST request
    async post(endpoint, data) {
        const isFormData = data instanceof FormData;
        return this.request(endpoint, {
            method: 'POST',
            body: isFormData ? data : JSON.stringify(data)
        });
    },

    // PUT request
    async put(endpoint, data) {
        const isFormData = data instanceof FormData;
        return this.request(endpoint, {
            method: 'PUT',
            body: isFormData ? data : JSON.stringify(data)
        });
    },

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },

    // Auth endpoints
    auth: {
        login: (credentials) => api.post('/auth/login', credentials),
        register: (userData) => api.post('/auth/register', userData),
        logout: () => api.post('/auth/logout'),
        getProfile: () => api.get('/auth/profile')
    },

    // Chants endpoints
    chants: {
        getAll: (filters = {}) => {
            const params = new URLSearchParams(filters);
            return api.get(`/chants?${params}`);
        },
        getById: (id) => api.get(`/chants/${id}`),
        create: (data) => api.post('/chants', data),
        update: (id, data) => api.put(`/chants/${id}`, data),
        delete: (id) => api.delete(`/chants/${id}`)
    },

    // Playlists endpoints
    playlists: {
        getAll: () => api.get('/playlists'),
        getById: (id) => api.get(`/playlists/${id}`),
        create: (data) => api.post('/playlists', data),
        update: (id, data) => api.put(`/playlists/${id}`, data),
        delete: (id) => api.delete(`/playlists/${id}`),
        addChant: (playlistId, chantId) => api.post(`/playlists/${playlistId}/chants`, { chantId })
    }
};

// Export for use in other files
window.api = api;
