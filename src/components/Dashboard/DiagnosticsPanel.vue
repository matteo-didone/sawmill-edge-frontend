<template>
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h2 class="card-title flex justify-between items-center">
                System Diagnostics
                <button class="btn btn-sm btn-ghost" @click="refreshDiagnostics">
                    <i class="fas fa-sync-alt"></i>
                    Refresh
                </button>
            </h2>

            <!-- Connection Status Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <!-- OPC UA Status -->
                <div class="stat bg-base-200 rounded-box">
                    <div class="stat-title">OPC UA Connection</div>
                    <div class="stat-value text-lg">
                        <span :class="{
                            'text-success': diagnostics.opcua.connected,
                            'text-error': !diagnostics.opcua.connected
                        }">
                            {{ diagnostics.opcua.connected ? 'Connected' : 'Disconnected' }}
                        </span>
                    </div>
                    <div class="stat-desc">
                        Latency: {{ diagnostics.opcua.latency }}ms
                        <br>
                        Last Sync: {{ formatTime(diagnostics.opcua.lastSync) }}
                    </div>
                </div>

                <!-- MQTT Status -->
                <div class="stat bg-base-200 rounded-box">
                    <div class="stat-title">MQTT Connection</div>
                    <div class="stat-value text-lg">
                        <span :class="{
                            'text-success': diagnostics.mqtt.connected,
                            'text-error': !diagnostics.mqtt.connected
                        }">
                            {{ diagnostics.mqtt.connected ? 'Connected' : 'Disconnected' }}
                        </span>
                    </div>
                    <div class="stat-desc">
                        QoS: {{ diagnostics.mqtt.qos }}
                        <br>
                        Messages/sec: {{ diagnostics.mqtt.messageRate }}
                    </div>
                </div>

                <!-- System Health -->
                <div class="stat bg-base-200 rounded-box">
                    <div class="stat-title">System Health</div>
                    <div class="stat-value text-lg">
                        <span :class="getHealthClass(diagnostics.systemHealth)">
                            {{ getHealthStatus(diagnostics.systemHealth) }}
                        </span>
                    </div>
                    <div class="stat-desc">
                        CPU: {{ diagnostics.cpu }}%
                        <br>
                        Memory: {{ diagnostics.memory }}%
                    </div>
                </div>
            </div>

            <!-- Sensor Status Table -->
            <div class="overflow-x-auto">
                <table class="table w-full">
                    <thead>
                        <tr>
                            <th>Sensor</th>
                            <th>Status</th>
                            <th>Last Reading</th>
                            <th>Health</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="sensor in diagnostics.sensors" :key="sensor.id">
                            <td>
                                <div class="font-bold">{{ sensor.name }}</div>
                                <div class="text-sm opacity-50">{{ sensor.type }}</div>
                            </td>
                            <td>
                                <span class="badge" :class="getSensorStatusClass(sensor.status)">
                                    {{ sensor.status }}
                                </span>
                            </td>
                            <td>
                                <div>{{ formatTime(sensor.lastReading) }}</div>
                                <div class="text-sm opacity-50">{{ sensor.value }} {{ sensor.unit }}</div>
                            </td>
                            <td>
                                <progress class="progress w-20" :class="getHealthClass(sensor.health)"
                                    :value="sensor.health" max="100">
                                </progress>
                            </td>
                            <td>
                                <button class="btn btn-xs btn-ghost" @click="calibrateSensor(sensor.id)"
                                    :disabled="sensor.status === 'calibrating'">
                                    Calibrate
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- System Logs -->
            <div class="mt-4">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="font-bold">System Logs</h3>
                    <div class="flex gap-2">
                        <select v-model="logLevel" class="select select-sm select-bordered">
                            <option value="ALL">All Levels</option>
                            <option value="ERROR">Errors Only</option>
                            <option value="WARN">Warnings & Errors</option>
                            <option value="INFO">Info & Above</option>
                        </select>
                        <button class="btn btn-sm" @click="clearLogs">Clear</button>
                    </div>
                </div>

                <div class="bg-base-300 rounded-box p-4 h-48 overflow-y-auto font-mono text-sm">
                    <div v-for="log in filteredLogs" :key="log.id" :class="{
                        'text-error': log.level === 'ERROR',
                        'text-warning': log.level === 'WARN',
                        'text-info': log.level === 'INFO'
                    }" class="mb-1">
                        [{{ formatTime(log.timestamp) }}] {{ log.level }}: {{ log.message }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import { format } from 'date-fns';

export default defineComponent({
    name: 'DiagnosticsPanel',

    data() {
        return {
            updateInterval: null,
            logLevel: 'ALL',
            diagnostics: {
                opcua: {
                    connected: false,
                    latency: 0,
                    lastSync: null
                },
                mqtt: {
                    connected: false,
                    qos: 0,
                    messageRate: 0
                },
                systemHealth: 100,
                cpu: 0,
                memory: 0,
                sensors: [],
                logs: []
            }
        };
    },

    computed: {
        filteredLogs() {
            if (this.logLevel === 'ALL') return this.diagnostics.logs;

            const levels = {
                'ERROR': ['ERROR'],
                'WARN': ['ERROR', 'WARN'],
                'INFO': ['ERROR', 'WARN', 'INFO']
            };

            return this.diagnostics.logs.filter(log =>
                levels[this.logLevel].includes(log.level)
            );
        }
    },

    methods: {
        formatTime(timestamp) {
            if (!timestamp) return 'N/A';
            return format(new Date(timestamp), 'HH:mm:ss');
        },

        getSensorStatusClass(status) {
            const classes = {
                'online': 'badge-success',
                'offline': 'badge-error',
                'degraded': 'badge-warning',
                'calibrating': 'badge-info'
            };
            return classes[status] || 'badge-ghost';
        },

        getHealthClass(health) {
            if (health >= 80) return 'progress-success';
            if (health >= 50) return 'progress-warning';
            return 'progress-error';
        },

        getHealthStatus(health) {
            if (health >= 80) return 'Healthy';
            if (health >= 50) return 'Degraded';
            return 'Critical';
        },

        async refreshDiagnostics() {
            try {
                const data = await this.$store.dispatch('diagnostics/fetchDiagnostics');
                this.diagnostics = { ...this.diagnostics, ...data };
            } catch (error) {
                console.error('Error refreshing diagnostics:', error);
            }
        },

        async calibrateSensor(sensorId) {
            try {
                await this.$store.dispatch('diagnostics/calibrateSensor', sensorId);
                await this.refreshDiagnostics();
            } catch (error) {
                console.error('Error calibrating sensor:', error);
            }
        },

        startPolling() {
            this.updateInterval = setInterval(this.refreshDiagnostics, 5000);
        },

        clearLogs() {
            this.diagnostics.logs = [];
        }
    },

    mounted() {
        this.refreshDiagnostics();
        this.startPolling();
    },

    beforeUnmount() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
});
</script>
