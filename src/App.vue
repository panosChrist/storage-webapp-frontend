<script>
import StorageListComponent from "./components/StorageListComponent.vue";
import axios from "axios";
import {itemService} from "./javascript/api.js";
import {logout} from "./javascript/authService.js";
import BarcodeScannerDialogComponent from "./components/BarcodeScannerDialogComponent.vue";
import UserProfileMenu from "./components/UserProfileMenu.vue";
import {
  mdiHome,
  mdiClose,
  mdiPlus,
  mdiBarcodeScan,
  mdiDelete,
  mdiMapMarker,
  mdiCheckBold,
  mdiAccount,
  mdiWeatherSunny,
  mdiWeatherNight
} from '@mdi/js';

//TODO add comments, logs, decouple everything
export default {
  components: {
    StorageListComponent,
    BarcodeScannerDialogComponent,
    UserProfileMenu
  },
  data() {
    return {
      icons: {
        mdiHome,
        mdiClose,
        mdiPlus,
        mdiBarcodeScan,
        mdiDelete,
        mdiMapMarker,
        mdiCheckBold,
        mdiAccount,
        mdiWeatherSunny,
        mdiWeatherNight
      },
      showCamera: false,
      fabOpen: false,
      barcodeFound: false,
      barcodeScanned: '',
      loading: false,
      cameraDialogOnAddOpen: false,
      cameraDialogOnDelete: false,
      cameraDialogOnCheck: false,
      drawer: false,
      locationList: [],
      streamController: null,
      itemExists: false,
      showCheckResult: false,
      userMenu: false,
      user: {
        name: 'Alexander Wright',
        email: 'alexander.wright@email.com',
        avatarUrl: ''
      }
    }
  },
  methods: {
    async onBarcodeAdd(barcode) {
      try {
        await itemService.addItemByBarcode(barcode);
        // No need to manually update a list here!
        // The backend will broadcast the updated inventory via SSE,
        // and StorageListComponent will automatically re-render.
      } catch (error) {
        console.error('Scanning error:', error);
      } finally {
        this.cameraDialogOnAddOpen = false;
      }
    },

    async onBarcodeDelete(barcode) {
      try {
        // Use the authenticated service instead of raw axios
        await itemService.reduceItemByBarcode(barcode);

      } catch (error) {
        console.error('Delete error:', error);
      } finally {
        this.cameraDialogOnDelete = false;
      }
    },

    async onBarcodeCheck(barcode) {
      try {
        this.itemExists = await itemService.checkIfItemExists(barcode);
        this.showCheckResult = true;

      } catch (error) {
        console.error('Check error:', error);
      } finally {
        this.cameraDialogOnCheck = false;
      }
    },

    handleMenuOption(optionKey) {
      console.log('User selected option:', optionKey);
      this.userMenu = false;
      if (optionKey === 'profile') {
        this.$router.push('/settings');
      }
    },

    onSignOut() {
      console.log('Signing out user...');
      this.userMenu = false;
      logout();
    },

    toggleTheme() {
      const isDark = this.$vuetify?.theme?.global?.current?.dark;
      const newTheme = isDark ? 'light' : 'dark';
      if (typeof this.$vuetify?.theme?.change === 'function') {
        this.$vuetify.theme.change(newTheme);
      } else if (this.$vuetify?.theme?.global) {
        this.$vuetify.theme.global.name = newTheme;
      }
      localStorage.setItem('app_theme', newTheme);
    }
  },
  computed: {
    isDarkTheme() {
      return this.$vuetify?.theme?.global?.current?.dark || false;
    }
  },
  async mounted() {
    try {
      this.locationList = await itemService.getAllLocations();
    } catch (error) {
      console.error('Failed to load storage data:', error.message);
    }
  },
}
</script>

