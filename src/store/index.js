// store/index.js
import { createStore } from 'vuex';
import machine from './modules/machine';
import monitoring from './modules/monitoring';

export default createStore({
    modules: {
        machine,
        monitoring
    }
});