<!-- src/components/BarcodeScannerDialogComponent.vue -->
<script>
import { QrcodeStream } from 'vue-qrcode-reader';
import { mdiFlashlight, mdiFlashlightOff, mdiCameraSwitch } from "@mdi/js";

export default {
  name: 'BarcodeScannerDialogComponent',
  components: {
    QrcodeStream
  },
  props: {
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: 'Barcode' },
    searchingText: { type: String, default: 'Barcode wird gesucht. Bitte warten' },
    foundText: { type: String, default: 'Barcode erkannt! Produkt wird geladen...' }
  },
  emits: ['update:modelValue', 'detect'],
  data() {
    return {
      icons: {
        mdiFlashlight,
        mdiFlashlightOff,
        mdiCameraSwitch
      },
      loading: false,
      barcodeFound: false,
      barcodeScanned: '',
      torchActive: false,
      // Target the rear camera explicitly
      facingMode: 'environment', // 'environment' = back, 'user' = front
      barcodeFormats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128']
    }
  },
  computed: {
    isOpen: {
      get() { return this.modelValue; },
      set(value) { this.$emit('update:modelValue', value); }
    },
    // Dynamically reactive constraints object for vue-qrcode-reader
    selectedConstraints() {
      return {
        facingMode: this.facingMode
      };
    }
  },
  watch: {
    modelValue(newVal) {
      if (!newVal) this.resetState();
    }
  },
  methods: {
    toggleCamera() {
      this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
    },
    paintOutline(detectedCodes, ctx) {
      for (const code of detectedCodes) {
        const { boundingBox } = code;
        if (boundingBox) {
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#4CAF50';
          ctx.strokeRect(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height);
        }
      }
    },
    onDetect(detectedCodes) {
      if (this.loading) return;

      if (detectedCodes.length > 0) {
        const barcode = detectedCodes[0].rawValue;
        this.loading = true;
        this.barcodeFound = true;
        this.barcodeScanned = barcode;
        this.$emit('detect', barcode, this.resetState, this.close);
      }
    },
    onError(error) {
      console.error('Camera stream error:', error);
      // If environment camera fails, fallback to default
      if (this.facingMode === 'environment') {
        this.facingMode = 'user';
      }
    },
    close() { this.isOpen = false; },
    resetState() {
      this.loading = false;
      this.barcodeFound = false;
      this.barcodeScanned = '';
      this.torchActive = false;
      this.facingMode = 'environment';
    }
  }
}
</script>

<template>
  <v-dialog v-model="isOpen">
    <v-card :disabled="loading" :loading="loading">
      <template v-slot:loader>
        <v-progress-linear :active="loading" color="deep-purple" height="4" indeterminate></v-progress-linear>
      </template>

      <div style="position: relative;">
        <qrcode-stream
            v-if="isOpen"
            :constraints="selectedConstraints"
            :formats="barcodeFormats"
            :track="paintOutline"
            :torch="torchActive"
            @detect="onDetect"
            @error="onError">

          <!-- Torch Button -->
          <v-btn
              style="position: absolute; top: 16px; right: 16px; z-index: 10;"
              :icon="torchActive ? icons.mdiFlashlight : icons.mdiFlashlightOff"
              @click="torchActive = !torchActive"
              title="Toggle Flashlight">
          </v-btn>

          <!-- Camera Switcher Button -->
          <v-btn
              style="position: absolute; top: 16px; right: 64px; z-index: 10;"
              :icon="icons.mdiCameraSwitch"
              @click="toggleCamera"
              title="Switch Camera">
          </v-btn>
        </qrcode-stream>
      </div>

      <v-card-title>{{ title }}</v-card-title>
      <v-card-subtitle v-if="!barcodeFound">{{ searchingText }}</v-card-subtitle>
      <v-card-text v-else>{{ foundText }} Nummer: {{ barcodeScanned }}</v-card-text>
    </v-card>
  </v-dialog>
</template>
