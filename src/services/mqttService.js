import mqtt from 'mqtt';
import store from '@/store';

class MQTTService {
    constructor() {
        this.client = null;
        this.options = {
            protocol: 'mqtt',
            hostname: process.env.VUE_APP_MQTT_HOST || 'localhost',
            port: process.env.VUE_APP_MQTT_PORT || 1883,
            username: process.env.VUE_APP_MQTT_USERNAME,
            password: process.env.VUE_APP_MQTT_PASSWORD,
            clientId: 'sawmill_frontend_' + Math.random().toString(16).substring(2, 8)
        };
    }

    connect() {
        const url = `${this.options.protocol}://${this.options.hostname}:${this.options.port}`;
        this.client = mqtt.connect(url, this.options);

        this.client.on('connect', () => {
            console.log('Connected to MQTT broker');
            store.commit('machine/SET_CONNECTION_STATUS', true);
            store.dispatch('machine/setAlert', {
                type: 'success',
                message: 'Connected to machine control system'
            });
            this.subscribe();
        });

        this.client.on('error', (error) => {
            console.error('MQTT Error:', error);
            store.commit('machine/SET_CONNECTION_STATUS', false);
            store.dispatch('machine/setAlert', {
                type: 'error',
                message: 'Connection error: ' + error.message
            });
        });

        this.client.on('close', () => {
            store.commit('machine/SET_CONNECTION_STATUS', false);
            store.dispatch('machine/setAlert', {
                type: 'warning',
                message: 'Disconnected from machine control system'
            });
        });

        this.client.on('message', (topic, message) => {
            try {
                const data = JSON.parse(message.toString());
                this.handleMessage(topic, data);
            } catch (error) {
                console.error('Error parsing MQTT message:', error);
            }
        });
    }

    subscribe() {
        const topics = [
            'sawmill/machine/status',
            'sawmill/machine/alerts',
            'sawmill/sensors/#',
            'sawmill/config/update'
        ];

        topics.forEach(topic => {
            this.client.subscribe(topic, (err) => {
                if (err) {
                    console.error('Error subscribing to', topic, err);
                    store.dispatch('machine/setAlert', {
                        type: 'error',
                        message: `Failed to subscribe to ${topic}`
                    });
                }
            });
        });
    }

    handleMessage(topic, data) {
        switch (topic) {
            case 'sawmill/machine/status':
                store.commit('machine/SET_MACHINE_STATUS', data.status);
                break;

            case 'sawmill/machine/alerts':
                if (data.alert) {
                    store.dispatch('machine/setAlert', data.alert);
                }
                break;

            case 'sawmill/config/update':
                store.dispatch('machine/loadConfig');
                break;

            default:
                if (topic.startsWith('sawmill/sensors/')) {
                    const sensor = topic.split('/').pop();
                    store.dispatch('monitoring/updateSensorData', { [sensor]: data.value });
                }
                break;
        }
    }

    publish(topic, message) {
        if (!this.client || !this.client.connected) {
            throw new Error('MQTT client not connected');
        }

        // Assicuriamoci che i messaggi di comando abbiano sempre il campo command
        if (topic.includes('/command') && !message.command) {
            console.error('Invalid command message format');
            return;
        }

        this.client.publish(`sawmill/${topic}`, JSON.stringify(message));
    }

    disconnect() {
        if (this.client) {
            this.client.end();
        }
    }
}

export const mqttService = new MQTTService();