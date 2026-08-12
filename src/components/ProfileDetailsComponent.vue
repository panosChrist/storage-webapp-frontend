<!-- src/components/ProfileDetailsComponent.vue -->
<script>
import {
  mdiArrowLeft,
  mdiCamera,
  mdiUpload,
  mdiShieldAccount,
  mdiCheckDecagram,
  mdiCheckBold,
  mdiChevronDown,
  mdiClose,
  mdiFingerprint,
  mdiOpenInNew
} from '@mdi/js';
import { isPasskeySupported } from '../javascript/authService.js';

export default {
  name: 'ProfileDetailsComponent',
  props: {
    user: {
      type: Object,
      default: () => ({
        name: 'Alexander Vance',
        email: 'alexander.vance@inventoryarchitect.com',
        role: 'Estate Manager',
        accountRole: 'Administrator',
        timezone: 'pst',
        avatarUrl: ''
      })
    }
  },
  data() {
    return {
      icons: {
        mdiArrowLeft,
        mdiCamera,
        mdiUpload,
        mdiShieldAccount,
        mdiCheckDecagram,
        mdiCheckBold,
        mdiChevronDown,
        mdiClose,
        mdiFingerprint,
        mdiOpenInNew
      },
      hasWebAuthnSupport: false,
      form: {
        fullName: this.user.name || 'Alexander Vance',
        emailAddress: this.user.email || 'alexander.vance@inventoryarchitect.com',
        timezone: 'pst'
      },
      savedSuccess: false,
      avatarDialogOpen: false,
      predefinedAvatars: [
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexander',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Robot'
      ]
    };
  },
  mounted() {
    this.hasWebAuthnSupport = isPasskeySupported();
  },
  methods: {
    goBack() {
      if (this.$router) {
        this.$router.push('/settings');
      } else {
        this.$emit('navigate', 'settings');
      }
    },
    openAuthentikSecurity() {
      const securityUrl = import.meta.env.VITE_AUTHENTIK_SECURITY_URL || (import.meta.env.VITE_OIDC_AUTHORITY + '/if/user/#/settings;page-security');
      window.open(securityUrl, '_blank');
    },
    saveChanges() {
      console.log('Saving profile details:', this.form);
      this.user.name = this.form.fullName;
      this.user.email = this.form.emailAddress;
      this.savedSuccess = true;
      setTimeout(() => {
        this.savedSuccess = false;
      }, 3000);
    },
    openAvatarDialog() {
      this.avatarDialogOpen = true;
    },
    selectAvatar(url) {
      this.user.avatarUrl = url;
      this.$emit('update-avatar', url);
      this.avatarDialogOpen = false;
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    onFileSelected(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          this.user.avatarUrl = dataUrl;
          this.$emit('update-avatar', dataUrl);
          this.avatarDialogOpen = false;
        };
        reader.readAsDataURL(file);
      }
    }
  }
};
</script>

