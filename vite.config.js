import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from "vite-plugin-vuetify";
import ViteFonts from 'unplugin-fonts/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: 5173,
    },
  plugins: [
      vue(),
      vuetify({autoImport: true}),
      ViteFonts({
          fontsource: {
              families: [
                  {
                      name: 'Roboto',
                      weights: [100, 300, 400, 500, 700, 900],
                      styles: ['normal', 'italic'],
                  },
              ],
          },
      }),
      basicSsl({
          /** name of certification */
          name: 'test',
          /** custom trust domains */
          domains: ['*.custom.com'],
          /** custom certification directory */
          certDir: '/Users/.../.devServer/cert',
      }),
  ],
})
