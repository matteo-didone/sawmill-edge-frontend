<template>
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h2 class="card-title flex justify-between">
                Real-Time Monitoring
                <span class="text-sm font-normal">Last update: {{ lastUpdate }}</span>
            </h2>

            <div class="grid grid-cols-2 gap-4">
                <div class="stat bg-base-200 rounded-box">
                    <div class="stat-title">Temperature</div>
                    <div class="stat-value" :class="{
                        'text-error': machineData.temperature > currentConfig?.safetySettings?.maxTemp,
                        'text-primary': machineData.temperature <= currentConfig?.safetySettings?.maxTemp
                    }">
                        {{ machineData.temperature.toFixed(1) }}°C
                    </div>
                </div>

                <div class="stat bg-base-200 rounded-box">
                    <div class="stat-title">Pressure</div>
                    <div class="stat-value text-secondary">
                        {{ machineData.pressure.toFixed(1) }} Bar
                    </div>
                </div>

                <div class="stat bg-base-200 rounded-box">
                    <div class="stat-title">Vibration</div>
                    <div class="stat-value" :class="{
                        'text-warning': machineData.vibration > 80,
                        'text-success': machineData.vibration <= 80
                    }">
                        {{ machineData.vibration.toFixed(1) }} Hz
                    </div>
                </div>

                <div class="stat bg-base-200 rounded-box">
                    <div class="stat-title">Power Usage</div>
                    <div class="stat-value text-accent">
                        {{ machineData.powerUsage.toFixed(1) }} kW
                    </div>
                </div>
            </div>

            <div class="alert alert-warning mt-4" v-if="currentWarnings.length > 0">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{{ currentWarnings[0] }}</span>
            </div>

            <div class="mt-4">
                <div class="flex items-center gap-2">
                    <span class="text-sm">Data Stream:</span>
                    <span class="badge" :class="isConnected ? 'badge-success' : 'badge-error'">
                        {{ isConnected ? 'Active' : 'Disconnected' }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { mqttService } from '@/services/mqttService'

export default {
    name: 'RealTimeData',
    data() {
        return {
            lastUpdate: 'Never'
        }
    },
    computed: {
        ...mapState(['machineData']),
        ...mapGetters(['isConnected', 'currentWarnings', 'currentConfig'])
    },
    methods: {
        updateLastUpdate() {
            this.lastUpdate = new Date().toLocaleTimeString()
        },

        setupMQTTSubscriptions() {
            // Subscribe to machine data topics
            mqttService.addSubscriber('sawmill/temperature', (data) => {
                this.$store.commit('SET_MACHINE_DATA', { temperature: data })
                this.updateLastUpdate()
            })

            mqttService.addSubscriber('sawmill/pressure', (data) => {
                this.$store.commit('SET_MACHINE_DATA', { pressure: data })
                this.updateLastUpdate()
            })

            mqttService.addSubscriber('sawmill/vibration', (data) => {
                this.$store.commit('SET_MACHINE_DATA', { vibration: data })
                this.updateLastUpdate()
            })

            mqttService.addSubscriber('sawmill/power', (data) => {
                this.$store.commit('SET_MACHINE_DATA', { powerUsage: data })
                this.updateLastUpdate()
            })
        }
    },
    mounted() {
        this.setupMQTTSubscriptions()
    },
    beforeUnmount() {
        // Cleanup MQTT subscriptions
        mqttService.removeSubscriber('sawmill/temperature')
        mqttService.removeSubscriber('sawmill/pressure')
        mqttService.removeSubscriber('sawmill/vibration')
        mqttService.removeSubscriber('sawmill/power')
    }
}
</script>