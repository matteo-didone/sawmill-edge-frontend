import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import store from './store'

// Creazione dell'app
const app = createApp(App)

// Uso dello store
app.use(store)

// Mount dell'app
app.mount('#app')