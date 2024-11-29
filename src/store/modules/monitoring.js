// store/modules/monitoring.js
export default {
    namespaced: true,
    state: {
        data: {
            temperature: 0,
            bladeTension: 0,
            vibration: 0,
            powerUsage: 0
        },
        isDataStreaming: false,
        lastUpdate: null,
        thresholdAlerts: [],
        thresholds: {
            temperature: { critical: 85, warning: 75 },
            bladeTension: { min: 1200, max: 1800 },
            vibration: { warning: 0.75 },
            powerUsage: { warning: 90 }
        }
    },

    mutations: {
        SET_SENSOR_DATA(state, data) {
            state.data = { ...state.data, ...data };
            state.lastUpdate = new Date();
        },
        SET_DATA_STREAMING(state, status) {
            state.isDataStreaming = status;
        },
        ADD_THRESHOLD_ALERT(state, alert) {
            if (!state.thresholdAlerts.includes(alert)) {
                state.thresholdAlerts.push(alert);
            }
        },
        CLEAR_THRESHOLD_ALERTS(state) {
            state.thresholdAlerts = [];
        }
    },

    getters: {
        formattedData: (state) => ({
            temperature: `${state.data.temperature.toFixed(1)}°C`,
            bladeTension: `${state.data.bladeTension.toFixed(0)} kPa`,
            vibration: `${state.data.vibration.toFixed(2)} g`,
            powerUsage: `${state.data.powerUsage.toFixed(1)} kW`
        }),

        isTemperatureCritical: (state) =>
            state.data.temperature >= state.thresholds.temperature.critical,

        isVibrationHigh: (state) =>
            state.data.vibration >= state.thresholds.vibration.warning,

        isBladeTensionSafe: (state) =>
            state.data.bladeTension >= state.thresholds.bladeTension.min &&
            state.data.bladeTension <= state.thresholds.bladeTension.max,

        formattedLastUpdate: (state) => {
            if (!state.lastUpdate) return 'No data';
            return new Intl.DateTimeFormat('default', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }).format(state.lastUpdate);
        }
    },

    actions: {
        startMonitoring({ commit, dispatch }) {
            commit('SET_DATA_STREAMING', true);
            dispatch('simulateDataStream');
        },

        stopMonitoring({ commit }) {
            commit('SET_DATA_STREAMING', false);
        },

        updateSensorData({ commit, state }, data) {
            commit('SET_SENSOR_DATA', data);

            // Check thresholds and set alerts
            if (data.temperature >= state.thresholds.temperature.critical) {
                commit('ADD_THRESHOLD_ALERT', 'Critical temperature detected!');
            }

            if (!state.isBladeTensionSafe) {
                commit('ADD_THRESHOLD_ALERT', 'Blade tension out of safe range');
            }

            if (data.vibration >= state.thresholds.vibration.warning) {
                commit('ADD_THRESHOLD_ALERT', 'High vibration detected');
            }
        },

        simulateDataStream({ dispatch, state }) {
            if (!state.isDataStreaming) return;

            const randomData = {
                temperature: 70 + Math.random() * 20,
                bladeTension: 1500 + Math.random() * 400 - 200,
                vibration: Math.random(),
                powerUsage: 50 + Math.random() * 50
            };

            dispatch('updateSensorData', randomData);

            setTimeout(() => {
                dispatch('simulateDataStream');
            }, 1000);
        }
    }
};