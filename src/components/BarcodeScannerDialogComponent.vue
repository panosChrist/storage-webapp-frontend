<!-- src/components/BarcodeScannerDialog.vue -->
<script>
import { QrcodeStream } from 'vue-qrcode-reader';
import {mdiFlashlight, mdiFlashlightOff} from "@mdi/js"

export default {
  name: 'BarcodeScannerDialogComponent',
  components: {
    QrcodeStream
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Barcode'
    },
    searchingText: {
      type: String,
      default: 'Barcode wird gesucht. Bitte warten'
    },
    foundText: {
      type: String,
      default: 'Barcode erkannt! Produkt wird geladen...'
    }
  },
  emits: ['update:modelValue', 'detect'],
  data() {
    return {
      icons: {
        mdiFlashlight,
        mdiFlashlightOff
      },
      loading: false,
      barcodeFound: false,
      barcodeScanned: '',
      torchActive: false
    }
  },
  computed: {
    isOpen: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    }
  },
  watch: {
    modelValue(newVal) {
      if (!newVal) {
        this.resetState();
      }
    }
  },
  methods: {
    onDetect(detectedCodes) {
      if (this.loading) return; // Prevent multiple scans of the same barcode while processing

      if (detectedCodes.length > 0) {
        const barcode = detectedCodes[0].rawValue;
        this.loading = true;
        this.barcodeFound = true;
        this.barcodeScanned = barcode;
        this.$emit('detect', barcode, this.resetState, this.close);
      }
    },
    close() {
      this.isOpen = false;
    },
    resetState() {
      this.loading = false;
      this.barcodeFound = false;
      this.barcodeScanned = '';
      this.torchActive = false;
    }
  }
}
</script>

<template>
  <v-dialog v-model="isOpen">
    <v-card :disabled="loading" :loading="loading">
      <template v-slot:loader>
        <v-progress-linear
            :active="loading"
            color="deep-purple"
            height="4"
            indeterminate
        ></v-progress-linear>
      </template>

      <qrcode-stream
          v-if="isOpen"
          :torch="torchActive"
          @detect="onDetect"
          :formats="['qr_code', 'code_128', 'ean_8', 'ean_13', 'upc_e', 'upc_a']">
        <v-btn 
            style="position: absolute; top: 16px; right: 16px; z-index: 10;"
            :icon="torchActive ? icons.mdiFlashlight : icons.mdiFlashlightOff" 
            @click="torchActive = !torchActive" 
            title="Toggle Flashlight">
        </v-btn>
      </qrcode-stream>

      <v-card-title>
        {{ title }}
      </v-card-title>
      <v-card-subtitle v-if="!barcodeFound">{{ searchingText }}</v-card-subtitle>
      <v-card-text v-else>{{ foundText }} Nummer: {{ barcodeScanned }}</v-card-text>
    </v-card>
  </v-dialog>
</template>
