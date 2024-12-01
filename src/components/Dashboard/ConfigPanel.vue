<template>
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h2 class="card-title">Machine Configuration</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <!-- Connection Settings -->
                <div class="form-control">
                    <h3 class="text-lg font-semibold mb-4">Connection Settings</h3>

                    <label class="label">
                        <span class="label-text">OPC UA Server URL</span>
                    </label>
                    <input type="text" v-model="config.opcua_server_url" class="input input-bordered w-full"
                        placeholder="opc.tcp://localhost:4840" />

                    <label class="label mt-2">
                        <span class="label-text">MQTT Broker Host</span>
                    </label>
                    <input type="text" v-model="config.mqtt_broker_host" class="input input-bordered w-full"
                        placeholder="localhost" />

                    <label class="label mt-2">
                        <span class="label-text">MQTT Broker Port</span>
                    </label>
                    <input type="number" v-model.number="config.mqtt_broker_port" class="input input-bordered w-full"
                        placeholder="1883" />

                    <label class="label mt-2">
                        <span class="label-text">API Host</span>
                    </label>
                    <input type="text" v-model="config.api_host" class="input input-bordered w-full"
                        placeholder="localhost" />

                    <label class="label mt-2">
                        <span class="label-text">API Port</span>
                    </label>
                    <input type="number" v-model.number="config.api_port" class="input input-bordered w-full"
                        placeholder="8000" />

                    <label class="label mt-2">
                        <span class="label-text">Monitoring Interval (ms)</span>
                    </label>
                    <input type="number" v-model.number="config.monitoring_interval" class="input input-bordered w-full"
                        min="100" max="60000" placeholder="1000" />


                    <label class="label mt-2">
                        <span class="label-text">Command Timeout (ms)</span>
                    </label>

                    <input type="number" v-model.number="config.command_timeout" class="input input-bordered w-full"
                        min="1000" max="30000" placeholder="5000" />
                </div>

                <!-- Cutting Parameters -->
                <div class="form-control">
                    <h3 class="text-lg font-semibold mb-4">Cutting Parameters</h3>

                    <label class="label">
                        <span class="label-text">Blade Speed (RPM)</span>
                    </label>
                    <input type="number" v-model.number="config.bladeSpeed" class="input input-bordered w-full"
                        placeholder="Enter blade speed" />

                    <label class="label mt-2">
                        <span class="label-text">Feed Rate (mm/min)</span>
                    </label>
                    <input type="number" v-model.number="config.feedRate" class="input input-bordered w-full"
                        placeholder="Enter feed rate" />

                    <label class="label mt-2">
                        <span class="label-text">Cut Depth (mm)</span>
                    </label>
                    <input type="number" v-model.number="config.cutDepth" class="input input-bordered w-full"
                        placeholder="Enter cut depth" />
                </div>

                <!-- Safety Settings -->
                <div class="form-control" v-if="config.safetySettings">
                    <h3 class="text-lg font-semibold mb-4">Safety Settings</h3>

                    <label class="label cursor-pointer">
                        <span class="label-text">Emergency Stop on High Temperature</span>
                        <input type="checkbox" v-model="config.safetySettings.tempStop" class="toggle toggle-error" />
                    </label>

                    <label class="label mt-2">
                        <span class="label-text">Max Temperature (°C)</span>
                    </label>
                    <input type="number" v-model.number="config.safetySettings.maxTemp"
                        class="input input-bordered w-full" placeholder="Enter max temperature"
                        :disabled="!config.safetySettings.tempStop" />

                    <label class="label cursor-pointer mt-2">
                        <span class="label-text">Vibration Alert</span>
                        <input type="checkbox" v-model="config.safetySettings.vibrationAlert"
                            class="toggle toggle-warning" />
                    </label>

                    <label class="label mt-2">
                        <span class="label-text">Max Tension (kPa)</span>
                    </label>
                    <input type="number" v-model.number="config.safetySettings.maxTension"
                        class="input input-bordered w-full" placeholder="Enter max blade tension" />

                    <label class="label cursor-pointer mt-2">
                        <span class="label-text">Emergency Stop Enabled</span>
                        <input type="checkbox" v-model="config.safetySettings.emergencyStopEnabled"
                            class="toggle toggle-error" />
                    </label>

                    <label class="label mt-2">
                        <span class="label-text">Safety Check Interval (ms)</span>
                    </label>
                    <input type="number" v-model.number="config.safetySettings.safetyCheckInterval"
                        class="input input-bordered w-full" placeholder="Enter safety check interval" />
                </div>

                <!-- Maintenance Schedule -->
                <div class="form-control" v-if="config.maintenance">
                    <h3 class="text-lg font-semibold mb-4">Maintenance Schedule</h3>

                    <label class="label">
                        <span class="label-text">Blade Change Interval (hours)</span>
                    </label>
                    <input type="number" v-model.number="config.maintenance.bladeInterval"
                        class="input input-bordered w-full" placeholder="Enter interval" />

                    <label class="label mt-2">
                        <span class="label-text">Next Maintenance Date</span>
                    </label>
                    <input type="date" v-model="config.maintenance.nextDate" class="input input-bordered w-full" />

                    <label class="label mt-2">
                        <span class="label-text">Last Maintenance Date</span>
                    </label>
                    <input type="date" v-model="config.maintenance.lastMaintenanceDate"
                        class="input input-bordered w-full" />
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end gap-2 mt-6">
                <button class="btn btn-ghost" @click="resetConfig" :disabled="saving">
                    Reset
                </button>
                <button class="btn btn-primary" @click="handleSaveConfig" :disabled="saving">
                    <span class="loading loading-spinner" v-if="saving"></span>
                    Save Changes
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import { mapActions, mapGetters } from 'vuex';
import { apiService } from '@/services/apiService';

