<template>
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h2 class="card-title">Performance Metrics</h2>

            <!-- Chart Type Selector -->
            <div class="tabs tabs-boxed mb-4">
                <button v-for="metric in availableMetrics" :key="metric.id" class="tab"
                    :class="{ 'tab-active': selectedMetric === metric.id }" @click="selectedMetric = metric.id">
                    {{ metric.label }}
                </button>
            </div>

            <!-- Time Range Selector -->
            <div class="flex gap-2 mb-4">
                <select v-model="timeRange" class="select select-bordered w-full max-w-xs">
                    <option value="1h">Last Hour</option>
                    <option value="6h">Last 6 Hours</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                </select>
            </div>

            <!-- Chart Area -->
            <div class="w-full h-80">
                <apexchart type="line" :options="chartOptions" :series="chartSeries"></apexchart>
            </div>

            <!-- Statistics Summary -->
            <div class="stats shadow mt-4">
                <div class="stat">
                    <div class="stat-title">Average</div>
                    <div class="stat-value text-primary">{{ currentStats.average }}</div>
                </div>

                <div class="stat">
                    <div class="stat-title">Maximum</div>
                    <div class="stat-value text-secondary">{{ currentStats.max }}</div>
                </div>

                <div class="stat">
                    <div class="stat-title">Minimum</div>
                    <div class="stat-value text-accent">{{ currentStats.min }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

export default defineComponent({
    name: 'TimeSeriesCharts',
    components: {
        apexchart: VueApexCharts
    },
    data() {
        return {
            selectedMetric: 'temperature',
            timeRange: '1h',
            availableMetrics: [
                { id: 'temperature', label: 'Temperature', unit: '°C', color: '#ff4444' },
                { id: 'power', label: 'Power Usage', unit: 'kW', color: '#44ff44' },
                { id: 'speed', label: 'Cutting Speed', unit: 'RPM', color: '#4444ff' },
                { id: 'vibration', label: 'Vibration', unit: 'Hz', color: '#ffff44' }
            ],
            metricsData: {} // Historical data for all metrics
        }
    },
    computed: {
        chartOptions() {
            const metric = this.availableMetrics.find(m => m.id === this.selectedMetric)
            return {
                chart: {
                    type: 'line',
                    animations: {
                        enabled: true,
                        easing: 'linear',
                        dynamicAnimation: {
                            speed: 1000
                        }
                    },
                    toolbar: {
                        show: true
                    },
                    zoom: {
                        enabled: true
                    }
                },
                stroke: {
                    curve: 'smooth',
                    width: 2
                },
                xaxis: {
                    type: 'datetime'
                },
                yaxis: {
                    title: {
                        text: `${metric.label} (${metric.unit})`
                    }
                },
                tooltip: {
                    x: {
                        format: 'dd MMM yyyy HH:mm:ss'
                    }
                }
            }
        },
        chartSeries() {
            const metricData = this.metricsData[this.selectedMetric] || [];
            return [
                {
                    name: this.selectedMetric,
                    data: metricData
                }
            ]
        },
        currentStats() {
            const data = (this.metricsData[this.selectedMetric] || []).map(point => point[1]);
            if (!data.length) {
                return { average: '0', max: '0', min: '0' };
            }
            return {
                average: (data.reduce((sum, value) => sum + value, 0) / data.length).toFixed(2),
                max: Math.max(...data).toFixed(2),
                min: Math.min(...data).toFixed(2),
            };
        }
    },
    methods: {
        async fetchMetricsData() {
            try {
                const response = await this.$store.dispatch('monitoring/getHistoricalData', {
                    metric: this.selectedMetric,
                    timeRange: this.timeRange
                });
                // Ensure response is an array
                this.metricsData[this.selectedMetric] = Array.isArray(response) ? response : [];
            } catch (error) {
                console.error('Error fetching metrics data:', error);
                this.metricsData[this.selectedMetric] = []; // Fallback to empty data on error
            }
        }
    },
    watch: {
        selectedMetric: 'fetchMetricsData',
        timeRange: 'fetchMetricsData'
    },
    mounted() {
        this.fetchMetricsData();
    }
});
</script>
