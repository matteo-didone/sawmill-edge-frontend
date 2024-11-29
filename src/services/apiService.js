import axios from 'axios';

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api';

class APIService {
    constructor() {
        this.axios = axios.create({
            baseURL: API_BASE_URL,
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async getConfig() {
        try {
            const response = await this.axios.get('/config');
            return response.data;
        } catch (error) {
            console.error('Error fetching config:', error);
            throw error;
        }
    }

    async updateConfig(config) {
        try {
            const response = await this.axios.put('/config', config);
            return response.data;
        } catch (error) {
            console.error('Error updating config:', error);
            throw error;
        }
    }

    async startMachine() {
        try {
            await this.axios.post('/machine/start');
        } catch (error) {
            console.error('Error starting machine:', error);
            throw error;
        }
    }

    async stopMachine() {
        try {
            await this.axios.post('/machine/stop');
        } catch (error) {
            console.error('Error stopping machine:', error);
            throw error;
        }
    }

    async updateSpeed(speed) {
        try {
            await this.axios.post('/machine/speed', { speed });
        } catch (error) {
            console.error('Error updating speed:', error);
            throw error;
        }
    }

    async getHealthStatus() {
        try {
            const response = await this.axios.get('/machine/health');
            return response.data;
        } catch (error) {
            console.error('Error fetching health status:', error);
            throw error;
        }
    }
}

export const apiService = new APIService();