// store/modules/machine.js
import { apiService } from '@/services/apiService';

export default {
    namespaced: true,
    state: {
        status: 'idle', // idle, running, error, maintenance
        connected: false,
        config: null,
        error: null,
        alerts: [], // Aggiunto array per gli alert
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
        },
        SET_OPERATIONAL_STATUS(state, status) {
            state.operationalStatus = { ...state.operationalStatus, ...status };
        },
        SET_CURRENT_SPEED(state, speed) {
            state.currentSpeed = speed;
        },
        SET_TARGET_SPEED(state, speed) {
            state.targetSpeed = speed;
        },
        SET_ALERT(state, alert) {
            state.alerts.push(alert);
        },
        CLEAR_ALERTS(state) {
            state.alerts = [];
        }
    },

    getters: {
        isConnected: state => state.connected,
        machineStatus: state => state.status,
        currentConfig: state => state.config,
        currentError: state => state.error,

        isOperational: state =>
            state.connected &&
            state.operationalStatus.safetyChecksOk &&
            !state.operationalStatus.maintenance &&
            !state.operationalStatus.error,

        canStart: (state, getters) =>
            getters.isOperational &&
            state.status === 'idle',

        canStop: (state, getters) =>
            getters.isOperational &&
            state.status === 'running',

        currentSpeed: state => state.currentSpeed,
        targetSpeed: state => state.targetSpeed,

        speedLimits: state => ({
            min: state.safetyLimits.minSpeed,
            max: state.safetyLimits.maxSpeed
        }),

        alerts: state => state.alerts,
        hasAlerts: state => state.alerts.length > 0,
        latestAlert: state => state.alerts[state.alerts.length - 1]
    },

    actions: {
        async loadConfig({ commit }) {
            try {
                const config = await apiService.getConfig();
                commit('SET_CONFIG', config);
            } catch (error) {
                commit('SET_ERROR', 'Failed to load configuration');
                throw error;
            }
        },

        async updateConfig({ commit }, config) {
            try {
                const updatedConfig = await apiService.updateConfig(config);
                commit('SET_CONFIG', updatedConfig);
                return true;
            } catch (error) {
                commit('SET_ERROR', 'Failed to update configuration');
                return false;
            }
        },

        async startMachine({ commit, getters }) {
            if (!getters.canStart) {
                throw new Error('Machine cannot be started in current state');
            }

            try {
                await apiService.startMachine();
                commit('SET_MACHINE_STATUS', 'running');
            } catch (error) {
                commit('SET_ERROR', 'Failed to start machine');
                throw error;
            }
        },

        async stopMachine({ commit, getters }) {
            if (!getters.canStop) {
                throw new Error('Machine cannot be stopped in current state');
            }

            try {
                await apiService.stopMachine();
                commit('SET_MACHINE_STATUS', 'idle');
            } catch (error) {
                commit('SET_ERROR', 'Failed to stop machine');
                throw error;
            }
        },

        async updateSpeed({ commit, state }, speed) {
            if (speed < state.safetyLimits.minSpeed || speed > state.safetyLimits.maxSpeed) {
                throw new Error('Speed outside of safety limits');
            }

            try {
                await apiService.updateSpeed(speed);
                commit('SET_TARGET_SPEED', speed);
            } catch (error) {
                commit('SET_ERROR', 'Failed to update speed');
                throw error;
            }
        },

        updateOperationalStatus({ commit }, status) {
            commit('SET_OPERATIONAL_STATUS', status);
        },

        clearError({ commit }) {
            commit('SET_ERROR', null);
        },

        setAlert({ commit }, alert) {
            commit('SET_ALERT', {
                id: Date.now(),
                timestamp: new Date(),
                ...alert
            });
        },

        clearAlerts({ commit }) {
            commit('CLEAR_ALERTS');
        }
    }
};
