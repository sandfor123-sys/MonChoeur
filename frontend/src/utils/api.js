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

    // XMLHTTPRequest for upload progress
    upload(endpoint, formData, onProgress, method = 'POST') {
        return new Promise((resolve, reject) => {
            const url = `${API_BASE_URL}${endpoint}`;
            const token = localStorage.getItem('token');
            const xhr = new XMLHttpRequest();

            xhr.open(method, url, true);

            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }

            if (onProgress) {
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = (e.loaded / e.total) * 100;
                        onProgress(percentComplete);
                    }
                };
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        resolve(data);
                    } catch (e) {
                        resolve(xhr.responseText);
                    }
                } else {
                    try {
                        const error = JSON.parse(xhr.responseText);
                        reject(new Error(error.error || 'Erreur lors de l\'envoi'));
                    } catch (e) {
                        reject(new Error(xhr.statusText));
                    }
                }
            };

            xhr.onerror = () => reject(new Error('Erreur réseau'));

            xhr.send(formData);
        });
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
        update: (id, data) => api.put(`/chants/${id}`, data),
        delete: (id) => api.delete(`/chants/${id}`),
        uploadWithProgress: (data, onProgress) => api.upload('/chants', data, onProgress, 'POST'),
        updateWithProgress: (id, data, onProgress) => api.upload(`/chants/${id}`, data, onProgress, 'PUT'),
        deleteAudio: (chantId, audioId) => api.delete(`/chants/${chantId}/audio/${audioId}`),
        deletePartition: (chantId, partitionId) => api.delete(`/chants/${chantId}/partition/${partitionId}`)
    },

    // Playlists endpoints
    playlists: {
        getAll: () => api.get('/playlists'),
        getById: (id) => api.get(`/playlists/${id}`),
        create: (data) => api.post('/playlists', data),
        update: (id, data) => api.put(`/playlists/${id}`, data),
        delete: (id) => api.delete(`/playlists/${id}`),
        addChant: (playlistId, chantId) => api.post(`/playlists/${playlistId}/chants`, { chantId }),
        removeChant: (playlistId, chantId) => api.delete(`/playlists/${playlistId}/chants/${chantId}`)
    },

    // Administrative endpoints
    admin: {
        getUsers: () => api.get('/auth/users'),
        updateUserRole: (id, role) => api.put(`/auth/users/${id}`, { role })
    }
};

// Export for use in other files
window.api = api;
