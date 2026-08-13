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
  mdiOpenInNew,
  mdiTranslate,
  mdiClockOutline,
  mdiCalendarRange
} from '@mdi/js';
import { isPasskeySupported } from '../javascript/authService.js';
import { itemService } from '../javascript/api.js';

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
        timezone: 'Europe/Athens',
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
        mdiOpenInNew,
        mdiTranslate,
        mdiClockOutline,
        mdiCalendarRange
      },
      hasWebAuthnSupport: false,
      loading: false,
      userProfile: null,
      form: {
        fullName: '',
        authentikEmail: '',
        displayEmail: '',
        language: 'en',
        timezone: 'Europe/Athens',
        dateFormat: 'DD/MM/YYYY'
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
    this.loadUserProfile();
  },
  methods: {
    async loadUserProfile() {
      this.loading = true;
      try {
        const profile = await itemService.getUserProfile();
        if (profile) {
          this.userProfile = profile;
          this.form.fullName = profile.fullName || this.user.name || '';
          this.form.authentikEmail = profile.email || this.user.email || '';
          this.form.displayEmail = profile.displayEmail || profile.email || '';
          this.form.language = profile.language || 'en';
          this.form.timezone = profile.timezone || 'Europe/Athens';
          this.form.dateFormat = profile.dateFormat || 'DD/MM/YYYY';

          if (profile.avatarUrl) {
            this.user.avatarUrl = profile.avatarUrl;
            this.$emit('update-avatar', profile.avatarUrl);
          }
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      } finally {
        this.loading = false;
      }
    },

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

    async saveChanges() {
      try {
        this.loading = true;
        const updatePayload = {
          displayEmail: this.form.displayEmail,
          fullName: this.form.fullName,
          language: this.form.language,
          timezone: this.form.timezone,
          dateFormat: this.form.dateFormat,
          avatarUrl: this.user.avatarUrl || (this.userProfile ? this.userProfile.avatarUrl : '')
        };

        const updatedProfile = await itemService.updateUserProfile(updatePayload);
        this.userProfile = updatedProfile;
        this.user.name = updatedProfile.fullName;

        this.savedSuccess = true;
        setTimeout(() => {
          this.savedSuccess = false;
        }, 3000);
      } catch (error) {
        console.error('Failed to save profile changes:', error);
      } finally {
        this.loading = false;
      }
    },

    openAvatarDialog() {
      this.avatarDialogOpen = true;
    },

    selectAvatar(url) {
      this.user.avatarUrl = url;
      this.$emit('update-avatar', url);
      this.avatarDialogOpen = false;
      this.saveChanges();
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
          this.saveChanges();
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
        Profile & Regional Settings
      </h1>
      <p class="text-body-1 text-grey-medium-emphasis style-subtitle">
        Manage your identity, Authentik credentials, language, timezone, and date format preferences.
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
      Profile and regional settings saved successfully!
    </v-alert>

    <!-- Bento Grid Layout -->
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
            {{ form.fullName || user.name }}
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

        <!-- Authentik SSO Security Card -->
        <v-card class="pa-5 elevation-1 flex-grow-1 d-flex flex-column justify-space-between" color="surface" rounded="0">
          <div>
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="d-flex align-center gap-3">
                <v-avatar color="#CFE6F2" size="40" rounded="0">
                  <v-icon color="#00483C" size="20" :icon="icons.mdiFingerprint"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-caption text-grey-medium-emphasis text-uppercase font-weight-bold tracking-wider">
                    Authentik SSO
                  </div>
                  <div class="text-body-2 font-weight-bold text-grey-darken-4">
                    Identity & Security
                  </div>
                </div>
              </div>
              <v-chip size="x-small" color="#00483C" variant="flat" rounded="0" class="text-white font-weight-bold">
                Authentik
              </v-chip>
            </div>

            <v-divider opacity="0.12" class="my-3"></v-divider>

            <p class="text-caption text-grey-medium-emphasis mb-4 leading-relaxed">
              Password changes, 2FA/MFA devices, and passkeys are securely managed directly through your Authentik Identity Provider portal.
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
            Manage Security in Authentik
          </v-btn>
        </v-card>

      </v-col>

      <!-- Right Column: Personal & Regional Information Form Card -->
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

              <!-- Authentik Primary Email (Read-only Claim) -->
              <v-text-field
                v-model="form.authentikEmail"
                label="Authentik Primary Email (SSO Claim)"
                variant="filled"
                density="comfortable"
                bg-color="#E0E3E3"
                color="#00483C"
                rounded="0"
                class="mb-4"
                readonly
              >
                <template v-slot:append-inner>
                  <div class="d-flex align-center text-caption font-weight-bold text-teal-darken-4 px-1">
                    <v-icon size="18" color="#00483C" class="mr-1" :icon="icons.mdiCheckDecagram"></v-icon>
                    Authentik SSO
                  </div>
                </template>
              </v-text-field>

              <!-- Display Contact Email (Override Option) -->
              <v-text-field
                v-model="form.displayEmail"
                label="Display Contact Email (Notification Override)"
                variant="filled"
                density="comfortable"
                bg-color="#E0E3E3"
                color="#00483C"
                rounded="0"
                class="mb-6"
                hint="Used for notifications and app display if different from Authentik SSO email"
                persistent-hint
              ></v-text-field>

              <v-divider opacity="0.12" class="my-6"></v-divider>

              <div class="mb-4">
                <div class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-1">
                  Regional Settings
                </div>
                <div class="text-caption text-grey-medium-emphasis">
                  Configures language localization, timezone calculations, and date display formats across your storage web application.
                </div>
              </div>

              <!-- Preferred Language Select -->
              <v-select
                v-model="form.language"
                :items="[
                  { title: 'Greek (Ελληνικά)', value: 'el' },
                  { title: 'German (Deutsch)', value: 'de' },
                  { title: 'English (English)', value: 'en' }
                ]"
                label="Preferred Language"
                variant="filled"
                density="comfortable"
                bg-color="#E0E3E3"
                color="#00483C"
                rounded="0"
                class="mb-4"
              >
                <template v-slot:prepend-inner>
                  <v-icon :icon="icons.mdiTranslate" color="#00483C" class="mr-2"></v-icon>
                </template>
              </v-select>

              <!-- Timezone Select Dropdown -->
              <v-select
                v-model="form.timezone"
                :items="[
                  { title: 'Athens (EET / UTC+2)', value: 'Europe/Athens' },
                  { title: 'Berlin / Paris (CET / UTC+1)', value: 'Europe/Berlin' },
                  { title: 'London (GMT / UTC+0)', value: 'Europe/London' },
                  { title: 'Coordinated Universal Time (UTC)', value: 'UTC' },
                  { title: 'New York (EST / UTC-5)', value: 'America/New_York' },
                  { title: 'Tokyo (JST / UTC+9)', value: 'Asia/Tokyo' }
                ]"
                label="Timezone"
                variant="filled"
                density="comfortable"
                bg-color="#E0E3E3"
                color="#00483C"
                rounded="0"
                class="mb-4"
              >
                <template v-slot:prepend-inner>
                  <v-icon :icon="icons.mdiClockOutline" color="#00483C" class="mr-2"></v-icon>
                </template>
              </v-select>

              <!-- Date Format Select Dropdown -->
              <v-select
                v-model="form.dateFormat"
                :items="[
                  { title: 'DD/MM/YYYY (e.g. 13/08/2026)', value: 'DD/MM/YYYY' },
                  { title: 'YYYY-MM-DD (e.g. 2026-08-13)', value: 'YYYY-MM-DD' },
                  { title: 'MM/DD/YYYY (e.g. 08/13/2026)', value: 'MM/DD/YYYY' }
                ]"
                label="Date Format"
                variant="filled"
                density="comfortable"
                bg-color="#E0E3E3"
                color="#00483C"
                rounded="0"
                class="mb-6"
              >
                <template v-slot:prepend-inner>
                  <v-icon :icon="icons.mdiCalendarRange" color="#00483C" class="mr-2"></v-icon>
                </template>
              </v-select>

            </v-form>
          </div>

          <!-- Save Changes Button -->
          <div class="d-flex justify-center pt-6 pb-2">
            <v-btn
              type="button"
              color="#00483C"
              variant="flat"
              size="large"
              rounded="0"
              :loading="loading"
              class="text-white font-weight-bold px-10 py-3 text-none elevation-2"
              @click="saveChanges"
            >
              <v-icon start size="20" :icon="icons.mdiCheckBold"></v-icon>
              Save Profile & Regional Settings
            </v-btn>
          </div>

        </v-card>
      </v-col>

    </v-row>

    <!-- Avatar Selection Dialog Modal -->
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

        <!-- Option 1: Upload from Device -->
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