<template>
  <v-app>
    <v-app-bar app>

      <template v-slot:prepend>
        <v-app-bar-nav-icon @click.stop="drawer =!drawer"></v-app-bar-nav-icon>
      </template>

      <v-app-bar-title>Storage Solution</v-app-bar-title>

      <template v-slot:append>
        <!-- Theme Toggle Button -->
        <v-btn
          icon
          variant="text"
          class="mr-2"
          @click="toggleTheme"
          :title="isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
        >
          <v-icon :icon="isDarkTheme ? icons.mdiWeatherSunny : icons.mdiWeatherNight"></v-icon>
        </v-btn>

        <v-menu
          v-model="userMenu"
          :close-on-content-click="false"
          location="bottom end"
          offset="8"
          transition="scale-transition"
        >
          <template v-slot:activator="{ props }">
            <v-avatar
              color="#0B4636"
              class="cursor-pointer elevation-1 me-3"
              size="40"
              v-bind="props"
            >
              <v-icon color="white" :icon="icons.mdiAccount"></v-icon>
            </v-avatar>
          </template>

          <user-profile-menu
            :user="user"
            @select-option="handleMenuOption"
            @sign-out="onSignOut"
          />
        </v-menu>
      </template>
    </v-app-bar>

    <v-navigation-drawer
        v-model="drawer"
        temporary>
      <v-list-item
          :to="{ name: 'home' }"
          @click="drawer = false"
          :prepend-icon="icons.mdiHome"
          title="Home">
      </v-list-item>

      <v-list-item v-for="location in locationList">{{location.name}}</v-list-item>
      <v-list-item :to="{ name: 'locations' }" @click="drawer = false" :prepend-icon="icons.mdiMapMarker " title="Location"></v-list-item>
      <v-list-item :to="{ name: 'settings' }" @click="drawer = false" title="Settings"></v-list-item>
      <v-list-item>Help</v-list-item>
    </v-navigation-drawer>
    <v-main style="overflow-y: auto;">
      <router-view @sign-out="onSignOut"></router-view>
    </v-main>
    <v-fab
        app
        :color="fabOpen ? '' : 'primary'"
        location="bottom end"
        size="large"
        icon
        style="margin-bottom: 40px;"
    >
      <v-icon :icon="fabOpen ? icons.mdiClose : icons.mdiPlus"></v-icon>
      <v-speed-dial
          v-model="fabOpen"
          location="top center"
          transition="slide-y-reverse-transition"
          activator="parent"
      >
        <v-btn key="1" color="success" icon @click="cameraDialogOnAddOpen = true; showCamera = true;">
          <v-icon :icon="icons.mdiBarcodeScan"></v-icon>
        </v-btn>

        <v-btn key="2" color="error" icon @click="cameraDialogOnDelete = true; showCamera = true;">
          <v-icon :icon="icons.mdiDelete"></v-icon>
        </v-btn>

        <v-btn key="3" color="blue" icon @click="cameraDialogOnCheck = true; showCamera = true;">
          <v-icon :icon="icons.mdiCheckBold"></v-icon>
        </v-btn>

      </v-speed-dial>
    </v-fab>

    <v-dialog v-model="showCheckResult" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Prüfergebnis</v-card-title>
        <v-card-text>
          <div v-if="itemExists" class="d-flex align-center text-success text-subtitle-1">
            <v-icon :icon="icons.mdiCheckBold" color="success" class="mr-2"></v-icon>
            Artikel ist in der Datenbank vorhanden.
          </div>
          <div v-else class="d-flex align-center text-error text-subtitle-1">
            <v-icon :icon="icons.mdiClose" color="error" class="mr-2"></v-icon>
            Artikel wurde nicht gefunden.
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="showCheckResult = false">Schließen</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <BarcodeScannerDialogComponent
        v-model="cameraDialogOnAddOpen"
        title="Artikel hinzufügen"
        @detect="onBarcodeAdd"
    />

    <BarcodeScannerDialogComponent
        v-model="cameraDialogOnCheck"
        title="Artikel ob verfügbar"
        @detect="onBarcodeCheck"
    />

    <BarcodeScannerDialogComponent
        v-model="cameraDialogOnDelete"
        title="Artikel entfernen"
        found-text="Barcode erkannt. Wird von der Lagerliste verringert."
        @detect="onBarcodeDelete"
    />

    <v-footer app class="d-flex align-center justify-center" style="height: 40px; min-height: 40px;">Christakis</v-footer>
  </v-app>
</template>

<style scoped>
</style>
