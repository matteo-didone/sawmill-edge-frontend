<template>
    <div class="min-h-screen bg-base-200 p-4">
        <!-- Navbar -->
        <div class="navbar bg-base-100 rounded-box shadow mb-4">
            <div class="flex-1">
                <h1 class="text-2xl font-bold px-4">Sawmill Control Dashboard</h1>
            </div>
            <div class="flex-none">
                <div class="badge" :class="connectionStatus ? 'badge-success' : 'badge-error'"
                    v-text="connectionStatus ? 'Connected' : 'Disconnected'"></div>
            </div>
        </div>

        <!-- Main Grid Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- Control and Real-time Data Section -->
            <div class="col-span-1">
                <ControlPanel />
            </div>
            <div class="col-span-1">
                <RealTimeData />
            </div>

            <!-- Diagnostics and Alerts Section -->
            <div class="col-span-1">
                <DiagnosticsPanel />
            </div>
            <div class="col-span-1">
                <AlertsHistory />
            </div>

            <!-- Time Series Charts Section -->
            <div class="col-span-1 lg:col-span-2">
                <TimeSeriesCharts />
            </div>

            <!-- Configuration Section -->
            <div class="col-span-1 lg:col-span-2">
                <ConfigPanel />
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import ControlPanel from '@/components/Dashboard/ControlPanel.vue';
import RealTimeData from '@/components/Dashboard/RealTimeData.vue';
import ConfigPanel from '@/components/Dashboard/ConfigPanel.vue';
import DiagnosticsPanel from '@/components/Dashboard/DiagnosticsPanel.vue';
import AlertsHistory from '@/components/Dashboard/AlertsHistory.vue';
import TimeSeriesCharts from '@/components/Dashboard/TimeSeriesCharts.vue';

export default defineComponent({
    name: 'DashboardView',
    components: {
        ControlPanel,
        RealTimeData,
        ConfigPanel,
        DiagnosticsPanel,
        AlertsHistory,
        TimeSeriesCharts,
    },
    computed: {
        ...mapState({
            connectionStatus: (state) => state.machine.connected,
        }),
    },
});
</script>