<!-- src/components/LoginComponent.vue -->
<script>
import {
  loginWithPassword,
  loginWithPasskey,
  isPasskeySupported
} from '../javascript/authService.js';
import {
  mdiFingerprint,
  mdiLockOutline,
  mdiShieldCheckOutline,
  mdiArrowRight,
  mdiKeyOutline,
  mdiCheckCircle,
  mdiHelpCircleOutline
} from '@mdi/js';

export default {
  name: 'LoginComponent',
  data() {
    return {
      icons: {
        mdiFingerprint,
        mdiLockOutline,
        mdiShieldCheckOutline,
        mdiArrowRight,
        mdiKeyOutline,
        mdiCheckCircle,
        mdiHelpCircleOutline
      },
      hasWebAuthnSupport: false,
      isRedirecting: false,
      selectedMethod: ''
    };
  },
  async mounted() {
    this.hasWebAuthnSupport = isPasskeySupported();
  },
  methods: {
    handlePasskeyLogin() {
      this.isRedirecting = true;
      this.selectedMethod = 'passkey';
      setTimeout(() => {
        loginWithPasskey();
      }, 400);
    },
    handlePasswordLogin() {
      this.isRedirecting = true;
      this.selectedMethod = 'password';
      setTimeout(() => {
        loginWithPassword();
      }, 400);
    }
  }
};
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center pa-4 pa-sm-6" style="min-height: calc(100vh - 104px);">
    <v-card
      class="pa-6 pa-sm-8 elevation-2 text-start w-100"
      style="max-width: 520px;"
      color="surface"
      rounded="0"
    >
      
      <!-- Brand Header -->
      <div class="text-center mb-8">
        <v-avatar color="#00483C" size="56" rounded="0" class="mb-3 elevation-1">
          <v-icon color="white" size="32" :icon="icons.mdiKeyOutline"></v-icon>
        </v-avatar>
        
        <h1 class="text-h4 font-weight-bold text-teal-darken-4 tracking-tight mb-1">
          Inventory Architect
        </h1>
        <p class="text-body-2 text-grey-medium-emphasis">
          Choose your preferred authentication method to access your estate inventory.
        </p>
      </div>

      <!-- Loading State Overlay -->
      <v-progress-linear
        v-if="isRedirecting"
        indeterminate
        color="#00483C"
        class="mb-6"
      ></v-progress-linear>

      <!-- Authentication Options -->
      <div class="d-flex flex-column gap-4 mb-6">
        
        <!-- Option 1: Passkey / Biometrics Card -->
        <v-card
          variant="outlined"
          class="pa-5 cursor-pointer method-card transition-all"
          :class="{ 'border-active': selectedMethod === 'passkey' }"
          rounded="0"
          @click="handlePasskeyLogin"
        >
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center gap-4">
              <v-avatar color="#CFE6F2" size="48" rounded="0" class="flex-shrink-0">
                <v-icon color="#00483C" size="26" :icon="icons.mdiFingerprint"></v-icon>
              </v-avatar>
              <div>
                <div class="d-flex align-center gap-2">
                  <span class="text-subtitle-1 font-weight-bold text-grey-darken-4">
                    Passkey / Biometrics
                  </span>
                  <v-chip
                    v-if="hasWebAuthnSupport"
                    size="x-small"
                    color="#00483C"
                    variant="flat"
                    rounded="0"
                    class="text-white font-weight-bold"
                  >
                    Recommended
                  </v-chip>
                </div>
                <p class="text-caption text-grey-medium-emphasis mb-0 mt-1">
                  Use Touch ID, Face ID, Fingerprint, or Security Key. Passwordless & phishing-resistant.
                </p>
              </div>
            </div>
            <v-icon color="#00483C" class="ms-2 flex-shrink-0" :icon="icons.mdiArrowRight"></v-icon>
          </div>
        </v-card>

        <!-- Option 2: Standard Username & Password Card -->
        <v-card
          variant="outlined"
          class="pa-5 cursor-pointer method-card transition-all"
          :class="{ 'border-active': selectedMethod === 'password' }"
          rounded="0"
          @click="handlePasswordLogin"
        >
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center gap-4">
              <v-avatar color="#E0E3E3" size="48" rounded="0" class="flex-shrink-0">
                <v-icon color="#3F4949" size="26" :icon="icons.mdiLockOutline"></v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-bold text-grey-darken-4">
                  Username & Password
                </div>
                <p class="text-caption text-grey-medium-emphasis mb-0 mt-1">
                  Standard login using your credentials.
                </p>
              </div>
            </div>
            <v-icon color="#3F4949" class="ms-2 flex-shrink-0" :icon="icons.mdiArrowRight"></v-icon>
          </div>
        </v-card>

      </div>

      <v-divider opacity="0.12" class="my-6"></v-divider>

      <!-- WebAuthn Browser Capability Status -->
      <div class="d-flex align-center justify-space-between text-caption text-grey-medium-emphasis">
        <div class="d-flex align-center gap-2">
          <v-icon
            size="16"
            :color="hasWebAuthnSupport ? '#00483C' : 'warning'"
            :icon="hasWebAuthnSupport ? icons.mdiCheckCircle : icons.mdiHelpCircleOutline"
          ></v-icon>
          <span>
            {{ hasWebAuthnSupport ? 'Device supports Passkeys & Biometrics' : 'Standard WebAuthn available' }}
          </span>
        </div>
        <span class="font-weight-bold text-uppercase tracking-wider">
          Authentik SSO
        </span>
      </div>

    </v-card>
  </v-container>
</template>

<style scoped>
.method-card {
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
  background-color: #ffffff;
}
.method-card:hover {
  border-color: #00483C !important;
  background-color: rgba(0, 72, 60, 0.02);
  transform: translateY(-2px);
}
.border-active {
  border-color: #00483C !important;
  background-color: rgba(0, 72, 60, 0.04) !important;
}
.tracking-wider {
  letter-spacing: 0.8px;
}
</style>
