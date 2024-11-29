<template>
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h2 class="card-title">Machine Control</h2>

            <!-- Main Controls -->
            <div class="grid grid-cols-2 gap-4 my-4">
                <button class="btn btn-primary btn-lg" :disabled="!canStart" @click="startMachine">
                    Start Machine
                </button>
                <button class="btn btn-error btn-lg" :disabled="!canStop" @click="emergencyStop">
                    Emergency Stop
                </button>
            </div>

            <!-- Speed Control -->
            <div class="form-control mt-4">
                <label class="label">
                    <span class="label-text">Cutting Speed</span>
                    <span class="label-text-alt">{{ cuttingSpeed }} RPM</span>
                </label>
                <input type="range" min="0" max="100" v-model="cuttingSpeed" class="range range-primary"
                    :disabled="machineStatus !== 'running'" @change="handleSpeedChange" />
                <div class="w-full flex justify-between text-xs px-2">
                    <span>0</span>
                    <span>25</span>
                    <span>50</span>
                    <span>75</span>
                    <span>100</span>
                </div>
            </div>

            <!-- Status Display -->
            <div class="stats shadow mt-6">
                <div class="stat">
                    <div class="stat-title">Machine Status</div>
                    <div class="stat-value text-lg">
                        <span :class="{
                            'text-success': machineStatus === 'running',
                            'text-error': machineStatus === 'emergency',
                            'text-warning': machineStatus === 'idle'
                        }">
                            {{ machineStatus.charAt(0).toUpperCase() + machineStatus.slice(1) }}
                        </span>
                    </div>
                </div>

                <div class="stat">
                    <div class="stat-title">Active Time</div>
                    <div class="stat-value text-lg">{{ activeTime }}</div>
                </div>
            </div>

            <!-- Connection Alert -->
            <div v-if="!isOperational" class="alert alert-error mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{{ alertMessage || 'Machine not operational' }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import { mapState, mapGetters, mapActions } from 'vuex'

export default defineComponent({
    name: 'ControlPanel',

    data() {
        return {
            cuttingSpeed: 0
        }
    },

    computed: {
        ...mapState({
            machineStatus: state => state.machine.status,
            activeTime: state => state.machine.activeTime,
            alertMessage: state => state.machine.alertMessage
        }),

        ...mapGetters('machine', [
            'isOperational',
            'canStart',
            'canStop'
        ])
    },

    methods: {
        ...mapActions('machine', [
            'startMachine',
            'stopMachine',
            'emergencyStop',
            'updateSpeed',
            'loadConfig'
        ]),

        handleSpeedChange() {
            this.updateSpeed(this.cuttingSpeed)
        }
    },

    watch: {
        'machineStatus'(newStatus) {
            if (newStatus === 'idle') {
                this.cuttingSpeed = 0
            }
        }
    }
})
</script>