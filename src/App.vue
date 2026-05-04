<script>
import StorageListComponent from "./components/StorageListComponent.vue";
import axios from "axios";
import {itemService} from "./javascript/api.js";
import BarcodeScannerDialogComponent from "./components/BarcodeScannerDialogComponent.vue";
import { mdiHome, mdiClose, mdiPlus, mdiBarcodeScan, mdiDelete, mdiMapMarker, mdiCheckBold } from '@mdi/js';

//TODO add comments, logs, decouple everything
export default {
  components: {
    StorageListComponent,
    BarcodeScannerDialogComponent
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
        mdiCheckBold
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

      <template v-slot:append>
          <v-avatar color="blue"></v-avatar>
      </template>

      <v-app-bar-title>Storage Solution</v-app-bar-title>
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
      <v-list-item>Settings</v-list-item>
      <v-list-item>Help</v-list-item>
    </v-navigation-drawer>
    <v-main>

      <router-view></router-view>

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
