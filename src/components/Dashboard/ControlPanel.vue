<template>
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h2 class="card-title">Machine Control</h2>

            <div class="grid grid-cols-2 gap-4 my-4">
                <button class="btn btn-primary" @click="handleStart"
                    :disabled="!canControl || machineStatus === 'running'">
                    Start Machine
                </button>
                <button class="btn btn-error" @click="handleStop"
                    :disabled="!canControl || machineStatus === 'stopped'">
                    Emergency Stop
                </button>
            </div>

            <div class="form-control">
                <label class="label">
                    <span class="label-text">Cutting Speed</span>
                    <span class="label-text-alt">{{ speedValue }} RPM</span>
                </label>
                <input type="range" min="0" max="100" v-model="speedValue" class="range range-primary"
                    :disabled="!canControl || machineStatus !== 'running'" @change="handleSpeedChange" />
            </div>

            <div class="stats shadow mt-4">
                <div class="stat">
                    <div class="stat-title">Status</div>
                    <div class="stat-value">
                        <span :class="{
                            'text-success': machineStatus === 'running',
                            'text-error': machineStatus === 'stopped',
                            'text-warning': machineStatus === 'idle'
                        }">
                            {{ machineStatus.charAt(0).toUpperCase() + machineStatus.slice(1) }}
                        </span>
                    </div>
                </div>
                <div class="stat">
                    <div class="stat-title">Active Time</div>
                    <div class="stat-value">{{ formattedActiveTime }}</div>
                </div>
            </div>

            <div class="alert alert-error mt-4" v-if="!isConnected">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Connection lost. Reconnecting...</span>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
    name: 'ControlPanel',
    data() {
        return {
            speedValue: 50,
            canControl: true,
            startTime: null
        }
    },
    computed: {
        ...mapState(['machineStatus']),
        ...mapGetters(['isConnected']),
        formattedActiveTime() {
            if (!this.startTime || this.machineStatus !== 'running') return '00:00:00'
            const diff = Date.now() - this.startTime
            const hours = Math.floor(diff / 3600000)
            const minutes = Math.floor((diff % 3600000) / 60000)
            const seconds = Math.floor((diff % 60000) / 1000)
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        }
    },
    methods: {
        ...mapActions(['startMachine', 'stopMachine', 'updateSpeed']),

        async handleStart() {
            try {
                await this.startMachine()
                this.startTime = Date.now()
                this.startTimer()
            } catch (error) {
                console.error('Error starting machine:', error)
            }
        },

        async handleStop() {
            try {
                await this.stopMachine()
                this.stopTimer()
            } catch (error) {
                console.error('Error stopping machine:', error)
            }
        },

        async handleSpeedChange() {
            try {
                await this.updateSpeed(this.speedValue)
            } catch (error) {
                console.error('Error updating speed:', error)
            }
        },

        startTimer() {
            this.timer = setInterval(() => {
                this.$forceUpdate()
            }, 1000)
        },

        stopTimer() {
            if (this.timer) {
                clearInterval(this.timer)
                this.timer = null
            }
            this.startTime = null
        }
    },
    beforeUnmount() {
        this.stopTimer()
    }
}
</script>