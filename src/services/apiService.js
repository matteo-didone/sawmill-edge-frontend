import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

class APIService {
    constructor() {
        this.axios = axios.create({
            baseURL: API_BASE_URL,
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: false  // Cambiato a false per evitare problemi CORS con credenziali
        });

        // Interceptor per il logging delle richieste
        this.axios.interceptors.request.use(
            config => {
                console.log('Making request to:', config.url);
                return config;
            },
            error => {
                console.error('Request error:', error);
                return Promise.reject(error);
            }
        );

        // Interceptor per le risposte e gli errori
        this.axios.interceptors.response.use(
            response => response,
            error => this.handleError(error)
        );
    }

    async getMachineStatus() {
        try {
            const response = await this.axios.get('/status');
            return response.data;
        } catch (error) {
            console.error('Error fetching machine status:', error);
            throw error;
        }
    }

    async executeCommand(command, params = {}) {
        try {
            const response = await this.axios.post('/command', {
                command,
                params
            });
            return response.data;
        } catch (error) {
            console.error('Error executing command:', error);
            throw error;
        }
    }

    async getAlarms() {
        try {
            const response = await this.axios.get('/alarms');
            return response.data;
        } catch (error) {
            console.error('Error fetching alarms:', error);
            throw error;
        }
    }

    async acknowledgeAlarm(alarmCode) {
        try {
            const response = await this.axios.post(`/alarms/${alarmCode}/acknowledge`);
            return response.data;
        } catch (error) {
            console.error('Error acknowledging alarm:', error);
            throw error;
        }
    }

    async getMetrics() {
        try {
            const response = await this.axios.get('/metrics');
            return response.data;
        } catch (error) {
            console.error('Error fetching metrics:', error);
            throw error;
        }
    }

    async getDiagnostics() {
        try {
            const [status, metrics, alarms] = await Promise.all([
                this.getMachineStatus(),
                this.getMetrics(),
                this.getAlarms()
            ]);

            return {
                opcua: {
                    connected: status.connections?.opcua || false,
                    latency: status.latencies?.opcua || 0,
                    lastSync: status.lastSync
                },
                mqtt: {
                    connected: status.connections?.mqtt || false,
                    qos: status.mqtt?.qos || 0,
                    messageRate: status.mqtt?.messageRate || 0
                },
                systemHealth: metrics.systemHealth || 100,
                cpu: metrics.cpu || 0,
                memory: metrics.memory || 0,
                sensors: this._formatSensorsData(status.sensors || []),
                logs: status.logs || []
            };
        } catch (error) {
            console.error('Error fetching diagnostics:', error);
            throw error;
        }
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

    async saveConfig(config) {
        try {
            console.log("Sending config:", config);
            const response = await this.axios.post('/config', config, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error saving config:", error);
            throw error;
        }
    }

    async updateSystemHealth(health) {
        try {
            const response = await this.axios.post('/system/health', { health });
            return response.data;
        } catch (error) {
            console.error('Error updating system health:', error);
            throw error;
        }
    }

    async setMaintenanceMode(status) {
        try {
            const response = await this.axios.post('/system/maintenance', { status });
            return response.data;
        } catch (error) {
            console.error('Error setting maintenance mode:', error);
            throw error;
        }
    }

    async logMaintenance(logData) {
        try {
            const response = await this.axios.post('/maintenance/logs', logData);
            return response.data;
        } catch (error) {
            console.error('Error logging maintenance:', error);
            throw error;
        }
    }

    async updateComponentStatus(componentId, status) {
        try {
            const response = await this.axios.post(`/components/${componentId}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Error updating component status:', error);
            throw error;
        }
    }

    async getPerformanceMetrics() {
        try {
            const response = await this.axios.get('/metrics/performance');
            return response.data;
        } catch (error) {
            console.error('Error getting performance metrics:', error);
            throw error;
        }
    }

    async startMachine() {
        return this.executeCommand('START');
    }

    async stopMachine() {
        return this.executeCommand('STOP');
    }

    async updateCuttingSpeed(speed) {
        return this.executeCommand('SET_SPEED', { speed });
    }

    async calibrateSensor(sensorId) {
        try {
            const response = await this.axios.post(`/sensors/${sensorId}/calibrate`);
            return response.data;
        } catch (error) {
            console.error('Error calibrating sensor:', error);
            throw error;
        }
    }

    _formatSensorsData(sensors) {
        return sensors.map(sensor => ({
            id: sensor.id,
            name: sensor.name,
            type: sensor.type,
            status: sensor.status,
            lastReading: sensor.lastReading,
            value: sensor.value,
            unit: sensor.unit,
            health: sensor.health || 100
        }));
    }

    handleError(error) {
        if (error.response) {
            console.error('Server Error:', error.response.data);
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);

            if (error.response.data.detail && Array.isArray(error.response.data.detail)) {
                const missingFields = error.response.data.detail
                    .map(err => {
                        if (err.type === "missing") {
                            return err.loc?.join('.');
                        } else if (err.type === "value_error") {
                            return `${err.loc?.join('.')} (${err.msg})`;
                        }
                        return `${err.loc?.join('.')} (${err.type}: ${err.msg})`;
                    })
                    .filter(Boolean)
                    .join(', ');

                throw new Error(`Errore di validazione: ${missingFields}`);
            }

            throw new Error(error.response.data.detail || 'Server error occurred');
        } else if (error.request) {
            console.error('Network Error:', error.request);
            throw new Error('Network error - no response from server');
        } else {
            console.error('Request Error:', error.message);
            throw new Error('Error setting up the request');
        }
    }
}

export const apiService = new APIService();