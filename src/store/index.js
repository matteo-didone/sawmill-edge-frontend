// src/store/index.js
import { createStore } from 'vuex'
import { apiService } from '@/services/apiService'
import { mqttService } from '@/services/mqttService'

export default createStore({
    state: {
        machineData: {
            temperature: 0,
            pressure: 0,
            vibration: 0,
            powerUsage: 0
        },
        machineStatus: 'idle',
        connectionStatus: false,
        config: null,
        warnings: []
    },

    mutations: {
        SET_MACHINE_DATA(state, data) {
            state.machineData = { ...state.machineData, ...data }
        },
        SET_MACHINE_STATUS(state, status) {
            state.machineStatus = status
        },
        SET_CONNECTION_STATUS(state, status) {
            state.connectionStatus = status
        },
        SET_CONFIG(state, config) {
            state.config = config
        },
        ADD_WARNING(state, warning) {
            state.warnings.push(warning)
        },
        CLEAR_WARNINGS(state) {
            state.warnings = []
        }
    },

    actions: {
        async initializeApp({ dispatch }) {
            await dispatch('connectMQTT')
            await dispatch('loadConfig')
        },

        connectMQTT({ commit }) {
            mqttService.connect()
            commit('SET_CONNECTION_STATUS', true)
        },

        async loadConfig({ commit }) {
            try {
                const config = await apiService.getConfig()
                commit('SET_CONFIG', config)
            } catch (error) {
                console.error('Error loading config:', error)
            }
        },

        async saveConfig({ commit }, config) {
            try {
                const updatedConfig = await apiService.updateConfig(config)
                commit('SET_CONFIG', updatedConfig)
                return true
            } catch (error) {
                console.error('Error saving config:', error)
                return false
            }
        },

        async startMachine({ commit }) {
            try {
                await apiService.startMachine()
                commit('SET_MACHINE_STATUS', 'running')
            } catch (error) {
                console.error('Error starting machine:', error)
            }
        },

        async stopMachine({ commit }) {
            try {
                await apiService.stopMachine()
                commit('SET_MACHINE_STATUS', 'stopped')
            } catch (error) {
                console.error('Error stopping machine:', error)
            }
        },

        async updateSpeed(_, speed) {
            try {
                await apiService.updateSpeed(speed)
            } catch (error) {
                console.error('Error updating speed:', error)
            }
        }
    },

    getters: {
        isConnected: state => state.connectionStatus,
        currentConfig: state => state.config,
        machineStatus: state => state.machineStatus,
        currentWarnings: state => state.warnings
    }
})