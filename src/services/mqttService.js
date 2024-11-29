import mqtt from 'mqtt';

class MQTTService {
    constructor() {
        if (!MQTTService.instance) {
            this.client = null;
            this.isConnected = false;
            this.subscribers = new Map();
            MQTTService.instance = this;
        }
        return MQTTService.instance;
    }

    connect() {
        this.client = mqtt.connect('mqtt://localhost:1883', {
            reconnectPeriod: 1000,
        });

        this.client.on('connect', () => {
            console.log('Connected to MQTT broker');
            this.isConnected = true;
            this.subscribeToTopics();
        });

        this.client.on('message', (topic, message) => {
            const handlers = this.subscribers.get(topic) || [];
            let data;
            try {
                data = JSON.parse(message.toString());
            } catch (err) {
                console.error(`Error parsing message on topic ${topic}:`, message.toString());
                return;
            }
            handlers.forEach(handler => handler(data));
        });

        this.client.on('offline', () => {
            console.warn('MQTT broker is offline');
            this.isConnected = false;
        });

        this.client.on('error', (error) => {
            console.error('MQTT error:', error);
            this.isConnected = false;
        });

        this.client.on('reconnect', () => {
            console.log('Reconnecting to MQTT broker...');
        });
    }

    subscribeToTopics() {
        const topics = [
            'sawmill/temperature',
            'sawmill/pressure',
            'sawmill/vibration',
            'sawmill/power',
            'sawmill/status',
        ];

        topics.forEach(topic => {
            if (this.subscribers.has(topic)) {
                console.log(`Already subscribed to ${topic}`);
                return;
            }

            this.client.subscribe(topic, (err) => {
                if (err) {
                    console.error(`Error subscribing to ${topic}:`, err);
                } else {
                    console.log(`Subscribed to ${topic}`);
                }
            });
        });
    }

    addSubscriber(topic, handler) {
        if (!this.subscribers.has(topic)) {
            this.subscribers.set(topic, []);
        }
        this.subscribers.get(topic).push(handler);
    }

    removeSubscriber(topic, handler) {
        if (this.subscribers.has(topic)) {
            const handlers = this.subscribers.get(topic);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    unsubscribeFromTopic(topic) {
        if (this.subscribers.has(topic)) {
            this.client.unsubscribe(topic, (err) => {
                if (err) {
                    console.error(`Error unsubscribing from ${topic}:`, err);
                } else {
                    console.log(`Unsubscribed from ${topic}`);
                    this.subscribers.delete(topic);
                }
            });
        }
    }

    disconnect() {
        if (this.client) {
            this.client.end();
            this.isConnected = false;
        }
    }
}

export const mqttService = new MQTTService();
