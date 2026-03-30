<script>
import StorageListComponent from "./components/StorageListComponent.vue";
import axios from "axios";
import {QrcodeStream} from "vue-qrcode-reader";
import {itemService} from "./javascript/api.js";
import BarcodeScannerDialogComponent from "./components/BarcodeScannerDialogComponent.vue";

//TODO add comments, logs, decouple everything
export default {
  components: {
    StorageListComponent,
    BarcodeScannerDialogComponent
  },
  data() {
    return {
      storageList: [],
      showCamera: false,
      fabOpen: false,
      barcodeFound: false,
      barcodeScanned: '',
      loading: false,
      cameraDialogOnAddOpen: false,
      cameraDialogOnDelete: false
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
    }
  },
  async mounted() {
    console.log('Loading storage data');
    this.storageList = await itemService.getAllItems();
  },
}
</script>

<template>
  <v-app>
    <v-app-bar app>

      <template v-slot:prepend>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>
      </template>

      <template v-slot:append>
          <v-avatar color="blue"></v-avatar>
      </template>

      <v-app-bar-title>Storage Solution</v-app-bar-title>
    </v-app-bar>
    <v-main>

      <StorageListComponent :storage-list="storageList"></StorageListComponent>

    </v-main>
    <v-fab
        app
        :color="fabOpen ? '' : 'primary'"
        location="bottom end"
        size="large"
        icon
        style="margin-bottom: 40px;"
    >
      <v-icon>{{ fabOpen ? 'mdi-close' : 'mdi-plus' }}</v-icon>
      <v-speed-dial
          v-model="fabOpen"
          location="top center"
          transition="slide-y-reverse-transition"
          activator="parent"
      >
        <v-btn key="1" color="success" icon @click="cameraDialogOnAddOpen = true; showCamera = true;">
          <v-icon>mdi-barcode-scan</v-icon>
        </v-btn>

        <v-btn key="2" color="error" icon @click="cameraDialogOnDelete = true; showCamera = true;">
          <v-icon>mdi-delete</v-icon>
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
