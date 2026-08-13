<!-- src/components/HouseholdSettingsComponent.vue -->
<script>
import {
  mdiArrowLeft,
  mdiHomeGroup,
  mdiKey,
  mdiContentCopy,
  mdiAccountPlus,
  mdiAccountRemove,
  mdiShieldAccount,
  mdiAccountGroup,
  mdiPencil,
  mdiCheckBold,
  mdiClose,
  mdiCheckDecagram
} from '@mdi/js';
import { itemService } from '../javascript/api.js';

export default {
  name: 'HouseholdSettingsComponent',
  data() {
    return {
      icons: {
        mdiArrowLeft,
        mdiHomeGroup,
        mdiKey,
        mdiContentCopy,
        mdiAccountPlus,
        mdiAccountRemove,
        mdiShieldAccount,
        mdiAccountGroup,
        mdiPencil,
        mdiCheckBold,
        mdiClose,
        mdiCheckDecagram
      },
      loading: false,
      household: null,
      editNameDialog: false,
      newHouseholdName: '',
      joinDialog: false,
      inviteCodeInput: '',
      copied: false,
      alertMessage: '',
      alertType: 'success',
      confirmRemoveDialog: false,
      memberToRemove: null
    };
  },
  computed: {
    isAdmin() {
      return this.household?.currentUserRole === 'ADMIN';
    }
  },
  mounted() {
    this.loadHousehold();
  },
  methods: {
    async loadHousehold() {
      this.loading = true;
      try {
        const data = await itemService.getMyHousehold();
        if (data) {
          this.household = data;
          this.newHouseholdName = data.name;
        }
      } catch (error) {
        console.error('Failed to load household:', error);
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

    copyInviteCode() {
      if (this.household?.inviteCode) {
        navigator.clipboard.writeText(this.household.inviteCode);
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2500);
      }
    },

    async saveHouseholdName() {
      if (!this.newHouseholdName || !this.newHouseholdName.trim()) return;
      try {
        this.loading = true;
        const updated = await itemService.updateHouseholdName(this.newHouseholdName.trim());
        this.household = updated;
        this.editNameDialog = false;
        this.showAlert('Household name updated successfully', 'success');
      } catch (error) {
        console.error('Failed to update household name:', error);
        this.showAlert('Failed to update household name', 'error');
      } finally {
        this.loading = false;
      }
    },

    async onJoinHousehold() {
      if (!this.inviteCodeInput || !this.inviteCodeInput.trim()) return;
      try {
        this.loading = true;
        const updated = await itemService.joinHousehold(this.inviteCodeInput.trim());
        this.household = updated;
        this.joinDialog = false;
        this.inviteCodeInput = '';
        this.showAlert(`Successfully joined ${updated.name}!`, 'success');
      } catch (error) {
        console.error('Failed to join household:', error);
        this.showAlert('Invalid or expired invite code', 'error');
      } finally {
        this.loading = false;
      }
    },

    promptRemoveMember(member) {
      this.memberToRemove = member;
      this.confirmRemoveDialog = true;
    },

    async confirmRemoveMember() {
      if (!this.memberToRemove) return;
      try {
        this.loading = true;
        const updated = await itemService.removeHouseholdMember(this.memberToRemove.userId);
        this.household = updated;
        this.confirmRemoveDialog = false;
        this.showAlert(`Removed ${this.memberToRemove.fullName} from household`, 'success');
      } catch (error) {
        console.error('Failed to remove member:', error);
        this.showAlert('Failed to remove member', 'error');
      } finally {
        this.loading = false;
        this.memberToRemove = null;
      }
    },

    showAlert(msg, type = 'success') {
      this.alertMessage = msg;
      this.alertType = type;
      setTimeout(() => {
        this.alertMessage = '';
      }, 4000);
    }
  }
};
</script>

<template>
  <v-container class="pa-4 pa-sm-6 pa-md-8 mx-auto pb-16" style="max-width: 1000px; max-height: calc(100vh - 104px); overflow-y: auto;">
    
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
        Settings / Household
      </span>
    </div>

    <!-- Header -->
    <div class="mb-8 d-flex justify-space-between align-center flex-wrap gap-4">
      <div>
        <h1 class="text-h4 text-md-h3 font-weight-bold text-teal-darken-4 tracking-tight mb-2">
          Household & Family Sharing
        </h1>
        <p class="text-body-1 text-grey-medium-emphasis">
          Manage your shared household, invite family members, and collaborate on inventory in real-time.
        </p>
      </div>

      <v-btn
        color="#00483C"
        variant="flat"
        class="text-white font-weight-bold text-none px-6"
        @click="joinDialog = true"
      >
        <v-icon start :icon="icons.mdiAccountPlus"></v-icon>
        Join Another Household
      </v-btn>
    </div>

    <!-- Alert Notification Banner -->
    <v-alert
      v-if="alertMessage"
      :type="alertType"
      variant="tonal"
      color="#00483C"
      class="mb-6 font-weight-bold"
      rounded="0"
      closable
    >
      {{ alertMessage }}
    </v-alert>

    <!-- Main Content Card -->
    <v-card v-if="household" class="pa-6 elevation-1 mb-8" color="surface" rounded="0">
      
      <!-- Household Title & Role -->
      <div class="d-flex justify-space-between align-center mb-6 border-b-sm border-grey-lighten-2 pb-4">
        <div class="d-flex align-center">
          <v-avatar color="#CFE6F2" size="48" rounded="0" class="mr-3">
            <v-icon color="#00483C" size="24" :icon="icons.mdiHomeGroup"></v-icon>
          </v-avatar>
          <div>
            <div class="d-flex align-center">
              <h2 class="text-h5 font-weight-bold text-grey-darken-4 mr-2">
                {{ household.name }}
              </h2>
              <v-btn v-if="isAdmin" icon size="small" variant="text" color="#00483C" @click="editNameDialog = true">
                <v-icon :icon="icons.mdiPencil" size="18"></v-icon>
              </v-btn>
            </div>
            <div class="text-caption text-grey-medium-emphasis">
              Shared storage space & inventory
            </div>
          </div>
        </div>

        <span
          class="px-3 py-1 rounded-pill font-weight-bold text-white text-caption"
          :style="{ backgroundColor: isAdmin ? '#00483C' : '#5C6BC0' }"
        >
          Your Role: {{ household.currentUserRole }}
        </span>
      </div>

      <!-- Invite Code Card Banner -->
      <div class="bg-grey-lighten-4 rounded-lg pa-4 mb-8 d-flex justify-space-between align-center flex-wrap gap-4">
        <div>
          <div class="text-caption font-weight-bold text-grey-darken-1 text-uppercase tracking-wider mb-1">
            Household Invite Code
          </div>
          <div class="text-caption text-grey-medium-emphasis">
            Share this 6-character code with family members or housemates to let them join your household.
          </div>
        </div>

        <div class="d-flex align-center">
          <div class="text-h4 font-weight-bold text-teal-darken-4 tracking-widest mr-3 font-monospace">
            {{ household.inviteCode }}
          </div>
          <v-btn
            color="#00483C"
            variant="tonal"
            size="small"
            class="font-weight-bold text-none"
            @click="copyInviteCode"
          >
            <v-icon start size="16" :icon="copied ? icons.mdiCheckBold : icons.mdiContentCopy"></v-icon>
            {{ copied ? 'Copied!' : 'Copy Code' }}
          </v-btn>
        </div>
      </div>

      <!-- Members Section Header -->
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="text-h6 font-weight-bold text-grey-darken-4 d-flex align-center">
          <v-icon :icon="icons.mdiAccountGroup" color="#00483C" class="mr-2"></v-icon>
          Household Members ({{ household.members ? household.members.length : 0 }})
        </div>
      </div>

      <!-- Members List -->
      <div class="bg-grey-lighten-4 rounded-lg pa-2">
        <div
          v-for="member in household.members"
          :key="member.id"
          class="d-flex justify-space-between align-center px-4 py-3 border-b-sm border-grey-lighten-2 text-start"
        >
          <div class="d-flex align-center">
            <v-avatar size="44" color="#1F6052" class="mr-3">
              <v-img v-if="member.avatarUrl" :src="member.avatarUrl" cover></v-img>
              <span v-else class="text-white font-weight-bold">{{ member.fullName ? member.fullName.substring(0, 1) : 'U' }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-bold text-body-1 text-grey-darken-4">
                {{ member.fullName }}
              </div>
              <div class="text-caption text-grey-medium-emphasis">
                {{ member.email || member.userId }}
              </div>
            </div>
          </div>

          <div class="d-flex align-center">
            <span
              class="px-3 py-1 rounded-pill font-weight-bold text-white text-caption mr-2"
              :style="{ backgroundColor: member.role === 'ADMIN' ? '#00483C' : '#5C6BC0' }"
            >
              {{ member.role }}
            </span>

            <!-- Admin Action: Remove Member -->
            <v-btn
              v-if="isAdmin && member.role !== 'ADMIN'"
              icon
              size="small"
              variant="text"
              color="error"
              title="Remove user from household"
              @click="promptRemoveMember(member)"
            >
              <v-icon :icon="icons.mdiAccountRemove"></v-icon>
            </v-btn>
          </div>
        </div>
      </div>

    </v-card>

    <!-- Dialog: Edit Household Name -->
    <v-dialog v-model="editNameDialog" max-width="440">
      <v-card class="pa-4" rounded="0">
        <div class="text-h6 font-weight-bold mb-4">
          Rename Household
        </div>
        <v-text-field
          v-model="newHouseholdName"
          label="Household Name"
          variant="filled"
          bg-color="#E0E3E3"
          color="#00483C"
          class="mb-4"
        ></v-text-field>
        <div class="d-flex justify-end gap-2">
          <v-btn variant="text" @click="editNameDialog = false">Cancel</v-btn>
          <v-btn color="#00483C" variant="flat" class="text-white font-weight-bold" @click="saveHouseholdName">Save</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Dialog: Join Household by Code -->
    <v-dialog v-model="joinDialog" max-width="440">
      <v-card class="pa-4" rounded="0">
        <div class="text-h6 font-weight-bold mb-2">
          Join a Household
        </div>
        <div class="text-caption text-grey-medium-emphasis mb-4">
          Type the 6-character invite code provided by your household admin.
        </div>
        <v-text-field
          v-model="inviteCodeInput"
          label="Invite Code (e.g. HOME-7892)"
          variant="filled"
          bg-color="#E0E3E3"
          color="#00483C"
          class="mb-4 text-uppercase"
          maxlength="10"
        ></v-text-field>
        <div class="d-flex justify-end gap-2">
          <v-btn variant="text" @click="joinDialog = false">Cancel</v-btn>
          <v-btn color="#00483C" variant="flat" class="text-white font-weight-bold" @click="onJoinHousehold">Join</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Dialog: Confirm Remove Member -->
    <v-dialog v-model="confirmRemoveDialog" max-width="440">
      <v-card class="pa-4" rounded="0">
        <div class="text-h6 font-weight-bold text-error mb-2">
          Remove Household Member
        </div>
        <div class="text-body-2 text-grey-darken-2 mb-4">
          Are you sure you want to remove <strong>{{ memberToRemove?.fullName }}</strong> from {{ household?.name }}? They will revert to their own personal storage workspace.
        </div>
        <div class="d-flex justify-end gap-2">
          <v-btn variant="text" @click="confirmRemoveDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" class="text-white font-weight-bold" @click="confirmRemoveMember">Remove</v-btn>
        </div>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<style scoped>
.tracking-widest {
  letter-spacing: 2px;
}
.font-monospace {
  font-family: monospace;
}
</style>
