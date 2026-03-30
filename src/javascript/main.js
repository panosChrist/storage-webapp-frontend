import { createApp } from 'vue'
import '../style.css'
import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'unfonts.css'
import draggable from 'vuedraggable'
import VConsole from 'vconsole';
import App from '../App.vue'
import router from "./router.js";



/*if (import.meta.env.MODE === 'development') {
    new VConsole()
}*/
// Components


const vuetify = createVuetify({
    components: {
        draggable,
    },
    directives,
})


createApp(App)
    .use(router)
    .use(vuetify)
    .mount('#app')
