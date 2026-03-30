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
if (import.meta.env.MODE === 'development') {
    new VConsole()
}
// Components
import App from '../App.vue'

const vuetify = createVuetify({
    components: {
        draggable,
    },
    directives,
})


createApp(App).use(vuetify).mount('#app')
