// src/services/apiService.js

const API_BASE_URL = 'http://localhost:3000/api'; // Cambia con il tuo URL backend

export const apiService = {
    // Configurazione
    async getConfig() {
        try {
            const response = await fetch(`${API_BASE_URL}/config`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching config:', error);
            throw error;
        }
    },

    async updateConfig(config) {
        try {
            const response = await fetch(`${API_BASE_URL}/config`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config)
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating config:', error);
            throw error;
        }
    },

    // Controllo macchina
    async startMachine() {
        try {
            const response = await fetch(`${API_BASE_URL}/machine/start`, { method: 'POST' });
            return await response.json();
        } catch (error) {
            console.error('Error starting machine:', error);
            throw error;
        }
    },

    async stopMachine() {
        try {
            const response = await fetch(`${API_BASE_URL}/machine/stop`, { method: 'POST' });
            return await response.json();
        } catch (error) {
            console.error('Error stopping machine:', error);
            throw error;
        }
    },

    async updateSpeed(speed) {
        try {
            const response = await fetch(`${API_BASE_URL}/machine/speed`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ speed })
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating speed:', error);
            throw error;
        }
    }
};