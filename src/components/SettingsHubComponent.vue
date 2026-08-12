<!-- src/components/SettingsHubComponent.vue -->
<script>
import {
  mdiAccountCircle,
  mdiPencil,
  mdiAccountOutline,
  mdiCreditCardOutline,
  mdiBellOutline,
  mdiPalette,
  mdiAlertCircleOutline,
  mdiCommentOutline,
  mdiChevronRight,
  mdiChevronDown,
  mdiLogout,
  mdiUpload,
  mdiClose,
  mdiCheck
} from '@mdi/js';

export default {
  name: 'SettingsHubComponent',
  props: {
    user: {
      type: Object,
      default: () => ({
        name: 'Alexander Vance',
        role: 'Estate Manager',
        status: 'Pro Status Active',
        plan: 'ARCHITECT PRO',
        avatarUrl: ''
      })
    }
  },
  data() {
    return {
      icons: {
        mdiAccountCircle,
        mdiPencil,
        mdiAccountOutline,
        mdiCreditCardOutline,
        mdiBellOutline,
        mdiPalette,
        mdiAlertCircleOutline,
        mdiCommentOutline,
        mdiChevronRight,
        mdiChevronDown,
        mdiLogout,
        mdiUpload,
        mdiClose,
        mdiCheck
      },
      themeMode: localStorage.getItem('app_theme')
        ? (localStorage.getItem('app_theme').charAt(0).toUpperCase() + localStorage.getItem('app_theme').slice(1))
        : 'System',
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
  emits: ['navigate', 'sign-out', 'update-avatar'],
  methods: {
    onNavigate(routeKey) {
      console.log('Navigating to:', routeKey);
      if (routeKey === 'theme-selection' || routeKey === 'theme') {
        if (this.$router) {
          this.$router.push('/settings/theme');
          return;
        }
      }
      if (routeKey === 'profile-details' || routeKey === 'profile') {
        if (this.$router) {
          this.$router.push('/settings/profile');
          return;
        }
      }
      if (routeKey === 'plan-billing' || routeKey === 'billing') {
        if (this.$router) {
          this.$router.push('/settings/billing');
          return;
        }
      }
      if (routeKey === 'notification-settings' || routeKey === 'notifications') {
        if (this.$router) {
          this.$router.push('/settings/notifications');
          return;
        }
      }
      this.$emit('navigate', routeKey);
    },
    cycleTheme() {
      const themes = ['Light', 'Dark', 'System'];
      const currentIndex = themes.indexOf(this.themeMode);
      const nextTheme = themes[(currentIndex + 1) % themes.length];
      this.themeMode = nextTheme;

      let activeThemeName = nextTheme.toLowerCase();
      if (activeThemeName === 'system') {
        activeThemeName = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      this.$vuetify.theme.global.name = activeThemeName;
      localStorage.setItem('app_theme', nextTheme.toLowerCase());
    },
    onSignOut() {
      console.log('Signing out...');
      this.$emit('sign-out');
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
  <v-container class="pa-4 pa-sm-6 pa-md-8 mx-auto pb-12" style="max-width: 1000px; max-height: calc(100vh - 104px); overflow-y: auto; -webkit-overflow-scrolling: touch;">
    
    <!-- Hidden File Input for Device Image Selection -->
    <input
      type="file"
      ref="fileInput"
      accept="image/*"
      style="display: none;"
      @change="onFileSelected"
    />

    <!-- Sharp Top Profile Banner Card (rounded="0") -->
    <v-card class="pa-6 mb-8 elevation-1" color="surface" rounded="0">
      <div class="d-flex flex-column flex-md-row align-center justify-space-between text-center text-md-left gap-4">
        
        <div class="d-flex flex-column flex-md-row align-center gap-4">
          <!-- Avatar Wrapper with Pencil Edit Badge -->
          <div class="position-relative">
            <v-avatar size="96" color="#1F6052" class="elevation-3" rounded="0">
              <v-img v-if="user.avatarUrl" :src="user.avatarUrl" cover></v-img>
              <v-icon v-else color="white" size="60" :icon="icons.mdiAccountCircle"></v-icon>
            </v-avatar>
            
            <!-- Edit Badge -->
            <v-btn
              icon
              size="x-small"
              color="#00483C"
              rounded="0"
              class="position-absolute text-white elevation-2"
              style="bottom: 0px; right: 0px; border: 2px solid white !important;"
              @click="openAvatarDialog"
              title="Change Profile Photo"
            >
              <v-icon size="14" :icon="icons.mdiPencil"></v-icon>
            </v-btn>
          </div>

          <!-- User Name & Role -->
          <div>
            <h2 class="text-h5 font-weight-bold text-grey-darken-4 mb-1">
              {{ user.name }}
            </h2>
            <div class="text-subtitle-2 text-grey-medium-emphasis">
              {{ user.role }}
            </div>
          </div>
        </div>

        <!-- Badges Stack -->
        <div class="d-flex flex-column flex-sm-row align-center gap-3">
          <v-chip
            size="small"
            color="#CFE6F2"
            variant="flat"
            rounded="0"
            class="text-teal-darken-4 font-weight-bold px-3"
          >
            <span class="status-dot mr-2"></span> {{ user.status }}
          </v-chip>

          <v-chip
            size="small"
            color="#00483C"
            variant="flat"
            rounded="0"
            class="text-white font-weight-bold px-3 text-uppercase"
          >
            {{ user.plan }}
          </v-chip>
        </div>

      </div>
    </v-card>

    <!-- Desktop 3-Column / Mobile Stacked Sharp Cards Grid (rounded="0") -->
    <v-row class="gy-6" align="stretch">
      
      <!-- Card 1: Account Settings -->
      <v-col cols="12" md="4" class="d-flex flex-column">
        <v-card class="elevation-1 fill-height d-flex flex-column" color="surface" rounded="0">
          <div class="pa-4 pb-2 border-bottom-subtle">
            <div class="text-subtitle-2 font-weight-bold text-teal-darken-4 text-uppercase tracking-wider">
              Account Settings
            </div>
          </div>

          <v-list density="comfortable" class="pa-2 flex-grow-1">
            
            <!-- Profile Details -->
            <v-list-item class="py-3 px-3 hover-item" rounded="0" @click="onNavigate('profile-details')">
              <template v-slot:prepend>
                <v-avatar color="#F2F4F4" size="40" class="mr-3" rounded="0">
                  <v-icon color="#00483C" size="20" :icon="icons.mdiAccountOutline"></v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="text-body-2 font-weight-bold">
                Profile Details
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption text-grey-medium-emphasis">
                Manage info & credentials
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-icon color="grey-medium-emphasis" size="18" :icon="icons.mdiChevronRight"></v-icon>
              </template>
            </v-list-item>

            <v-divider opacity="0.12" class="my-1"></v-divider>

            <!-- Plan & Billing -->
            <v-list-item class="py-3 px-3 hover-item" rounded="0" @click="onNavigate('plan-billing')">
              <template v-slot:prepend>
                <v-avatar color="#F2F4F4" size="40" class="mr-3" rounded="0">
                  <v-icon color="#00483C" size="20" :icon="icons.mdiCreditCardOutline"></v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="text-body-2 font-weight-bold">
                Plan & Billing
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption text-grey-medium-emphasis">
                Manage payment & subscription
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-icon color="grey-medium-emphasis" size="18" :icon="icons.mdiChevronRight"></v-icon>
              </template>
            </v-list-item>

          </v-list>
        </v-card>
      </v-col>

      <!-- Card 2: App Preferences -->
      <v-col cols="12" md="4" class="d-flex flex-column">
        <v-card class="elevation-1 fill-height d-flex flex-column" color="surface" rounded="0">
          <div class="pa-4 pb-2 border-bottom-subtle">
            <div class="text-subtitle-2 font-weight-bold text-teal-darken-4 text-uppercase tracking-wider">
              App Preferences
            </div>
          </div>

          <v-list density="comfortable" class="pa-2 flex-grow-1">
            
            <!-- Notification Settings -->
            <v-list-item class="py-3 px-3 hover-item" rounded="0" @click="onNavigate('notifications')">
              <template v-slot:prepend>
                <v-avatar color="#F2F4F4" size="40" class="mr-3" rounded="0">
                  <v-icon color="#00483C" size="20" :icon="icons.mdiBellOutline"></v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="text-body-2 font-weight-bold">
                Notifications
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption text-grey-medium-emphasis">
                Low stock alerts & reports
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-icon color="grey-medium-emphasis" size="18" :icon="icons.mdiChevronRight"></v-icon>
              </template>
            </v-list-item>

            <v-divider opacity="0.12" class="my-1"></v-divider>

            <!-- Theme Selection -->
            <v-list-item class="py-3 px-3 hover-item" rounded="0" @click="onNavigate('theme-selection')">
              <template v-slot:prepend>
                <v-avatar color="#F2F4F4" size="40" class="mr-3" rounded="0">
                  <v-icon color="#00483C" size="20" :icon="icons.mdiPalette"></v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="text-body-2 font-weight-bold">
                Theme
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption text-grey-medium-emphasis">
                Switch appearance
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-chip size="x-small" color="#00483C" variant="tonal" rounded="0" class="font-weight-bold">
                  {{ themeMode }}
                  <v-icon end size="14" :icon="icons.mdiChevronDown"></v-icon>
                </v-chip>
              </template>
            </v-list-item>

          </v-list>
        </v-card>
      </v-col>

      <!-- Card 3: Support & Feedback -->
      <v-col cols="12" md="4" class="d-flex flex-column">
        <v-card class="elevation-1 fill-height d-flex flex-column" color="surface" rounded="0">
          <div class="pa-4 pb-2 border-bottom-subtle">
            <div class="text-subtitle-2 font-weight-bold text-teal-darken-4 text-uppercase tracking-wider">
              Support & Feedback
            </div>
          </div>

          <v-list density="comfortable" class="pa-2 flex-grow-1">
            
            <!-- Report an Issue -->
            <v-list-item class="py-3 px-3 hover-item" rounded="0" @click="onNavigate('report-issue')">
              <template v-slot:prepend>
                <v-avatar color="#F2F4F4" size="40" class="mr-3" rounded="0">
                  <v-icon color="#00483C" size="20" :icon="icons.mdiAlertCircleOutline"></v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="text-body-2 font-weight-bold">
                Report Issue
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption text-grey-medium-emphasis">
                Let us know of bugs
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-icon color="grey-medium-emphasis" size="18" :icon="icons.mdiChevronRight"></v-icon>
              </template>
            </v-list-item>

            <v-divider opacity="0.12" class="my-1"></v-divider>

            <!-- Send Feedback -->
            <v-list-item class="py-3 px-3 hover-item" rounded="0" @click="onNavigate('send-feedback')">
              <template v-slot:prepend>
                <v-avatar color="#F2F4F4" size="40" class="mr-3" rounded="0">
                  <v-icon color="#00483C" size="20" :icon="icons.mdiCommentOutline"></v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="text-body-2 font-weight-bold">
                Send Feedback
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption text-grey-medium-emphasis">
                Share feature requests
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-icon color="grey-medium-emphasis" size="18" :icon="icons.mdiChevronRight"></v-icon>
              </template>
            </v-list-item>

          </v-list>
        </v-card>
      </v-col>

    </v-row>

    <!-- Independent Text-Only Sign Out Button at Bottom -->
    <div class="text-center pt-8 pb-12">
      <v-btn
        variant="text"
        color="#7E4924"
        class="text-none font-weight-bold text-body-1 px-6"
        @click="onSignOut"
      >
        Sign Out
      </v-btn>
    </div>

    <!-- Avatar Selection Dialog Modal (rounded="0") -->
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
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 0%;
  background-color: #00483C;
  display: inline-block;
  box-shadow: 0 0 6px rgba(0, 72, 60, 0.4);
}
.hover-item {
  transition: background-color 0.15s ease;
}
.hover-item:hover {
  background-color: rgba(0, 72, 60, 0.04) !important;
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
.border-bottom-subtle {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.tracking-wider {
  letter-spacing: 0.8px;
}
</style>
