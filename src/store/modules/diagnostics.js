// store/modules/diagnostics.js
import { apiService } from '@/services/apiService';

export default {
    namespaced: true,

    state: {
        diagnosticData: {
            systemHealth: null, // 'good', 'warning', 'critical'
            lastMaintenance: null,
            nextMaintenance: null,
            components: [], // array di componenti con il loro stato
            maintenanceLogs: [], // storico manutenzioni
            performance: {
                cpuUsage: 0,
                memoryUsage: 0,
                diskSpace: 0,
                networkLatency: 0
            }
        },
        loading: false,
        error: null,
        maintenanceMode: false
    },

    getters: {
        systemStatus: (state) => state.diagnosticData.systemHealth,
        needsMaintenance: (state) => {
            if (!state.diagnosticData.nextMaintenance) return false;
            const now = new Date();
            const maintenance = new Date(state.diagnosticData.nextMaintenance);
            const daysUntilMaintenance = (maintenance - now) / (1000 * 60 * 60 * 24);
            return daysUntilMaintenance <= 7; // avviso se mancano 7 giorni o meno
        },
        criticalComponents: (state) => {
            return state.diagnosticData.components.filter(
                component => component.status === 'critical'
            );
        },
        performanceMetrics: (state) => state.diagnosticData.performance,
        maintenanceLogs: (state) => state.diagnosticData.maintenanceLogs,
        isMaintenanceMode: (state) => state.maintenanceMode
    },

    mutations: {
        SET_DIAGNOSTIC_DATA(state, data) {
            state.diagnosticData = { ...state.diagnosticData, ...data };
        },
        SET_LOADING(state, status) {
            state.loading = status;
        },
        SET_ERROR(state, error) {
            state.error = error;
        },
        SET_SYSTEM_HEALTH(state, health) {
            state.diagnosticData.systemHealth = health;
        },
        SET_MAINTENANCE_MODE(state, status) {
            state.maintenanceMode = status;
        },
        UPDATE_COMPONENT_STATUS(state, { componentId, status }) {
            const component = state.diagnosticData.components.find(c => c.id === componentId);
            if (component) {
                component.status = status;
            }
        },
        ADD_MAINTENANCE_LOG(state, log) {
            state.diagnosticData.maintenanceLogs.unshift(log);
        },
        UPDATE_PERFORMANCE_METRICS(state, metrics) {
            state.diagnosticData.performance = { ...state.diagnosticData.performance, ...metrics };
        }
    },

    actions: {
        async fetchDiagnostics({ commit }) {
            commit('SET_LOADING', true);
            try {
                const response = await apiService.getDiagnostics();
                commit('SET_DIAGNOSTIC_DATA', response);
                commit('SET_ERROR', null);
            } catch (error) {
                commit('SET_ERROR', error.message);
                throw error;
            } finally {
                commit('SET_LOADING', false);
            }
        },

        async updateSystemHealth({ commit }, health) {
            try {
                await apiService.updateSystemHealth(health);
                commit('SET_SYSTEM_HEALTH', health);
            } catch (error) {
                commit('SET_ERROR', error.message);
                throw error;
            }
        },

        async toggleMaintenanceMode({ commit, state }) {
            try {
                const newStatus = !state.maintenanceMode;
                await apiService.setMaintenanceMode(newStatus);
                commit('SET_MAINTENANCE_MODE', newStatus);
            } catch (error) {
                commit('SET_ERROR', error.message);
                throw error;
            }
        },

        async logMaintenance({ commit }, logData) {
            try {
                const response = await apiService.logMaintenance(logData);
                commit('ADD_MAINTENANCE_LOG', {
                    ...logData,
                    timestamp: new Date(),
                    id: response.id
                });
            } catch (error) {
                commit('SET_ERROR', error.message);
                throw error;
            }
        },

        async updateComponentStatus({ commit }, { componentId, status }) {
            try {
                await apiService.updateComponentStatus(componentId, status);
                commit('UPDATE_COMPONENT_STATUS', { componentId, status });
            } catch (error) {
                commit('SET_ERROR', error.message);
                throw error;
            }
        },

        async fetchPerformanceMetrics({ commit }) {
            try {
                const metrics = await apiService.getPerformanceMetrics();
                commit('UPDATE_PERFORMANCE_METRICS', metrics);
            } catch (error) {
                commit('SET_ERROR', error.message);
                throw error;
            }
        }
    }
};