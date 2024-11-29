<template>
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <div class="flex justify-between items-center mb-4">
                <h2 class="card-title">Real-Time Monitoring</h2>
                <span class="text-sm text-gray-500">Last update: {{ formattedLastUpdate }}</span>
            </div>

            <!-- Grid di metriche -->
            <div class="grid grid-cols-2 gap-4">
                <!-- Temperatura -->
                <div class="stat bg-base-200 rounded-box">
                    <div class="stat-title flex items-center gap-2">
                        Temperature
                        <span v-if="isTemperatureCritical" class="badge badge-sm badge-error">Critical</span>
                    </div>
                    <div class="stat-value" :class="{
                        'text-error': isTemperatureCritical,
                        'text-primary': !isTemperatureCritical
                    }">
                        {{ formattedData.temperature }}
                    </div>
                </div>

                <!-- Tensione Lama -->
                <div class="stat bg-base-200 rounded-box">
                    <div class="stat-title flex items-center gap-2">
                        Blade Tension
                        <span v-if="!isBladeTensionSafe" class="badge badge-sm badge-warning">Warning</span>
                    </div>
                    <div class="stat-value text-secondary">
                        {{ formattedData.bladeTension }}
                    </div>
                </div>

                <!-- Vibrazione -->
                <div class="stat bg-base-200 rounded-box">
                    <div class="stat-title flex items-center gap-2">
                        Vibration
                        <span v-if="isVibrationHigh" class="badge badge-sm badge-warning">High</span>
                    </div>
                    <div class="stat-value" :class="{
                        'text-warning': isVibrationHigh,
                        'text-success': !isVibrationHigh
                    }">
                        {{ formattedData.vibration }}
                    </div>
                </div>

                <!-- Consumo Energia -->
                <div class="stat bg-base-200 rounded-box">
                    <div class="stat-title">Power Usage</div>
                    <div class="stat-value text-accent">
                        {{ formattedData.powerUsage }}
                    </div>
                </div>
            </div>

            <!-- Status dello Stream Dati -->
            <div class="mt-4 flex items-center gap-2">
                <div class="badge" :class="isDataStreaming ? 'badge-success' : 'badge-error'">
                    Data Stream: {{ isDataStreaming ? 'Active' : 'Inactive' }}
                </div>
                <button v-if="!isDataStreaming" class="btn btn-sm btn-outline" @click="startMonitoring">
                    Reconnect
                </button>
            </div>

            <!-- Alerts -->
            <div v-if="thresholdAlerts.length" class="alert alert-warning mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{{ thresholdAlerts[0] }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import { mapState, mapGetters, mapActions } from 'vuex'

export default defineComponent({
    name: 'RealTimeData',

    computed: {
        ...mapState('monitoring', [
            'isDataStreaming',
            'thresholdAlerts'
        ]),

        ...mapGetters('monitoring', [
            'formattedData',
            'isTemperatureCritical',
            'isVibrationHigh',
            'isBladeTensionSafe',
            'formattedLastUpdate'
        ])
    },

    methods: {
        ...mapActions('monitoring', [
            'startMonitoring',
            'stopMonitoring'
        ])
    },

    mounted() {
        this.startMonitoring()
    },

    beforeUnmount() {
        this.stopMonitoring()
    }
})
</script>