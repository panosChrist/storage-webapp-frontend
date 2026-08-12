<script>
import {
  mdiAccount,
  mdiCogOutline,
  mdiBellOutline,
  mdiLaptop,
  mdiDownloadOutline
} from '@mdi/js';

export default {
  name: 'UserProfileMenu',
  props: {
    user: {
      type: Object,
      required: true,
      default: () => ({
        name: '',
        email: '',
        avatarUrl: ''
      })
    },
    menuItems: {
      type: Array,
      default: () => [
        { key: 'profile', title: 'Profile Settings', icon: mdiCogOutline },
        { key: 'notifications', title: 'Notification Preferences', icon: mdiBellOutline },
        { key: 'devices', title: 'Connected Devices', icon: mdiLaptop },
        { key: 'export', title: 'Export Data', icon: mdiDownloadOutline }
      ]
    },
    primaryColor: {
      type: String,
      default: '#0B4636'
    },
    accentColor: {
      type: String,
      default: '#1F6052'
    }
  },
  data() {
    return {
      icons: {
        mdiAccount
      }
    };
  },
  emits: ['select-option', 'sign-out'],
  methods: {
    onSelect(itemKey) {
      this.$emit('select-option', itemKey);
    },
    onSignOut() {
      this.$emit('sign-out');
    }
  }
};
</script>

<template>
  <v-card min-width="280" class="pa-4 elevation-4" rounded="0" style="background-color: #ffffff;">
    <!-- User Header -->
    <div class="d-flex align-center pb-3 mb-2">
      <v-avatar :color="accentColor" size="48" class="mr-3">
        <v-img v-if="user.avatarUrl" :src="user.avatarUrl" cover></v-img>
        <v-icon v-else color="white" size="28" :icon="icons.mdiAccount"></v-icon>
      </v-avatar>
      <div>
        <div class="text-subtitle-1 font-weight-bold text-grey-darken-4" style="line-height: 1.2;">
          {{ user.name }}
        </div>
        <div class="text-caption text-grey-medium-emphasis">
          {{ user.email }}
        </div>
      </div>
    </div>

    <v-divider class="mb-2" opacity="0.12"></v-divider>

    <!-- Options List -->
    <v-list density="compact" nav class="pa-0">
      <v-list-item
        v-for="item in menuItems"
        :key="item.key"
        :value="item.key"
        rounded="0"
        class="mb-1"
        @click="onSelect(item.key)"
      >
        <template v-slot:prepend>
          <v-icon size="20" class="mr-2" :icon="item.icon"></v-icon>
        </template>
        <v-list-item-title class="text-body-2 font-weight-medium">
          {{ item.title }}
        </v-list-item-title>
      </v-list-item>
    </v-list>

    <!-- Sign Out Button -->
    <v-btn
      block
      :color="primaryColor"
      class="text-none rounded-0 text-white font-weight-bold py-2 mt-2"
      elevation="0"
      @click="onSignOut"
    >
      Sign Out
    </v-btn>
  </v-card>
</template>
