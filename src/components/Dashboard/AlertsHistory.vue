<template>
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <!-- Header with Alert Count -->
            <h2 class="card-title flex justify-between items-center">
                System Alerts
                <div v-if="activeAlerts" class="badge badge-primary">
                    {{ activeAlerts.length }} Active
                </div>
                <div v-else class="badge badge-primary">0 Active</div>
            </h2>

            <!-- Filters -->
            <div class="flex gap-2 mb-4">
                <select v-model="severityFilter" class="select select-bordered w-full max-w-xs">
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                </select>

                <select v-model="timeFilter" class="select select-bordered w-full max-w-xs">
                    <option value="1h">Last Hour</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="all">All Time</option>
                </select>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="text-center py-4">
                <div class="loading loading-spinner loading-lg"></div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <h3 class="font-bold">Error</h3>
                    <div class="text-sm">{{ error }}</div>
                </div>
            </div>

            <!-- Alerts List -->
            <div v-else class="overflow-y-auto max-h-96">
                <div v-for="alert in filteredAlerts" :key="alert.id" class="alert mb-2" :class="{
                    'alert-error': alert.severity === 'critical',
                    'alert-warning': alert.severity === 'warning',
                    'alert-info': alert.severity === 'info'
                }">
                    <div>
                        <h3 class="font-bold">{{ alert.title }}</h3>
                        <div class="text-sm">{{ alert.message }}</div>
                        <div class="text-xs opacity-70">
                            {{ formatTimestamp(alert.timestamp) }}
                        </div>
                    </div>
                    <button v-if="!alert.acknowledged" class="btn btn-sm" @click="acknowledgeAlert(alert.id)"
                        :disabled="isAcknowledging[alert.id]">
                        {{ isAcknowledging[alert.id] ? 'Processing...' : 'Acknowledge' }}
                    </button>
                </div>

                <!-- No Alerts Message -->
                <div v-if="filteredAlerts.length === 0" class="text-center py-4 text-gray-500">
                    No alerts match the current filters
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import { formatDistanceToNow } from 'date-fns';

export default defineComponent({
    name: 'AlertsHistory',

    data() {
        return {
            severityFilter: 'all',
            timeFilter: '24h',
            updateInterval: null,
            loading: false,
            error: null,
            isAcknowledging: {}
        };
    },

    computed: {
        activeAlerts() {
            try {
                return this.$store.getters['alerts/activeAlerts'] || [];
            } catch (error) {
                console.error('Error accessing activeAlerts getter:', error);
                return [];
            }
        },

        filteredAlerts() {
            try {
                return this.$store.getters['alerts/filteredAlerts']({
                    severity: this.severityFilter,
                    timeRange: this.timeFilter
                }) || [];
            } catch (error) {
                console.error('Error accessing filteredAlerts getter:', error);
                return [];
            }
        }
    },

    methods: {
        formatTimestamp(timestamp) {
            try {
                return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
            } catch (error) {
                console.error('Error formatting timestamp:', error);
                return 'Invalid date';
            }
        },

        async acknowledgeAlert(alertId) {
            if (this.isAcknowledging[alertId]) return;

            this.isAcknowledging = {
                ...this.isAcknowledging,
                [alertId]: true
            };

            try {
                await this.$store.dispatch('alerts/acknowledgeAlert', alertId);
            } catch (error) {
                console.error('Error acknowledging alert:', error);
                this.$emit('error', 'Failed to acknowledge alert. Please try again.');
            } finally {
                this.isAcknowledging = {
                    ...this.isAcknowledging,
                    [alertId]: false
                };
            }
        },

        async fetchAlerts() {
            this.loading = true;
            this.error = null;

            try {
                await this.$store.dispatch('alerts/fetchAlerts');
            } catch (error) {
                console.error('Error fetching alerts:', error);
                this.error = 'Failed to load alerts. Please try again.';
            } finally {
                this.loading = false;
            }
        },

        startPolling() {
            this.updateInterval = setInterval(async () => {
                if (!this.loading) {
                    await this.fetchAlerts();
                }
            }, 10000); // Poll every 10 seconds
        },

        stopPolling() {
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
                this.updateInterval = null;
            }
        }
    },

    async mounted() {
        await this.fetchAlerts();
        this.startPolling();
    },

    beforeUnmount() {
        this.stopPolling();
    },

    watch: {
        // Refetch alerts when filters change
        severityFilter() {
            this.fetchAlerts();
        },
        timeFilter() {
            this.fetchAlerts();
        }
    }
});
</script>