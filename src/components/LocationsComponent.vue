<script>
import { mdiMapMarkerPlus, mdiPencil, mdiTrashCan } from "@mdi/js"
import { itemService } from "../javascript/api.js";
import LocationCard from "./LocationCard.vue";

export default {
  name: "LocationsComponent",
  components: {
    LocationCard
  },
  data() {
    return {
      icons: {
        mdiMapMarkerPlus,
        mdiPencil,
        mdiTrashCan
      },
      locations: [], // FIXED: Unified name to 'locations'
      isCreateModalOpen: false,
      newLocationName: '', // FIXED: Added missing state variable
    }
  },
  methods: {
    openCreateModal() {
      this.newLocationName = '';
      this.isCreateModalOpen = true;
    },

    closeCreateModal() {
      this.isCreateModalOpen = false;
      this.newLocationName = '';
    },

    async confirmCreate() {
      // Prevent submission if empty
      if (!this.newLocationName || !this.newLocationName.trim()) return;

      try {
        const newLocation = await itemService.createLocation({ name: this.newLocationName });
        // Make sure it has an items array so the child component doesn't crash on length
        if(!newLocation.items) newLocation.items = [];

        this.locations.push(newLocation);
        this.closeCreateModal();

      } catch (error) {
        console.error('Failed to create location', error);
      }
    },

    // NEW: Method to handle the delete event emitted from the child
    handleLocationDeleted(deletedId) {
      this.locations = this.locations.filter(loc => loc.id !== deletedId);
    }
  },
  async mounted() {
    this.locations = await itemService.getAllLocations() || [];
  }
}
</script>

<template>
  <v-container style="height: calc(100vh - 180px); overflow-y: auto; background-color: #F5F5F5; ">

    <v-card flat style="margin-bottom: 32px; background-color: #F5F5F5;" >
      <v-card-title class="text-start" style="padding-left: 0">Locations</v-card-title>
      <v-card-text class="text-start" style="padding-left: 0">Manage your storage locations. You can edit the location, change the name or delete the location.
        If the location is deleted you can choose if all the items in there should be deleted or moved to default location.</v-card-text>
      <div style="padding-bottom: 16px">
        <v-btn variant="tonal" @click="openCreateModal" :prepend-icon="icons.mdiMapMarkerPlus" width="100%" style="padding-left: 32px" color="primary" spaced="end"><span class="text-start">Add new Location</span></v-btn>
      </div>
    </v-card>

    <LocationCard :locations="locations" @deleted="handleLocationDeleted" />

    <v-dialog v-model="isCreateModalOpen" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Create New Location</v-card-title>
        <v-card-text>
          <v-text-field
              v-model="newLocationName"
              label="Location Name"
              variant="underlined"
              autofocus
              @keyup.enter="confirmCreate">
          </v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="closeCreateModal">Cancel</v-btn>
          <v-btn color="primary" variant="text" @click="confirmCreate" :disabled="!newLocationName.trim()">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>
