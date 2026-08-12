<!-- src/components/ThemeSelectionComponent.vue -->
<script>
import {
  mdiCheck,
  mdiWeatherSunny,
  mdiWeatherNight,
  mdiAutoFix,
  mdiArrowLeft
} from '@mdi/js';

export default {
  name: 'ThemeSelectionComponent',
  data() {
    return {
      icons: {
        mdiCheck,
        mdiWeatherSunny,
        mdiWeatherNight,
        mdiAutoFix,
        mdiArrowLeft
      },
      selectedTheme: localStorage.getItem('app_theme') || 'system'
    };
  },
  computed: {
    activeThemeMode() {
      return this.selectedTheme.toLowerCase();
    }
  },
  methods: {
    selectTheme(mode) {
      this.selectedTheme = mode;
      localStorage.setItem('app_theme', mode);

      let vuetifyTheme = mode;
      if (mode === 'system') {
        vuetifyTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      if (typeof this.$vuetify?.theme?.change === 'function') {
        this.$vuetify.theme.change(vuetifyTheme);
      } else if (this.$vuetify?.theme?.global) {
        this.$vuetify.theme.global.name = vuetifyTheme;
      }
    },
    goBack() {
      if (this.$router) {
        this.$router.push('/settings');
      } else {
        this.$emit('navigate', 'settings');
      }
    }
  }
};
</script>

<template>
  <v-container class="pa-4 pa-sm-6 pa-md-8 mx-auto pb-12" style="max-width: 1000px; max-height: calc(100vh - 104px); overflow-y: auto; -webkit-overflow-scrolling: touch;">
    
    <!-- Top Back Navigation -->
    <div class="d-flex align-center mb-6">
      <v-btn
        icon
        variant="text"
        density="comfortable"
        color="#00483C"
        class="mr-2"
        @click="goBack"
        title="Back to Settings"
      >
        <v-icon :icon="icons.mdiArrowLeft"></v-icon>
      </v-btn>
      <span class="text-caption font-weight-bold text-teal-darken-4 text-uppercase tracking-wider">
        Settings / Preferences
      </span>
    </div>

    <!-- Header Title & Subtitle -->
    <div class="mb-8">
      <h1 class="text-h4 text-md-h3 font-weight-bold text-grey-darken-4 tracking-tight mb-2">
        Theme Selection
      </h1>
      <p class="text-body-1 text-grey-medium-emphasis">
        Customize the appearance of Inventory Architect across your devices.
      </p>
    </div>

    <!-- Theme Cards Grid (3 Columns on Desktop / 1 Column on Mobile) -->
    <v-row class="gy-6" align="stretch">
      
      <!-- Option 1: Light Theme -->
      <v-col cols="12" md="4" class="d-flex flex-column">
        <v-card
          class="pa-5 fill-height d-flex flex-column justify-space-between cursor-pointer theme-card"
          :class="{ 'card-active': activeThemeMode === 'light' }"
          color="surface"
          elevation="1"
          rounded="0"
          @click="selectTheme('light')"
        >
          <!-- Active Floating Checkmark Badge -->
          <div v-if="activeThemeMode === 'light'" class="active-badge">
            <v-icon size="16" color="white" :icon="icons.mdiCheck"></v-icon>
          </div>

          <div>
            <!-- Visual Mockup Box: Light -->
            <div class="w-100 aspect-preview bg-grey-lighten-3 mb-4 pa-3 d-flex flex-column gap-2 overflow-hidden position-relative" style="border: 1px solid rgba(0,0,0,0.08);">
              <!-- Top Bar -->
              <div class="w-100 bg-white shadow-sm pa-2 d-flex align-center justify-space-between">
                <div class="w-25 bg-teal-darken-4 pa-1"></div>
                <div class="w-10 bg-grey-lighten-1 pa-1 rounded-circle"></div>
              </div>
              <!-- Main Content Split -->
              <div class="d-flex gap-2 flex-grow-1">
                <div class="w-33 bg-grey-lighten-2 h-100"></div>
                <div class="w-66 bg-white h-100 pa-2 d-flex flex-column gap-1">
                  <div class="w-75 bg-grey-lighten-2 pa-1"></div>
                  <div class="w-50 bg-grey-lighten-3 pa-1"></div>
                </div>
              </div>
            </div>

            <!-- Card Info -->
            <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-1">
              Light
            </h3>
            <p class="text-caption text-grey-medium-emphasis mb-0">
              Clean and bright for well-lit environments.
            </p>
          </div>

          <!-- Radio Indicator -->
          <div class="d-flex align-center justify-space-between mt-4 pt-3 border-top-subtle">
            <span class="text-caption font-weight-bold text-grey-darken-2">Light Mode</span>
            <div class="radio-circle" :class="{ 'radio-selected': activeThemeMode === 'light' }">
              <div v-if="activeThemeMode === 'light'" class="radio-dot"></div>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- Option 2: Dark Theme -->
      <v-col cols="12" md="4" class="d-flex flex-column">
        <v-card
          class="pa-5 fill-height d-flex flex-column justify-space-between cursor-pointer theme-card"
          :class="{ 'card-active': activeThemeMode === 'dark' }"
          color="surface"
          elevation="1"
          rounded="0"
          @click="selectTheme('dark')"
        >
          <!-- Active Floating Checkmark Badge -->
          <div v-if="activeThemeMode === 'dark'" class="active-badge">
            <v-icon size="16" color="white" :icon="icons.mdiCheck"></v-icon>
          </div>

          <div>
            <!-- Visual Mockup Box: Dark -->
            <div class="w-100 aspect-preview bg-grey-darken-4 mb-4 pa-3 d-flex flex-column gap-2 overflow-hidden position-relative" style="border: 1px solid rgba(255,255,255,0.08);">
              <!-- Top Bar -->
              <div class="w-100 bg-grey-darken-3 shadow-sm pa-2 d-flex align-center justify-space-between">
                <div class="w-25 bg-teal-lighten-2 pa-1"></div>
                <div class="w-10 bg-grey-darken-1 pa-1 rounded-circle"></div>
              </div>
              <!-- Main Content Split -->
              <div class="d-flex gap-2 flex-grow-1">
                <div class="w-33 bg-grey-darken-3 h-100"></div>
                <div class="w-66 bg-grey-darken-3 h-100 pa-2 d-flex flex-column gap-1">
                  <div class="w-75 bg-grey-darken-2 pa-1"></div>
                  <div class="w-50 bg-grey-darken-2 pa-1"></div>
                </div>
              </div>
            </div>

            <!-- Card Info -->
            <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-1">
              Dark
            </h3>
            <p class="text-caption text-grey-medium-emphasis mb-0">
              Reduces eye strain in low-light conditions.
            </p>
          </div>

          <!-- Radio Indicator -->
          <div class="d-flex align-center justify-space-between mt-4 pt-3 border-top-subtle">
            <span class="text-caption font-weight-bold text-grey-darken-2">Dark Mode</span>
            <div class="radio-circle" :class="{ 'radio-selected': activeThemeMode === 'dark' }">
              <div v-if="activeThemeMode === 'dark'" class="radio-dot"></div>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- Option 3: System Default -->
      <v-col cols="12" md="4" class="d-flex flex-column">
        <v-card
          class="pa-5 fill-height d-flex flex-column justify-space-between cursor-pointer theme-card"
          :class="{ 'card-active': activeThemeMode === 'system' }"
          color="surface"
          elevation="1"
          rounded="0"
          @click="selectTheme('system')"
        >
          <!-- Active Floating Checkmark Badge -->
          <div v-if="activeThemeMode === 'system'" class="active-badge">
            <v-icon size="16" color="white" :icon="icons.mdiCheck"></v-icon>
          </div>

          <div>
            <!-- Visual Mockup Box: Split System Preview -->
            <div class="w-100 aspect-preview d-flex mb-4 overflow-hidden position-relative" style="border: 1px solid rgba(0,0,0,0.08);">
              <!-- Left Half: Light Preview -->
              <div class="w-50 bg-grey-lighten-3 pa-2 d-flex flex-column gap-2 border-right">
                <div class="w-100 bg-white pa-1"></div>
                <div class="w-100 bg-grey-lighten-1 flex-grow-1"></div>
              </div>
              <!-- Right Half: Dark Preview -->
              <div class="w-50 bg-grey-darken-4 pa-2 d-flex flex-column gap-2">
                <div class="w-100 bg-grey-darken-3 pa-1"></div>
                <div class="w-100 bg-grey-darken-2 flex-grow-1"></div>
              </div>
            </div>

            <!-- Card Info -->
            <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-1">
              System Default
            </h3>
            <p class="text-caption text-grey-medium-emphasis mb-0">
              Automatically matches your OS settings.
            </p>
          </div>

          <!-- Radio Indicator -->
          <div class="d-flex align-center justify-space-between mt-4 pt-3 border-top-subtle">
            <span class="text-caption font-weight-bold text-teal-darken-4">Automatic Sync</span>
            <div class="radio-circle" :class="{ 'radio-selected': activeThemeMode === 'system' }">
              <div v-if="activeThemeMode === 'system'" class="radio-dot"></div>
            </div>
          </div>
        </v-card>
      </v-col>

    </v-row>

  </v-container>
</template>

<style scoped>
.aspect-preview {
  height: 140px;
}
.theme-card {
  position: relative;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  border: 2px solid transparent !important;
}
.theme-card:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 72, 60, 0.3) !important;
}
.card-active {
  border-color: #00483C !important;
  box-shadow: 0 4px 14px rgba(0, 72, 60, 0.15) !important;
}
.active-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 28px;
  height: 28px;
  background-color: #00483C;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.radio-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #bec8c9;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}
.radio-selected {
  border-color: #00483C;
  background-color: #00483C;
}
.radio-dot {
  width: 6px;
  height: 6px;
  background-color: white;
  border-radius: 50%;
}
.border-top-subtle {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
.border-right {
  border-right: 1px solid rgba(0, 0, 0, 0.08);
}
.tracking-wider {
  letter-spacing: 0.8px;
}
</style>
