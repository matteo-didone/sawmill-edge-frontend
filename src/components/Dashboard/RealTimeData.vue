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

                <!-- Velocità di taglio -->
                <div class="stat bg-base-200 rounded-box">
                    <div class="stat-title">Cutting Speed</div>
                    <div class="stat-value text-secondary">
                        {{ formattedData.cuttingSpeed }} m/min
                    </div>
                </div>

                <!-- Consumo Energia -->
                <div class="stat bg-base-200 rounded-box">
                    <div class="stat-title">Power Usage</div>
                    <div class="stat-value text-accent">
                        {{ formattedData.powerUsage }} kW
                    </div>
                </div>

                <!-- Pezzi tagliati -->
                <div class="stat bg-base-200 rounded-box">
                    <div class="stat-title">Cut Pieces</div>
                    <div class="stat-value text-success">
                        {{ sensorData.pieces_count || 0 }}
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

            <!-- Error Alert -->
            <div v-if="error" class="alert alert-error mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{{ error }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import { mapState, mapGetters, mapActions } from 'vuex'

export default defineComponent({
    name: 'RealTimeData',

    data() {
        return {
            error: null,
            sensorData: {},
            updateInterval: null
        }
    },

    computed: {
        ...mapState('monitoring', [
            'isDataStreaming',
            'lastUpdate'
        ]),

        ...mapGetters('monitoring', [
            'formattedData',
            'formattedLastUpdate'
        ])
    },

    methods: {
        ...mapActions('monitoring', [
            'startMonitoring',
            'stopMonitoring'
        ]),

        async fetchMachineStatus() {
            try {
                const response = await this.$store.dispatch('monitoring/fetchMachineStatus');
                this.sensorData = response;
                this.error = null;
            } catch (error) {
                console.error('Error fetching machine status:', error);
                this.error = 'Failed to fetch machine status';
            }
        },

        startPolling() {
            this.updateInterval = setInterval(() => {
                if (this.isDataStreaming) {
                    this.fetchMachineStatus();
                }
            }, 1000); // Poll every second
        },

        stopPolling() {
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
                this.updateInterval = null;
            }
        }
    },

    mounted() {
        this.startMonitoring();
        this.startPolling();
    },

    beforeUnmount() {
        this.stopMonitoring();
        this.stopPolling();
    }
})
</script>