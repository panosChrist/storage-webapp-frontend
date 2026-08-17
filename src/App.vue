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
      isChecking: false,
      checkResult: null,
      checkResultTimeout: null,
      showCheckResult: false,
      userMenu: false,
      snackbar: {
        show: false,
        text: '',
        color: 'success',
        timeout: 4000
      },
      user: {
        name: 'Alexander Wright',
        email: 'alexander.wright@email.com',
        avatarUrl: ''
      }
    }
  },
  async mounted() {
    try {
      const locations = await itemService.getAllLocations();
      if (locations) {
        this.locationList = locations;
      }
    } catch (e) {
      console.error('Failed to load locations', e);
    }

    try {
      const profile = await itemService.getUserProfile();
      if (profile) {
        this.user.name = profile.fullName || profile.displayEmail || profile.email || 'User';
        this.user.email = profile.displayEmail || profile.email || '';
        if (profile.avatarUrl) {
          this.user.avatarUrl = profile.avatarUrl;
        }
      }
    } catch (e) {
      console.warn('Failed to load user profile on startup', e);
    }
  },
  methods: {
    async onBarcodeAdd(barcode, locationId) {
      // Immediately close the camera scanner dialog
      this.cameraDialogOnAddOpen = false;

      const skeletonId = 'skeleton-' + barcode + '-' + Date.now();
      const skeletonItem = {
        id: skeletonId,
        isSkeleton: true,
        quantity: 1,
        product: {
          barcode: barcode,
          productName: 'Creating product item...',
          brand: ''
        }
      };

      // Dispatch optimistic skeleton item to StorageListComponent
      window.dispatchEvent(new CustomEvent('optimistic-item-add', { detail: skeletonItem }));

      try {
        const targetLocationId = locationId || (this.locationList.length > 0 ? this.locationList[0].id : null);
        const newItem = await itemService.addItemByBarcode(barcode, targetLocationId);
        window.dispatchEvent(new CustomEvent('optimistic-item-complete', { detail: { skeletonId, newItem } }));
      } catch (error) {
        console.error('Scanning error:', error);
        window.dispatchEvent(new CustomEvent('optimistic-item-error', { detail: { skeletonId } }));
      }
    },

    async onBarcodeDelete(barcode, locationId) {
      try {
        const targetLocationId = locationId || (this.locationList.length > 0 ? this.locationList[0].id : null);
        const result = await itemService.reduceItemByBarcode(barcode, targetLocationId);
        if (result && result.success) {
          this.snackbar = {
            show: true,
            text: result.message || 'Item quantity reduced.',
            color: 'success',
            timeout: 4000
          };
        } else if (result && result.otherLocationName) {
          this.snackbar = {
            show: true,
            text: result.message || `Item not found in this location. Found in ${result.otherLocationName} (${result.otherLocationQuantity} left).`,
            color: 'warning',
            timeout: 6000
          };
        } else {
          this.snackbar = {
            show: true,
            text: result?.message || `Item with barcode ${barcode} is not in your storage.`,
            color: 'error',
            timeout: 5000
          };
        }
      } catch (error) {
        console.error('Delete error:', error);
        this.snackbar = {
          show: true,
          text: error.response?.data?.message || 'Failed to process barcode reduction.',
          color: 'error',
          timeout: 5000
        };
      } finally {
        this.cameraDialogOnDelete = false;
      }
    },

    async onBarcodeCheck(barcode) {
      this.isChecking = true;
      this.showCheckResult = true;
      this.checkResult = null;

      if (this.checkResultTimeout) clearTimeout(this.checkResultTimeout);

      try {
        const rawScanned = String(barcode).trim();
        const cleanScannedBarcode = rawScanned.replace(/^0+/, '');

        let allItems = [];
        try {
          allItems = await itemService.getAllItems();
        } catch (e) {
          console.warn('getAllItems failed, falling back to check endpoint', e);
        }

        const matchingItems = (allItems || []).filter(item => {
          const productObj = item.product || item.foodItem || item || {};
          const rawItemBarcode = String(productObj.barcode || item.barcode || '').trim();
          if (!rawItemBarcode) return false;

          const cleanItemBarcode = rawItemBarcode.replace(/^0+/, '');
          return cleanItemBarcode === cleanScannedBarcode || rawItemBarcode === rawScanned;
        });

        if (matchingItems.length > 0) {
          const firstProduct = matchingItems[0].product || matchingItems[0].foodItem || matchingItems[0] || {};
          const totalQuantity = matchingItems.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);

          const locationMap = {};
          matchingItems.forEach(i => {
            const locName = i.location?.name || 'Unassigned Location';
            const qty = Number(i.quantity) || 0;
            locationMap[locName] = (locationMap[locName] || 0) + qty;
          });

          const locations = Object.keys(locationMap).map(name => ({
            locationName: name,
            quantity: locationMap[name]
          }));

          this.checkResult = {
            exists: true,
            productName: firstProduct.productName || 'Scanned Item',
            brand: firstProduct.brand || '',
            totalQuantity: totalQuantity,
            locations: locations
          };
        } else {
          // Fallback to backend check endpoint
          const backendResult = await itemService.checkIfItemExists(barcode);
          if (backendResult && (backendResult.exists || backendResult === true)) {
            this.checkResult = typeof backendResult === 'object' ? backendResult : {
              exists: true,
              productName: 'Scanned Item',
              brand: '',
              totalQuantity: 1,
              locations: []
            };
          } else {
            this.checkResult = {
              exists: false,
              productName: '',
              brand: '',
              totalQuantity: 0,
              locations: []
            };
          }
        }

        this.checkResultTimeout = setTimeout(() => {
          this.showCheckResult = false;
        }, 5000);

      } catch (error) {
        console.error('Check error:', error);
        this.checkResult = {
          exists: false,
          productName: '',
          brand: '',
          totalQuantity: 0,
          locations: []
        };
      } finally {
        this.isChecking = false;
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

      <v-list-item v-for="location in locationList" :key="location.id" class="text-start">
        <template v-slot:prepend>
          <v-icon :icon="icons.mdiMapMarker" color="#00483C" class="mr-1"></v-icon>
        </template>
        <v-list-item-title class="font-weight-medium">
          {{ location.name }}
        </v-list-item-title>
        <template v-slot:append>
          <v-chip size="x-small" color="#00483C" class="text-white font-weight-bold">
            {{ location.items ? location.items.reduce((acc, i) => acc + (i.quantity || 0), 0) : 0 }} items
          </v-chip>
        </template>
      </v-list-item>
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

    <v-dialog v-model="showCheckResult" max-width="420">
      <v-card class="rounded-xl pa-4">
        <!-- Loading State Spinner -->
        <div v-if="isChecking" class="d-flex flex-column align-center justify-center pa-6">
          <v-progress-circular indeterminate color="#00483C" size="48" width="4" class="mb-4"></v-progress-circular>
          <div class="text-subtitle-1 font-weight-bold text-grey-darken-3">Checking Availability...</div>
          <div class="text-caption text-grey-darken-1">Searching storage locations for barcode</div>
        </div>

        <!-- Loaded Result State -->
        <template v-else-if="checkResult">
          <v-card-title class="d-flex align-center font-weight-bold pa-0 mb-3">
            <v-icon
              :icon="checkResult.exists ? icons.mdiCheckBold : icons.mdiClose"
              :color="checkResult.exists ? 'success' : 'error'"
              class="mr-2"
            ></v-icon>
            {{ checkResult.exists ? 'Item Availability' : 'Item Not Found' }}
          </v-card-title>

          <v-card-text class="pa-0 mb-4">
            <template v-if="checkResult.exists">
              <div v-if="checkResult.productName || checkResult.brand" class="text-subtitle-1 font-weight-bold text-start mb-2">
                {{ checkResult.brand ? checkResult.brand + ' - ' : '' }}{{ checkResult.productName }}
              </div>

              <div class="d-flex text-start mb-3">
                <span
                  class="px-3 py-1 rounded-pill font-weight-bold text-white text-caption"
                  style="background-color: #00483C; display: inline-block; white-space: nowrap;"
                >
                  Total Quantity Left: {{ checkResult.totalQuantity }}
                </span>
              </div>

              <template v-if="checkResult.locations && checkResult.locations.length > 0">
                <div class="text-caption font-weight-bold text-grey-darken-1 text-start mb-2">
                  QUANTITY LEFT PER LOCATION:
                </div>
                <div class="bg-grey-lighten-4 rounded-lg pa-2">
                  <div
                    v-for="loc in checkResult.locations"
                    :key="loc.locationName"
                    class="d-flex justify-space-between align-center px-3 py-2 border-b-sm border-grey-lighten-2 text-start"
                  >
                    <div class="d-flex align-center">
                      <v-icon :icon="icons.mdiMapMarker" size="small" class="mr-2" color="#00483C"></v-icon>
                      <span class="font-weight-medium text-body-2 text-grey-darken-3">{{ loc.locationName }}</span>
                    </div>
                    <span
                      class="px-3 py-1 rounded-pill font-weight-bold text-white text-caption ml-2"
                      style="background-color: #00483C; display: inline-block; white-space: nowrap;"
                    >
                      Qty Left: {{ loc.quantity }}
                    </span>
                  </div>
                </div>
              </template>
            </template>

            <template v-else>
              <div class="text-body-1 text-start text-grey-darken-1">
                No items matching this barcode were found in your storage locations.
              </div>
            </template>
          </v-card-text>

          <v-card-actions class="justify-end pa-0">
            <v-btn color="#00483C" variant="flat" rounded="pill" class="text-white px-6" @click="showCheckResult = false">
              Close
            </v-btn>
          </v-card-actions>
        </template>
      </v-card>
    </v-dialog>

    <BarcodeScannerDialogComponent
        v-model="cameraDialogOnAddOpen"
        title="Artikel hinzufügen"
        :locations="locationList"
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
        :locations="locationList"
        @detect="onBarcodeDelete"
    />

    <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="snackbar.timeout"
        location="top"
        rounded="pill"
        elevation="6"
    >
      <div class="d-flex align-center font-weight-medium">
        {{ snackbar.text }}
      </div>
      <template v-slot:actions>
        <v-btn variant="text" size="small" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>

    <v-footer app class="d-flex align-center justify-center" style="height: 40px; min-height: 40px;">Christakis</v-footer>
  </v-app>
</template>

<style scoped>
</style>
