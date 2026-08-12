<!-- src/components/NotificationSettingsComponent.vue -->
<script>
import {
  mdiArrowLeft,
  mdiAlertOutline,
  mdiFileDocumentOutline,
  mdiBellRingOutline,
  mdiCheckBold
} from '@mdi/js';

export default {
  name: 'NotificationSettingsComponent',
  data() {
    return {
      icons: {
        mdiArrowLeft,
        mdiAlertOutline,
        mdiFileDocumentOutline,
        mdiBellRingOutline,
        mdiCheckBold
      },
      settings: {
        lowStockAlerts: true,
        dailySummary: true,
        featureUpdates: false
      },
      savedSuccess: false
    };
  },
  methods: {
    goBack() {
      if (this.$router) {
        this.$router.push('/settings');
      } else {
        this.$emit('navigate', 'settings');
      }
    },
    savePreferences() {
      console.log('Saving notification preferences:', this.settings);
      this.savedSuccess = true;
      setTimeout(() => {
        this.savedSuccess = false;
      }, 3000);
    }
  }
};
</script>

<template>
  <v-container class="pa-4 pa-sm-6 pa-md-8 mx-auto pb-16" style="max-width: 1000px; max-height: calc(100vh - 104px); overflow-y: auto; -webkit-overflow-scrolling: touch;">
    
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

    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-h4 text-md-h3 font-weight-bold text-teal-darken-4 tracking-tight mb-2">
        Notification Settings
      </h1>
      <p class="text-body-1 text-grey-medium-emphasis style-subtitle">
        Manage how and when you receive updates regarding your inventory architecture.
      </p>
    </div>

    <!-- Alert Banner on Save -->
    <v-alert
      v-if="savedSuccess"
      type="success"
      variant="tonal"
      color="#00483C"
      class="mb-6 font-weight-bold"
      rounded="0"
      closable
    >
      Notification preferences saved successfully!
    </v-alert>

    <!-- Notification Setting Cards Stack -->
    <div class="d-flex flex-column gap-4 mb-8">
      
      <!-- Setting 1: Low Stock Alerts -->
      <v-card class="pa-5 pa-sm-6 elevation-1" color="surface" rounded="0">
        <div class="d-flex align-center justify-space-between mb-3">
          <div class="d-flex align-center gap-3">
            <v-avatar color="#CFE6F2" size="40" rounded="0" class="flex-shrink-0">
              <v-icon color="#00483C" size="20" :icon="icons.mdiAlertOutline"></v-icon>
            </v-avatar>
            <div class="text-subtitle-1 font-weight-bold text-grey-darken-4">
              Low Stock Alerts
            </div>
          </div>
          <v-switch
            v-model="settings.lowStockAlerts"
            color="#00483C"
            hide-details
            density="compact"
            class="flex-shrink-0 ms-2"
          ></v-switch>
        </div>
        <p class="text-caption text-grey-medium-emphasis mb-0 leading-relaxed pl-0 pl-sm-13">
          Receive immediate notifications when critical inventory items fall below their designated minimum thresholds. Vital for preventing operational delays.
        </p>
      </v-card>

      <!-- Setting 2: Daily Inventory Summary -->
      <v-card class="pa-5 pa-sm-6 elevation-1" color="surface" rounded="0">
        <div class="d-flex align-center justify-space-between mb-3">
          <div class="d-flex align-center gap-3">
            <v-avatar color="#CFE6F2" size="40" rounded="0" class="flex-shrink-0">
              <v-icon color="#00483C" size="20" :icon="icons.mdiFileDocumentOutline"></v-icon>
            </v-avatar>
            <div class="text-subtitle-1 font-weight-bold text-grey-darken-4">
              Daily Inventory Summary
            </div>
          </div>
          <v-switch
            v-model="settings.dailySummary"
            color="#00483C"
            hide-details
            density="compact"
            class="flex-shrink-0 ms-2"
          ></v-switch>
        </div>
        <p class="text-caption text-grey-medium-emphasis mb-0 leading-relaxed pl-0 pl-sm-13">
          A comprehensive end-of-day report detailing stock movements, acquisitions, and overall structural health of your inventory system.
        </p>
      </v-card>

      <!-- Setting 3: New Feature Updates -->
      <v-card class="pa-5 pa-sm-6 elevation-1" color="surface" rounded="0">
        <div class="d-flex align-center justify-space-between mb-3">
          <div class="d-flex align-center gap-3">
            <v-avatar color="#CFE6F2" size="40" rounded="0" class="flex-shrink-0">
              <v-icon color="#00483C" size="20" :icon="icons.mdiBellRingOutline"></v-icon>
            </v-avatar>
            <div class="text-subtitle-1 font-weight-bold text-grey-darken-4">
              New Feature Updates
            </div>
          </div>
          <v-switch
            v-model="settings.featureUpdates"
            color="#00483C"
            hide-details
            density="compact"
            class="flex-shrink-0 ms-2"
          ></v-switch>
        </div>
        <p class="text-caption text-grey-medium-emphasis mb-0 leading-relaxed pl-0 pl-sm-13">
          Stay informed about new tools, interface enhancements, and systemic upgrades deployed to the Inventory Architect platform.
        </p>
      </v-card>

    </div>

    <!-- Centered Save Button -->
    <div class="d-flex justify-center pt-4 pb-4">
      <v-btn
        type="button"
        color="#00483C"
        variant="flat"
        size="large"
        rounded="0"
        class="text-white font-weight-bold px-10 py-3 text-none elevation-2"
        @click="savePreferences"
      >
        <v-icon start size="20" :icon="icons.mdiCheckBold"></v-icon>
        Save Preferences
      </v-btn>
    </div>

  </v-container>
</template>

<style scoped>
.tracking-wider {
  letter-spacing: 0.8px;
}
.style-subtitle {
  max-width: 600px;
}
</style>
