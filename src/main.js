import { createApp } from 'vue'
import './style.css'
import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import HelloWorld from "./components/HelloWorld.vue";
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'unfonts.css'
import draggable from 'vuedraggable'

// Components
import App from './App.vue'

const vuetify = createVuetify({
    components: {
        HelloWorld,
        draggable,
    },
    directives,
})


createApp(App).use(vuetify).mount('#app')
