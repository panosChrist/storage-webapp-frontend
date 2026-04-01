<!-- src/components/BarcodeScannerDialog.vue -->
<script>
import { QrcodeStream } from 'vue-qrcode-reader';

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
      default: 'Barcode erkannt.'
    }
  },
  emits: ['update:modelValue', 'detect'],
  data() {
    return {
      loading: false,
      barcodeFound: false,
      barcodeScanned: ''
    }
  },
  computed: {
    isOpen: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
        if (!value) {
          this.resetState();
        }
      }
    }
  },
  methods: {
    onDetect(detectedCodes) {
      if (detectedCodes.length > 0) {
        const barcode = detectedCodes[0].rawValue;
        this.loading = true;
        this.barcodeFound = true;
        this.barcodeScanned = barcode;
        this.$emit('detect', barcode);
      }
    },
    close() {
      this.isOpen = false;
    },
    resetState() {
      this.loading = false;
      this.barcodeFound = false;
      this.barcodeScanned = '';
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
          @detect="onDetect"
          :formats="['qr_code', 'code_128', 'ean_8', 'ean_13', 'upc_e', 'upc_a']">
      </qrcode-stream>

      <v-card-title>{{ title }}</v-card-title>
      <v-card-subtitle v-if="!barcodeFound">{{ searchingText }}</v-card-subtitle>
      <v-card-text v-else>{{ foundText }} Nummmer: {{ barcodeScanned }}</v-card-text>
    </v-card>
  </v-dialog>
</template>
