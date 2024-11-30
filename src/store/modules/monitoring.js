// store/modules/monitoring.js
import { apiService } from '@/services/apiService';

export default {
    namespaced: true,
    state: {
        isDataStreaming: false,
        data: {
            cutting_speed: 0,
            power_consumption: 0,
            pieces_count: 0
        },
        historicalData: [],
        lastUpdate: null,
        error: null
    },
    mutations: {
        SET_DATA_STREAMING(state, status) {
            state.isDataStreaming = status;
        },
        SET_SENSOR_DATA(state, data) {
            state.data = { ...state.data, ...data };
            state.lastUpdate = new Date();
        },
        SET_HISTORICAL_DATA(state, data) {
            state.historicalData = data;
        },
        SET_ERROR(state, error) {
            state.error = error;
        }
    },
    getters: {
        formattedData: state => ({
            cuttingSpeed: state.data.cutting_speed ? state.data.cutting_speed.toFixed(1) : '0.0',
            powerUsage: state.data.power_consumption ? state.data.power_consumption.toFixed(1) : '0.0',
            piecesCount: state.data.pieces_count || 0
        }),
        formattedLastUpdate: state => {
            if (!state.lastUpdate) return 'No data';
            return new Intl.DateTimeFormat('default', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }).format(state.lastUpdate);
        },
        getHistoricalData: state => state.historicalData
    },
    actions: {
        async startMonitoring({ commit }) {
            commit('SET_DATA_STREAMING', true);
        },
        stopMonitoring({ commit }) {
            commit('SET_DATA_STREAMING', false);
        },
        async fetchMachineStatus({ commit }) {
            try {
                const response = await apiService.getMachineStatus();
                commit('SET_SENSOR_DATA', response);
                commit('SET_ERROR', null);
                return response;
            } catch (error) {
                commit('SET_ERROR', error.message);
                commit('SET_DATA_STREAMING', false);
                throw error;
            }
        },
        async getHistoricalData({ commit }) {
            try {
                const response = await apiService.getMetrics();
                commit('SET_HISTORICAL_DATA', response);
                return response;
            } catch (error) {
                commit('SET_ERROR', error.message);
                throw error;
            }
        }
    }
};