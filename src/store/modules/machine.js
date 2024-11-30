// store/modules/machine.js
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
        SET_ACTIVE_TIME(state, time) {
            state.activeTime = time;
        },
        SET_OPERATIONAL_STATUS(state, status) {
            state.operationalStatus = { ...state.operationalStatus, ...status };
        },
        SET_CURRENT_SPEED(state, speed) {
            state.currentSpeed = speed;
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
            getters.isOperational &&
            state.status === 'idle',
        canStop: (state, getters) =>
            getters.isOperational &&
            state.status === 'running'
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
        async startMachine({ commit }) {
            try {
                await apiService.startMachine();
                commit('SET_MACHINE_STATUS', 'running');
            } catch (error) {
                commit('SET_ERROR', 'Failed to start machine');
                throw error;
            }
        },
        async stopMachine({ commit }) {
            try {
                await apiService.stopMachine();
                commit('SET_MACHINE_STATUS', 'idle');
            } catch (error) {
                commit('SET_ERROR', 'Failed to stop machine');
                throw error;
            }
        },
        async emergencyStop({ commit }) {
            try {
                await apiService.executeCommand('EMERGENCY_STOP');
                commit('SET_MACHINE_STATUS', 'emergency');
            } catch (error) {
                commit('SET_ERROR', 'Failed to execute emergency stop');
                throw error;
            }
        },
        async updateSpeed({ commit }, speed) {
            try {
                await apiService.updateCuttingSpeed(speed);
                commit('SET_CURRENT_SPEED', speed);
            } catch (error) {
                commit('SET_ERROR', 'Failed to update speed');
                throw error;
            }
        },
        async initialize({ commit, dispatch }) {
            try {
                await dispatch('loadConfig');
                commit('SET_CONNECTION_STATUS', true);
            } catch (error) {
                commit('SET_CONNECTION_STATUS', false);
                commit('SET_ERROR', 'Failed to initialize machine');
            }
        }
    }
};