export default defineComponent({
    name: 'ConfigPanel',

    data() {
        return {
            saving: false,
            config: {
                // Connection settings
                opcua_server_url: 'opc.tcp://localhost:4840/freeopcua/server/',
                mqtt_broker_host: 'localhost',
                mqtt_broker_port: 1883,
                api_host: '0.0.0.0',
                api_port: 8000,
                monitoring_interval: 1000,  // Minimo 100
                command_timeout: 5000,      // Minimo 1000

                // Machine settings
                id: "machine-001",
                version: '1.0',
                status: 'active',
                bladeSpeed: 1000,
                feedRate: 500,
                cutDepth: 100,

                safetySettings: {
                    tempStop: true,
                    maxTemp: 80,
                    vibrationAlert: true,
                    maxTension: 45000,
                    emergencyStopEnabled: true,
                    safetyCheckInterval: 1000
                },

                maintenance: {
                    bladeInterval: 168,
                    nextDate: new Date().toISOString().split('T')[0],
                    lastMaintenanceDate: null,
                    maintenanceHistory: []
                }
            }
        };
    },

    computed: {
        ...mapGetters('machine', ['currentConfig'])
    },

    methods: {
        ...mapActions('machine', ['saveConfig', 'setAlert']),

        resetConfig() {
            if (this.currentConfig) {
                this.config = { ...this.currentConfig };
            }
        },

        async handleSaveConfig() {
            this.saving = true;
            try {
                const configData = this.prepareConfigData();
                console.log('Sending config data:', configData); // Aggiungi questo log
                await this.saveConfig(configData);
                this.setAlert({
                    type: 'success',
                    message: 'Configuration saved successfully'
                });
            } catch (error) {
                this.setAlert({
                    type: 'error',
                    message: error.message || 'Error saving configuration'
                });
                console.error('Save config error:', error);
            } finally {
                this.saving = false;
            }
        },

        prepareConfigData() {
            return {
                // Connection Settings
                opcua_server_url: this.config.opcua_server_url,
                mqtt_broker_host: this.config.mqtt_broker_host,
                mqtt_broker_port: Number(this.config.mqtt_broker_port),
                api_host: this.config.api_host,
                api_port: Number(this.config.api_port),
                monitoring_interval: Math.max(100, Number(this.config.monitoring_interval)), // minimo 100
                command_timeout: Math.max(1000, Number(this.config.command_timeout)),      // minimo 1000

                // Machine Identification
                id: this.config.id,
                version: this.config.version,
                status: this.config.status,

                // Machine Parameters
                bladeSpeed: Number(this.config.bladeSpeed),
                feedRate: Number(this.config.feedRate),
                cutDepth: Number(this.config.cutDepth),

                // Metadata
                createdAt: this.config.createdAt,
                updatedAt: new Date().toISOString(),

                // Nested Settings
                safetySettings: {
                    tempStop: Boolean(this.config.safetySettings.tempStop),
                    maxTemp: Number(this.config.safetySettings.maxTemp),
                    vibrationAlert: Boolean(this.config.safetySettings.vibrationAlert),
                    maxTension: Number(this.config.safetySettings.maxTension),
                    emergencyStopEnabled: Boolean(this.config.safetySettings.emergencyStopEnabled),
                    safetyCheckInterval: Number(this.config.safetySettings.safetyCheckInterval)
                },
                maintenance: {
                    bladeInterval: Number(this.config.maintenance.bladeInterval),
                    nextDate: this.config.maintenance.nextDate,
                    lastMaintenanceDate: this.config.maintenance.lastMaintenanceDate,
                    maintenanceHistory: this.config.maintenance.maintenanceHistory || []
                }
            };
        },

        validateConfig() {
            const requiredFields = [
                'opcua_server_url',
                'mqtt_broker_host',
                'mqtt_broker_port',
                'api_host',
                'api_port',
                'monitoring_interval',
                'command_timeout',
                'bladeSpeed',
                'feedRate',
                'cutDepth',
                'safetySettings.maxTemp',
                'safetySettings.maxTension',
                'maintenance.bladeInterval',
                'maintenance.nextDate'
            ];

            const missingFields = requiredFields.filter(field => {
                const value = field.split('.').reduce((obj, key) => obj?.[key], this.config);
                return value === undefined || value === null || value === '';
            });

            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            // Validate connection settings
            const monitoringInterval = Number(this.config.monitoring_interval);
            if (isNaN(monitoringInterval) || monitoringInterval < 100 || monitoringInterval > 60000) {
                throw new Error('Monitoring interval must be between 100ms and 60000ms');
            }

            const commandTimeout = Number(this.config.command_timeout);
            if (isNaN(commandTimeout) || commandTimeout < 1000 || commandTimeout > 30000) {
                throw new Error('Command timeout must be between 1000ms and 30000ms');
            }

            const mqttPort = Number(this.config.mqtt_broker_port);
            if (isNaN(mqttPort) || mqttPort < 1 || mqttPort > 65535) {
                throw new Error('MQTT broker port must be between 1 and 65535');
            }

            const apiPort = Number(this.config.api_port);
            if (isNaN(apiPort) || apiPort < 1 || apiPort > 65535) {
                throw new Error('API port must be between 1 and 65535');
            }

            // Validate machine settings
            const bladeSpeed = Number(this.config.bladeSpeed);
            if (isNaN(bladeSpeed) || bladeSpeed < 0 || bladeSpeed > 5000) {
                throw new Error('Blade speed must be between 0 and 5000 RPM');
            }

            const feedRate = Number(this.config.feedRate);
            if (isNaN(feedRate) || feedRate < 0 || feedRate > 2000) {
                throw new Error('Feed rate must be between 0 and 2000 mm/min');
            }

            const cutDepth = Number(this.config.cutDepth);
            if (isNaN(cutDepth) || cutDepth < 0 || cutDepth > 500) {
                throw new Error('Cut depth must be between 0 and 500 mm');
            }

            const maxTemp = Number(this.config.safetySettings.maxTemp);
            if (isNaN(maxTemp) || maxTemp < 0 || maxTemp > 200) {
                throw new Error('Maximum temperature must be between 0 and 200°C');
            }
        },

        async fetchCurrentConfig() {
            try {
                const currentConfig = await apiService.getConfig();
                if (currentConfig) {
                    this.config = {
                        ...this.config,
                        ...currentConfig,
                        safetySettings: {
                            ...this.config.safetySettings,
                            ...currentConfig.safetySettings
                        },
                        maintenance: {
                            ...this.config.maintenance,
                            ...currentConfig.maintenance
                        }
                    };
                }
            } catch (error) {
                this.setAlert({
                    type: 'error',
                    message: 'Error loading current configuration'
                });
                console.error('Fetch config error:', error);
            }
        }
    },

    async created() {
        await this.fetchCurrentConfig();
    },

    watch: {
        currentConfig: {
            handler(newConfig) {
                if (newConfig) {
                    this.config = { ...this.config, ...newConfig };
                }
            },
            deep: true
        }
    }
});
</script>