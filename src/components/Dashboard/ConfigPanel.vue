<template>
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h2 class="card-title">Machine Configuration</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <!-- Cutting Parameters -->
                <div class="form-control">
                    <h3 class="text-lg font-semibold mb-4">Cutting Parameters</h3>

                    <label class="label">
                        <span class="label-text">Blade Speed (RPM)</span>
                    </label>
                    <input type="number" v-model="config.bladeSpeed" class="input input-bordered w-full"
                        placeholder="Enter blade speed" />

                    <label class="label mt-2">
                        <span class="label-text">Feed Rate (mm/min)</span>
                    </label>
                    <input type="number" v-model="config.feedRate" class="input input-bordered w-full"
                        placeholder="Enter feed rate" />

                    <label class="label mt-2">
                        <span class="label-text">Cut Depth (mm)</span>
                    </label>
                    <input type="number" v-model="config.cutDepth" class="input input-bordered w-full"
                        placeholder="Enter cut depth" />
                </div>

                <!-- Safety Settings -->
                <div class="form-control">
                    <h3 class="text-lg font-semibold mb-4">Safety Settings</h3>

                    <label class="label cursor-pointer">
                        <span class="label-text">Emergency Stop on High Temperature</span>
                        <input type="checkbox" v-model="config.safetySettings.tempStop" class="toggle toggle-error" />
                    </label>

                    <label class="label mt-2">
                        <span class="label-text">Max Temperature (°C)</span>
                    </label>
                    <input type="number" v-model="config.safetySettings.maxTemp" class="input input-bordered w-full"
                        placeholder="Enter max temperature" />

                    <label class="label cursor-pointer mt-2">
                        <span class="label-text">Vibration Alert</span>
                        <input type="checkbox" v-model="config.safetySettings.vibrationAlert"
                            class="toggle toggle-warning" />
                    </label>
                </div>

                <!-- Maintenance Schedule -->
                <div class="form-control">
                    <h3 class="text-lg font-semibold mb-4">Maintenance Schedule</h3>

                    <label class="label">
                        <span class="label-text">Blade Change Interval (hours)</span>
                    </label>
                    <input type="number" v-model="config.maintenance.bladeInterval" class="input input-bordered w-full"
                        placeholder="Enter interval" />

                    <label class="label mt-2">
                        <span class="label-text">Next Maintenance Date</span>
                    </label>
                    <input type="date" v-model="config.maintenance.nextDate" class="input input-bordered w-full" />
                </div>

                <!-- Notifications -->
                <div class="form-control">
                    <h3 class="text-lg font-semibold mb-4">Notifications</h3>

                    <label class="label cursor-pointer">
                        <span class="label-text">Email Alerts</span>
                        <input type="checkbox" v-model="config.notifications.email" class="toggle toggle-primary" />
                    </label>

                    <label class="label cursor-pointer mt-2">
                        <span class="label-text">SMS Alerts</span>
                        <input type="checkbox" v-model="config.notifications.sms" class="toggle toggle-primary" />
                    </label>

                    <label class="label mt-2">
                        <span class="label-text">Alert Email Address</span>
                    </label>
                    <input type="email" v-model="config.notifications.emailAddress" class="input input-bordered w-full"
                        placeholder="Enter email" />
                </div>
            </div>

            <div class="flex justify-end gap-2 mt-6">
                <button class="btn btn-ghost" @click="resetConfig">Reset</button>
                <button class="btn btn-primary" @click="saveConfig">Save Changes</button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
    name: 'ConfigPanel',
    computed: {
        ...mapGetters(['currentConfig'])
    },
    data() {
        return {
            config: {
                bladeSpeed: 1000,
                feedRate: 500,
                cutDepth: 100,
                safetySettings: {
                    tempStop: true,
                    maxTemp: 80,
                    vibrationAlert: true
                },
                maintenance: {
                    bladeInterval: 168,
                    nextDate: new Date().toISOString().split('T')[0]
                },
                notifications: {
                    email: true,
                    sms: false,
                    emailAddress: ''
                }
            }
        }
    },
    methods: {
        ...mapActions(['saveConfig', 'loadConfig']),

        async handleSaveConfig() {
            try {
                const success = await this.saveConfig(this.config)
                if (success) {
                    // Mostra notifica di successo
                    console.log('Configuration saved successfully')
                }
            } catch (error) {
                console.error('Error saving configuration:', error)
                // Mostra notifica di errore
            }
        },

        async resetConfig() {
            await this.loadConfig()
            this.config = { ...this.currentConfig }
        }
    },
    async created() {
        if (this.currentConfig) {
            this.config = { ...this.currentConfig }
        } else {
            await this.loadConfig()
        }
    }
}
</script>