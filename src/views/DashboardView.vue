<template>
    <div class="min-h-screen bg-base-200 p-4">
        <div class="navbar bg-base-100 rounded-box shadow mb-4">
            <div class="flex-1">
                <h1 class="text-2xl font-bold px-4">Sawmill Control Dashboard</h1>
            </div>
            <div class="flex-none">
                <div class="badge badge-success gap-2" v-if="connectionStatus">
                    Connected
                </div>
                <div class="badge badge-error gap-2" v-else>
                    Disconnected
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="col-span-1">
                <ControlPanel />
            </div>
            <div class="col-span-1">
                <RealTimeData />
            </div>
            <div class="col-span-1 lg:col-span-2">
                <ConfigPanel />
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import ControlPanel from '@/components/Dashboard/ControlPanel.vue'
import RealTimeData from '@/components/Dashboard/RealTimeData.vue'
import ConfigPanel from '@/components/Dashboard/ConfigPanel.vue'

export default {
    name: 'DashboardView',
    components: {
        ControlPanel,
        RealTimeData,
        ConfigPanel
    },
    computed: {
        ...mapState(['connectionStatus'])
    }
}
</script>