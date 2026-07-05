const API_BASE = '/api';

class Api {
    static async get(endpoint) {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return await res.json();
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            throw error;
        }
    }

    static async post(endpoint, data) {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return await res.json();
        } catch (error) {
            console.error(`Error posting to ${endpoint}:`, error);
            throw error;
        }
    }

    static async getAnalytics() {
        return this.get('/analytics');
    }

    static async getProducts() {
        return this.get('/products');
    }

    static async getProduct(id) {
        return this.get(`/products/${id}`);
    }

    static async createProduct(data) {
        return this.post('/products', data);
    }

    static async transferProduct(data) {
        return this.post('/transfer', data);
    }

    static async getBlockchain() {
        return this.get('/blockchain');
    }

    static async validateBlockchain() {
        return this.get('/blockchain/validate');
    }
}