<template>
  <v-container class="pa-4 pa-sm-6 pa-md-8 mx-auto pb-16" style="max-width: 1000px; max-height: calc(100vh - 104px); overflow-y: auto; -webkit-overflow-scrolling: touch;">
    
    <!-- Hidden File Input -->
    <input
      type="file"
      ref="fileInput"
      accept="image/*"
      style="display: none;"
      @change="onFileSelected"
    />

    <!-- Top Back Navigation -->
    <div class="d-flex align-center mb-6">
      <v-btn
        icon
        variant="text"
        density="comfortable"
        color="#00483C"
        class="mr-2"
        @click="goBack"
        title="Back to Settings"
      >
        <v-icon :icon="icons.mdiArrowLeft"></v-icon>
      </v-btn>
      <span class="text-caption font-weight-bold text-teal-darken-4 text-uppercase tracking-wider">
        Settings / Account
      </span>
    </div>

    <!-- Context Header -->
    <div class="mb-8">
      <h1 class="text-h4 text-md-h3 font-weight-bold text-teal-darken-4 tracking-tight mb-2">
        Profile Details
      </h1>
      <p class="text-body-1 text-grey-medium-emphasis style-subtitle">
        Manage your identity, role permissions, and communication preferences.
      </p>
    </div>

    <!-- Alert Banner on Save -->
    <v-alert
      v-if="savedSuccess"
      type="success"
      variant="tonal"
      color="#00483C"
      class="mb-6 font-weight-bold"
      rounded="0"
      closable
    >
      Profile information saved successfully!
    </v-alert>

    <!-- Bento Grid Layout with Equal Desktop Heights (align="stretch") -->
    <v-row class="gy-6 mb-12" align="stretch">
      
      <!-- Left Column: Avatar & Meta Cards -->
      <v-col cols="12" md="4" class="d-flex flex-column justify-space-between gap-6">
        
        <!-- Avatar Card -->
        <v-card class="pa-6 elevation-1 d-flex flex-column align-center text-center position-relative mb-4" color="surface" rounded="0">
          
          <div class="position-relative mb-4">
            <v-avatar size="112" color="#1F6052" class="elevation-3" rounded="0">
              <v-img v-if="user.avatarUrl" :src="user.avatarUrl" cover></v-img>
              <v-icon v-else color="white" size="72" :icon="icons.mdiCamera"></v-icon>
            </v-avatar>

            <!-- Active Status Dot -->
            <div class="status-indicator"></div>
          </div>

          <h2 class="text-h6 font-weight-bold text-grey-darken-4 mb-1">
            {{ user.name }}
          </h2>
          
          <div class="text-subtitle-2 text-grey-medium-emphasis mb-5">
            {{ user.role }}
          </div>

          <!-- Single Change Avatar Button -->
          <v-btn
            block
            color="#00483C"
            variant="tonal"
            rounded="0"
            class="font-weight-bold text-none py-3"
            @click="openAvatarDialog"
          >
            <v-icon start size="18" :icon="icons.mdiUpload"></v-icon>
            Change Avatar
          </v-btn>
        </v-card>

        <!-- Meta Info Card -->
        <v-card class="pa-5 elevation-1 mb-4" color="surface" rounded="0">
          <div class="d-flex align-center gap-3 mb-3">
            <v-avatar color="#CFE6F2" size="40" rounded="0">
              <v-icon color="#00483C" size="20" :icon="icons.mdiShieldAccount"></v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-grey-medium-emphasis text-uppercase font-weight-bold tracking-wider">
                Account Role
              </div>
              <div class="text-body-2 font-weight-bold text-grey-darken-4">
                {{ user.accountRole || 'Estate Manager' }}
              </div>
            </div>
          </div>

          <v-divider opacity="0.12" class="my-3"></v-divider>

          <p class="text-caption text-grey-medium-emphasis mb-0 leading-relaxed">
            Estate Managers have full administrative access to inventory blueprints, storage locations, and system configuration.
          </p>
        </v-card>

        <!-- Passkeys & Security Card -->
        <v-card class="pa-5 elevation-1 flex-grow-1 d-flex flex-column justify-space-between" color="surface" rounded="0">
          <div>
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="d-flex align-center gap-3">
                <v-avatar color="#CFE6F2" size="40" rounded="0">
                  <v-icon color="#00483C" size="20" :icon="icons.mdiFingerprint"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-caption text-grey-medium-emphasis text-uppercase font-weight-bold tracking-wider">
                    Passkeys & Security
                  </div>
                  <div class="text-body-2 font-weight-bold text-grey-darken-4">
                    Passwordless Auth
                  </div>
                </div>
              </div>
              <v-chip size="x-small" :color="hasWebAuthnSupport ? '#00483C' : 'warning'" variant="flat" rounded="0" class="text-white font-weight-bold">
                {{ hasWebAuthnSupport ? 'Supported' : 'WebAuthn' }}
              </v-chip>
            </div>

            <v-divider opacity="0.12" class="my-3"></v-divider>

            <p class="text-caption text-grey-medium-emphasis mb-4 leading-relaxed">
              Register biometric credentials (Touch ID, Face ID, Fingerprint) or security keys via Authentik SSO to log in without passwords.
            </p>
          </div>

          <v-btn
            block
            color="#00483C"
            variant="tonal"
            rounded="0"
            class="font-weight-bold text-none py-2"
            @click="openAuthentikSecurity"
          >
            <v-icon start size="16" :icon="icons.mdiOpenInNew"></v-icon>
            Manage Passkeys in Authentik
          </v-btn>
        </v-card>

      </v-col>

      <!-- Right Column: Personal Information Form Card (Matching Left Height) -->
      <v-col cols="12" md="8" class="d-flex flex-column">
        <v-card class="pa-6 pa-md-8 elevation-1 fill-height d-flex flex-column justify-space-between" color="surface" rounded="0">
          
          <div>
            <div class="text-h6 font-weight-bold text-grey-darken-4 mb-6">
              Personal Information
            </div>

            <v-form @submit.prevent="saveChanges">
              
              <!-- Full Name Input -->
              <v-text-field
                v-model="form.fullName"
                label="Full Name"
                variant="filled"
                density="comfortable"
                bg-color="#E0E3E3"
                color="#00483C"
                rounded="0"
                class="mb-4"
                required
              ></v-text-field>

              <!-- Email Address Input with Verified Indicator -->
              <v-text-field
                v-model="form.emailAddress"
                label="Email Address"
                variant="filled"
                density="comfortable"
                bg-color="#E0E3E3"
                color="#00483C"
                rounded="0"
                class="mb-6"
                required
              >
                <template v-slot:append-inner>
                  <div class="d-flex align-center text-caption font-weight-bold text-teal-darken-4 px-1">
                    <v-icon size="18" color="#00483C" class="mr-1" :icon="icons.mdiCheckDecagram"></v-icon>
                    Verified
                  </div>
                </template>
              </v-text-field>

              <v-divider opacity="0.12" class="my-6"></v-divider>

              <div class="mb-4">
                <div class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-1">
                  Regional Settings
                </div>
                <div class="text-caption text-grey-medium-emphasis">
                  Affects how numbers, dates, and currency are displayed across your devices.
                </div>
              </div>

              <!-- Timezone Select Dropdown -->
              <v-select
                v-model="form.timezone"
                :items="[
                  { title: 'Pacific Standard Time (PST)', value: 'pst' },
                  { title: 'Eastern Standard Time (EST)', value: 'est' },
                  { title: 'Coordinated Universal Time (UTC)', value: 'utc' }
                ]"
                label="Timezone"
                variant="filled"
                density="comfortable"
                bg-color="#E0E3E3"
                color="#00483C"
                rounded="0"
                class="mb-6"
              ></v-select>
            </v-form>
          </div>

          <!-- Centered Save Changes Button with Ample Padding -->
          <div class="d-flex justify-center pt-6 pb-2">
            <v-btn
              type="button"
              color="#00483C"
              variant="flat"
              size="large"
              rounded="0"
              class="text-white font-weight-bold px-10 py-3 text-none elevation-2"
              @click="saveChanges"
            >
              <v-icon start size="20" :icon="icons.mdiCheckBold"></v-icon>
              Save Changes
            </v-btn>
          </div>

        </v-card>
      </v-col>

    </v-row>

    <!-- Avatar Selection Dialog Modal (Preset Avatars + Device Upload) -->
    <v-dialog v-model="avatarDialogOpen" max-width="480">
      <v-card class="pa-4" rounded="0">
        <div class="d-flex justify-space-between align-center mb-4">
          <div class="text-h6 font-weight-bold">
            Choose Profile Avatar
          </div>
          <v-btn icon variant="text" density="comfortable" @click="avatarDialogOpen = false">
            <v-icon :icon="icons.mdiClose"></v-icon>
          </v-btn>
        </div>

        <!-- Option 1: Upload from Device (Phone/PC) -->
        <v-btn
          block
          color="#00483C"
          variant="tonal"
          rounded="0"
          class="text-none font-weight-bold py-3 mb-4"
          @click="triggerFileInput"
        >
          <v-icon start class="mr-2" :icon="icons.mdiUpload"></v-icon>
          Upload Photo from Device
        </v-btn>

        <v-divider class="mb-4" opacity="0.15"></v-divider>

        <div class="text-caption font-weight-bold text-grey-medium-emphasis tracking-wider mb-3">
          OR SELECT FROM PREDEFINED AVATARS
        </div>

        <!-- Option 2: 10 Predefined Avatars Grid -->
        <v-row density="compact">
          <v-col
            v-for="(avatarUrl, index) in predefinedAvatars"
            :key="index"
            cols="4"
            sm="2.4"
            class="d-flex justify-center pa-2"
          >
            <v-avatar
              size="64"
              color="#F2F4F4"
              rounded="0"
              class="cursor-pointer border-avatar hover-scale"
              :class="{ 'border-active': user.avatarUrl === avatarUrl }"
              @click="selectAvatar(avatarUrl)"
            >
              <v-img :src="avatarUrl" cover></v-img>
            </v-avatar>
          </v-col>
        </v-row>

      </v-card>
    </v-dialog>

  </v-container>
</template>

<style scoped>
.status-indicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 14px;
  height: 14px;
  background-color: #00483C;
  border: 2px solid white;
  border-radius: 50%;
}
.hover-scale {
  transition: transform 0.15s ease, border-color 0.15s ease;
}
.hover-scale:hover {
  transform: scale(1.05);
}
.border-avatar {
  border: 2px solid transparent;
}
.border-active {
  border-color: #00483C !important;
}
.tracking-wider {
  letter-spacing: 0.8px;
}
.style-subtitle {
  max-width: 600px;
}
</style>
