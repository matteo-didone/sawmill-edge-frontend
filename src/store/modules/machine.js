import { apiService } from '@/services/apiService';

export default {
    namespaced: true,
    state: {
        status: 'idle',
        connected: false,
        config: null,
        error: null,
        activeTime: '0:00:00',
        alertMessage: null,
        operationalStatus: {
            safetyChecksOk: true,
            maintenance: false,
            error: null
        },
        currentSpeed: 0,
        targetSpeed: 0,
        safetyLimits: {
            maxSpeed: 100,
            minSpeed: 0
        }
    },
    mutations: {
        SET_MACHINE_STATUS(state, status) {
            state.status = status;
        },
        SET_CONNECTION_STATUS(state, status) {
            state.connected = status;
        },
        SET_CONFIG(state, config) {
            state.config = config;
        },
        SET_ERROR(state, error) {
            state.error = error;
            state.alertMessage = error;
        },
        SET_ALERT_MESSAGE(state, message) {
            state.alertMessage = message;
        },
        SET_CURRENT_SPEED(state, speed) {
            state.currentSpeed = speed;
        },
        SET_TARGET_SPEED(state, speed) {
            state.targetSpeed = speed;
        },
        SET_OPERATIONAL_STATUS(state, status) {
            state.operationalStatus = { ...state.operationalStatus, ...status };
        }
    },
    getters: {
        currentConfig: state => state.config,
        isOperational: state =>
            state.connected &&
            state.operationalStatus.safetyChecksOk &&
            !state.operationalStatus.maintenance &&
            !state.operationalStatus.error,
        canStart: (state, getters) =>
            getters.isOperational && state.status === 'idle',
        canStop: (state, getters) =>
            getters.isOperational && state.status === 'running'
    },
    actions: {
        async saveConfig({ commit }, config) {
            try {
                // Simula una richiesta API per salvare la configurazione
                await apiService.saveConfig(config);
                commit('SET_CONFIG', config);
                commit('SET_ALERT_MESSAGE', 'Configuration saved successfully');
            } catch (error) {
                commit('SET_ERROR', 'Failed to save configuration');
                throw error;
            }
        },
        setAlert({ commit }, alertMessage) {
            commit('SET_ALERT_MESSAGE', alertMessage);
        },
        async updateSpeed({ commit }, speed) {
            try {
                // Simula una richiesta API per aggiornare la velocità
                await apiService.updateCuttingSpeed(speed);
                commit('SET_CURRENT_SPEED', speed);
                commit('SET_ALERT_MESSAGE', 'Speed updated successfully');
            } catch (error) {
                commit('SET_ERROR', 'Failed to update speed');
                throw error;
            }
        },
        async startMachine({ commit }) {
            try {
                await apiService.startMachine();
                commit('SET_MACHINE_STATUS', 'running');
                commit('SET_ALERT_MESSAGE', 'Machine started successfully');
            } catch (error) {
                commit('SET_ERROR', 'Failed to start machine');
                throw error;
            }
        },
        async stopMachine({ commit }) {
            try {
                await apiService.stopMachine();
                commit('SET_MACHINE_STATUS', 'idle');
                commit('SET_ALERT_MESSAGE', 'Machine stopped successfully');
            } catch (error) {
                commit('SET_ERROR', 'Failed to stop machine');
                throw error;
            }
        },
        async emergencyStop({ commit }) {
            try {
                await apiService.executeCommand('EMERGENCY_STOP');
                commit('SET_MACHINE_STATUS', 'emergency');
                commit('SET_ALERT_MESSAGE', 'Emergency stop executed');
            } catch (error) {
                commit('SET_ERROR', 'Failed to execute emergency stop');
                throw error;
            }
        },
        async loadConfig({ commit }) {
            try {
                const config = await apiService.getConfig();
                commit('SET_CONFIG', config);
                commit('SET_ALERT_MESSAGE', 'Configuration loaded successfully');
            } catch (error) {
                commit('SET_ERROR', 'Failed to load configuration');
                throw error;
            }
        },
        async initialize({ commit, dispatch }) {
            try {
                await dispatch('loadConfig');
                commit('SET_CONNECTION_STATUS', true);
                commit('SET_ALERT_MESSAGE', 'Machine initialized successfully');
            } catch (error) {
                commit('SET_CONNECTION_STATUS', false);
                commit('SET_ERROR', 'Failed to initialize machine');
                throw error;
            }
        }
    }
};