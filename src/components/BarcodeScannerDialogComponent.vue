<!-- src/components/BarcodeScannerDialogComponent.vue -->
<script>
import { QrcodeStream } from 'vue-qrcode-reader';
import {
  mdiClose,
  mdiFlashlight,
  mdiFlashlightOff,
  mdiCameraSwitch,
  mdiPencilOutline,
  mdiKeyboardOutline,
  mdiBarcodeScan,
  mdiPlus,
  mdiMinus,
  mdiCheck
} from "@mdi/js";

export default {
  name: 'BarcodeScannerDialogComponent',
  components: {
    QrcodeStream
  },
  props: {
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: 'Barcode Scanner' },
    searchingText: { type: String, default: 'Align barcode within the frame to scan' },
    foundText: { type: String, default: 'Barcode Scanned!' }
  },
  emits: ['update:modelValue', 'detect', 'manual-entry'],
  data() {
    return {
      icons: {
        mdiClose,
        mdiFlashlight,
        mdiFlashlightOff,
        mdiCameraSwitch,
        mdiPencilOutline,
        mdiKeyboardOutline,
        mdiBarcodeScan,
        mdiPlus,
        mdiMinus,
        mdiCheck
      },
      loading: false,
      barcodeFound: false,
      barcodeScanned: '',
      torchActive: false,
      scannedQty: 1,
      facingMode: 'environment', // 'environment' = back, 'user' = front
      barcodeFormats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128']
    }
  },
  computed: {
    isOpen: {
      get() { return this.modelValue; },
      set(value) { this.$emit('update:modelValue', value); }
    },
    selectedConstraints() {
      return {
        facingMode: { ideal: this.facingMode },
        width: { min: 1280, ideal: 1920, max: 3840 },
        height: { min: 720, ideal: 1080, max: 2160 },
        advanced: [
          { focusMode: 'continuous' }
        ]
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
          ctx.strokeStyle = '#00483C';
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
      if (this.facingMode === 'environment') {
        this.facingMode = 'user';
      }
    },
    onManualEntry() {
      this.$emit('manual-entry');
      this.close();
    },
    close() { this.isOpen = false; },
    resetState() {
      this.loading = false;
      this.barcodeFound = false;
      this.barcodeScanned = '';
      this.scannedQty = 1;
      this.torchActive = false;
      this.facingMode = 'environment';
    }
  }
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    fullscreen
    transition="dialog-bottom-transition"
  >
    <v-card class="bg-black d-flex flex-column justify-space-between fill-height position-relative overflow-hidden">
      
      <!-- Camera Stream Container -->
      <div class="position-absolute fill-height w-100" style="top: 0; left: 0; z-index: 1;">
        <qrcode-stream
          v-if="isOpen"
          :constraints="selectedConstraints"
          :formats="barcodeFormats"
          :track="paintOutline"
          :torch="torchActive"
          class="fill-height w-100"
          @detect="onDetect"
          @error="onError">
        </qrcode-stream>
      </div>

      <!-- Top Overlay Controls -->
      <div class="d-flex justify-space-between align-center pa-4 position-relative" style="z-index: 10;">
        <!-- Close Button (Top Left Glassmorphic) -->
        <v-btn
          icon
          variant="flat"
          color="rgba(0, 0, 0, 0.45)"
          class="text-white border-glass"
          size="large"
          @click="close"
        >
          <v-icon :icon="icons.mdiClose"></v-icon>
        </v-btn>

        <!-- Right Action Buttons (Torch & Camera Switch) -->
        <div class="d-flex flex-column">
          <v-btn
            icon
            variant="flat"
            color="rgba(0, 0, 0, 0.45)"
            class="text-white border-glass mb-2"
            size="large"
            @click="torchActive = !torchActive"
            title="Toggle Flashlight"
          >
            <v-icon :icon="torchActive ? icons.mdiFlashlight : icons.mdiFlashlightOff"></v-icon>
          </v-btn>

          <v-btn
            icon
            variant="flat"
            color="rgba(0, 0, 0, 0.45)"
            class="text-white border-glass"
            size="large"
            @click="toggleCamera"
            title="Switch Camera"
          >
            <v-icon :icon="icons.mdiCameraSwitch"></v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Center Scanning Reticle Frame -->
      <div class="position-relative d-flex align-center justify-center flex-grow-1" style="z-index: 5;">
        <div class="scanner-frame position-relative">
          <!-- 4 Corner Brackets -->
          <div class="corner top-left"></div>
          <div class="corner top-right"></div>
          <div class="corner bottom-left"></div>
          <div class="corner bottom-right"></div>
        </div>
      </div>

      <!-- Bottom Controls & Preview Container -->
      <div class="d-flex flex-column align-center pa-4 pb-8 position-relative" style="z-index: 10;">
        
        <!-- Detected Barcode Preview Card -->
        <v-slide-y-reverse-transition>
          <v-card
            v-if="barcodeFound"
            class="w-100 mb-4 pa-3 rounded-xl elevation-6"
            color="#F7FAF9"
            style="max-width: 400px;"
          >
            <div class="d-flex align-center">
              <v-avatar color="#E0F2FE" size="48" class="mr-3 rounded-lg">
                <v-icon color="#00483C" size="24" :icon="icons.mdiBarcodeScan"></v-icon>
              </v-avatar>
              
              <div class="flex-grow-1">
                <div class="text-subtitle-2 font-weight-bold text-grey-darken-4">
                  Barcode Detected
                </div>
                <div class="text-caption text-grey-darken-1 font-mono">
                  {{ barcodeScanned }}
                </div>
              </div>

              <!-- Quantity Stepper Pill -->
              <div class="d-flex align-center bg-grey-lighten-3 pa-1 rounded-pill">
                <v-btn
                  icon
                  density="compact"
                  variant="flat"
                  color="white"
                  size="small"
                  :disabled="scannedQty <= 1"
                  @click="scannedQty--"
                >
                  <v-icon size="16" :icon="icons.mdiMinus"></v-icon>
                </v-btn>
                <span class="px-3 text-subtitle-2 font-weight-bold">{{ scannedQty }}</span>
                <v-btn
                  icon
                  density="compact"
                  variant="flat"
                  color="#00483C"
                  class="text-white"
                  size="small"
                  @click="scannedQty++"
                >
                  <v-icon size="16" :icon="icons.mdiPlus"></v-icon>
                </v-btn>
              </div>
            </div>
          </v-card>
        </v-slide-y-reverse-transition>

        <!-- Instruction Pill -->
        <v-chip
          variant="flat"
          color="rgba(0, 0, 0, 0.55)"
          class="text-white text-caption font-weight-medium px-4 py-2 mb-3 border-glass"
          size="large"
        >
          {{ barcodeFound ? foundText : searchingText }}
        </v-chip>

        <!-- Manual Entry Button -->
        <v-btn
          variant="flat"
          color="rgba(255, 255, 255, 0.25)"
          class="text-white text-none font-weight-bold px-6 py-3 border-glass backdrop-blur"
          rounded="pill"
          size="large"
          @click="onManualEntry"
        >
          <v-icon start class="mr-2" :icon="icons.mdiKeyboardOutline"></v-icon>
          Manual Entry
        </v-btn>

      </div>

    </v-card>
  </v-dialog>
</template>

<style scoped>
:deep(video) {
  object-fit: cover !important;
  width: 100% !important;
  height: 100% !important;
}

.scanner-frame {
  width: 280px;
  height: 240px;
  border-radius: 20px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.45);
}

.corner {
  position: absolute;
  width: 32px;
  height: 32px;
  border-color: #7FFFD4;
  border-style: solid;
  border-width: 0;
}

.top-left {
  top: 0;
  left: 0;
  border-top-width: 4px;
  border-left-width: 4px;
  border-top-left-radius: 16px;
}

.top-right {
  top: 0;
  right: 0;
  border-top-width: 4px;
  border-right-width: 4px;
  border-top-right-radius: 16px;
}

.bottom-left {
  bottom: 0;
  left: 0;
  border-bottom-width: 4px;
  border-left-width: 4px;
  border-bottom-left-radius: 16px;
}

.bottom-right {
  bottom: 0;
  right: 0;
  border-bottom-width: 4px;
  border-right-width: 4px;
  border-bottom-right-radius: 16px;
}

.border-glass {
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.backdrop-blur {
  backdrop-filter: blur(12px);
}

.font-mono {
  font-family: monospace;
}
</style>
