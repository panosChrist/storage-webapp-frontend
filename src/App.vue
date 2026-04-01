<script>
import StorageListComponent from "./components/StorageListComponent.vue";
import axios from "axios";
import {itemService} from "./javascript/api.js";
import BarcodeScannerDialogComponent from "./components/BarcodeScannerDialogComponent.vue";
import { mdiHome, mdiClose, mdiPlus, mdiBarcodeScan, mdiDelete } from '@mdi/js';

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
        mdiDelete
      },
      showCamera: false,
      fabOpen: false,
      barcodeFound: false,
      barcodeScanned: '',
      loading: false,
      cameraDialogOnAddOpen: false,
      cameraDialogOnDelete: false,
      drawer: false,
      locationList: [],
      streamController: null
    }
  },
  methods: {
    async onBarcodeAdd(barcode) {
      try {
        const response = await axios.get('/api/item/', { params: { barcode } });
        const updatedItem = response.data;
        const index = this.storageList.findIndex(i => i.id === updatedItem.id);

        if (index !== -1) {
          this.storageList[index] = updatedItem;
        } else {
          this.storageList.unshift(updatedItem);
        }
      } catch (error) {
        console.error('Scanning error:', error);
      } finally {
        this.cameraDialogOnAddOpen = false;
      }
    },
    async onBarcodeDelete(barcode) {
      try {
        const response = await axios.get('/api/item/reduce/' + barcode);
        const updatedItem = response.data;

        if (updatedItem) {
          const index = this.storageList.findIndex(i => i.barcode === barcode);
          if (index !== -1) {
            this.storageList[index].quantity = updatedItem.quantity;
          }
        }
      } catch (error) {
        console.error('Delete error:', error);
      } finally {
        this.cameraDialogOnDelete = false;
      }
    },
    async startItemStream() {
      console.log("Starting real-time storage stream")

      this.streamController = await itemService.streamAllItemsAxios(
          (newData) => {
            // Vue's reactivity will automatically update the ItemCards
            // when this array is replaced with the fresh backend data.
            this.storageList = newData;
          },
          (error) => {
            console.error("Stream failed:", error);
            // Optional: Add logic here to reconnect after a few seconds
          }
      );
    }
  },
  async mounted() {
    await this.startItemStream();
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

      <v-list v-for="location in locationList">{{location.name}}</v-list>
      <v-divider></v-divider>
      <v-list>Settings</v-list>
      <v-list>Help</v-list>
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

      </v-speed-dial>
    </v-fab>

    <BarcodeScannerDialogComponent
        v-model="cameraDialogOnAddOpen"
        title="Artikel hinzufügen"
        searching-text="Barcode wird gesucht. Bitte warten"
        found-text="Barcode erkannt. Wird der Lagerliste hinzugefügt."
        @detect="onBarcodeAdd"
    />

    <BarcodeScannerDialogComponent
        v-model="cameraDialogOnDelete"
        title="Artikel entfernen"
        searching-text="Barcode wird gesucht. Bitte warten"
        found-text="Barcode erkannt. Wird von der Lagerliste verringert."
        @detect="onBarcodeDelete"
    />

    <v-footer app class="d-flex align-center justify-center" style="height: 40px; min-height: 40px;">Christakis</v-footer>
  </v-app>
</template>

<style scoped>
</style>
