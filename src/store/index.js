import { createStore } from 'vuex';
import machine from './modules/machine';
import monitoring from './modules/monitoring';
import diagnostics from './modules/diagnostics';
import alerts from './modules/alerts';

// Configurazione di default 
const defaultConfig = {
    apiVersion: '1.0',
    apiBaseUrl: '/api/v1', // Base URL relativa, usa il proxy del dev server
    refreshInterval: 5000,
    mqtt: {
        host: 'localhost',
        port: 1883,
        protocol: 'mqtt'
    },
    opcua: {
        endpoint: 'opc.tcp://localhost:4840',
        securityMode: 'None',
        securityPolicy: 'None'
    }
};

export default createStore({
    state: {
        config: { ...defaultConfig },
        appVersion: '1.0.0',
        isInitialized: false,
        isLoading: false,
        error: null
    },

    getters: {
        getConfig: state => state.config,
        isInitialized: state => state.isInitialized,
        hasError: state => state.error !== null
    },

    mutations: {
        SET_CONFIG(state, config) {
            state.config = {
                ...defaultConfig,
                ...config,
                mqtt: { ...defaultConfig.mqtt, ...config.mqtt },
                opcua: { ...defaultConfig.opcua, ...config.opcua }
            };
        },
        SET_INITIALIZED(state, status) {
            state.isInitialized = status;
        },
        SET_LOADING(state, status) {
            state.isLoading = status;
        },
        SET_ERROR(state, error) {
            state.error = error;
        }
    },

    actions: {
        async loadConfig({ commit }) {
            commit('SET_LOADING', true);
            commit('SET_ERROR', null);

            try {
                // Assicurati di usare un URL relativo per il proxy
                const response = await fetch('/api/config', {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Invalid content type. Expected JSON');
                }

                const config = await response.json();
                commit('SET_CONFIG', config);
                commit('SET_INITIALIZED', true);
                console.log('Configuration loaded successfully:', config);
                return config;
            } catch (error) {
                console.error('Error loading config:', error);
                commit('SET_ERROR', error.message);

                // Usa defaultConfig come fallback
                console.warn('Using default config due to API fetch failure.');
                commit('SET_CONFIG', defaultConfig);
                commit('SET_INITIALIZED', true);
                return defaultConfig;
            } finally {
                commit('SET_LOADING', false);
            }
        },

        async initializeApp({ dispatch }) {
            try {
                await dispatch('loadConfig');

                const initPromises = [
                    dispatch('alerts/fetchAlerts').catch(err => {
                        console.error('Alerts init error:', err);
                        return null;
                    }),
                    dispatch('diagnostics/fetchDiagnostics').catch(err => {
                        console.error('Diagnostics init error:', err);
                        return null;
                    }),
                    dispatch('monitoring/fetchMachineStatus').catch(err => {
                        console.error('Monitoring init error:', err);
                        return null;
                    })
                ];

                const results = await Promise.allSettled(initPromises);

                results.forEach((result, index) => {
                    if (result.status === 'rejected') {
                        console.error(`Module ${index} initialization failed:`, result.reason);
                    } else {
                        console.log(`Module ${index} initialized successfully.`);
                    }
                });

            } catch (error) {
                console.error('Error initializing app:', error);
            }
        }
    },

    modules: {
        machine,
        monitoring,
        diagnostics,
        alerts
    }
});
