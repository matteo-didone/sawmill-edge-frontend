// store/modules/alerts.js
import { apiService } from '@/services/apiService';

export default {
    namespaced: true,
    state: {
        alerts: [], // Array di avvisi attivi
    },
    mutations: {
        SET_ALERTS(state, alerts) {
            state.alerts = alerts;
        },
        ADD_ALERT(state, alert) {
            state.alerts.push({
                id: Date.now(),
                timestamp: new Date(),
                ...alert,
            });
        },
        REMOVE_ALERT(state, alertId) {
            state.alerts = state.alerts.filter((alert) => alert.id !== alertId);
        },
        CLEAR_ALERTS(state) {
            state.alerts = [];
        },
    },
    getters: {
        hasCritical: state => state.alerts.some(alert => alert.severity === 'critical'),
        filteredAlerts: (state) => ({ severity, timeRange }) => {
            let alerts = state.alerts;
            if (severity && severity !== 'all') {
                alerts = alerts.filter(alert => alert.severity === severity);
            }
            if (timeRange && timeRange !== 'all') {
                const now = Date.now();
                const ranges = {
                    '1h': 60 * 60 * 1000,
                    '24h': 24 * 60 * 60 * 1000,
                    '7d': 7 * 24 * 60 * 60 * 1000
                };
                const cutoff = now - (ranges[timeRange] || 0);
                alerts = alerts.filter(alert => new Date(alert.timestamp).getTime() >= cutoff);
            }
            return alerts;
        }
    },
    actions: {
        async fetchAlerts({ commit }) {
            try {
                const alarms = await apiService.getAlarms();
                commit('SET_ALERTS', alarms.map(alarm => ({
                    id: alarm.code,
                    timestamp: new Date(alarm.timestamp),
                    message: alarm.message,
                    severity: alarm.severity
                })));
            } catch (error) {
                console.error('Error fetching alerts:', error);
            }
        },
        async acknowledgeAlarm({ commit }, alertId) {
            try {
                await apiService.acknowledgeAlarm(alertId);
                commit('REMOVE_ALERT', alertId);
            } catch (error) {
                console.error('Error acknowledging alarm:', error);
            }
        },
        addAlert({ commit }, alert) {
            commit('ADD_ALERT', alert);
        },
        removeAlert({ commit }, alertId) {
            commit('REMOVE_ALERT', alertId);
        },
        clearAlerts({ commit }) {
            commit('CLEAR_ALERTS');
        },
    },
};