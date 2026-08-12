import { createApp } from 'vue'
import '../style.css'
// import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
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
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'



if (import.meta.env.MODE === 'development') {

}
// Components
//new VConsole()

const getSystemTheme = () => 
  (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';

const savedTheme = localStorage.getItem('app_theme') || 'system';

const vuetify = createVuetify({
    theme: {
      defaultTheme: savedTheme === 'system' ? getSystemTheme() : savedTheme,
      themes: {
        light: {
          dark: false,
          colors: {
            primary: '#00483C',
            secondary: '#1F6052',
            background: '#F7FAF9',
            surface: '#FFFFFF',
            error: '#BA1A1A',
            info: '#0284C7',
            success: '#16A34A',
            warning: '#D97706'
          }
        },
        dark: {
          dark: true,
          colors: {
            primary: '#94D3C1',
            secondary: '#3F4949',
            background: '#121212',
            surface: '#1E1E1E',
            error: '#FFB4AB',
            info: '#38BDF8',
            success: '#4ADE80',
            warning: '#FBBF24'
          }
        }
      }
    },
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
          mdi
      }
    },
    components: {
        draggable,
    },
    directives,
})


// Listen for live smartphone / OS dark mode toggle events
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const preference = localStorage.getItem('app_theme') || 'system';
    if (preference === 'system') {
      vuetify.theme.global.name.value = e.matches ? 'dark' : 'light';
    }
  });
}

createApp(App)
    .use(router)
    .use(vuetify)
    .mount('#app')
