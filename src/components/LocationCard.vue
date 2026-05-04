<script>
import { mdiPencil, mdiTrashCan } from "@mdi/js"
import { itemService } from "../javascript/api.js";

export default {
  name: "LocationCard",
  props: {
    locations: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      icons: {
        mdiPencil,
        mdiTrashCan
      },
      editingId: null,
      isDeleteModalOpen: false,
      locationToDelete: null,
      // Removed newLocationName from here since it belongs to the parent's create modal
    }
  },
  methods: {
    async enableEdit(id) {
      this.editingId = id;

      await this.$nextTick();

      const inputRef = this.$refs['input-' + id];

      if (inputRef) {
        const el = Array.isArray(inputRef) ? inputRef[0] : inputRef;
        el.focus();
      }
    },
    openDeleteModal(location) {
      this.locationToDelete = location;
      this.isDeleteModalOpen = true;
    },
    async confirmDelete() {
      try {
        await itemService.deleteLocation(this.locationToDelete.id);

        this.$emit('deleted', this.locationToDelete.id);

      } catch (error) {
        console.error('Failed to delete location', error);
      } finally {
        this.isDeleteModalOpen = false;
        this.locationToDelete = null;
      }
    },
    async saveLocation(location) {
      if (this.editingId !== location.id) return;

      this.editingId = null;

      try {
        await itemService.updateLocation(location.id, { name: location.name });
      } catch (error) {
        console.error('Failed to save location', error);
      }
    },
  }
}
</script>

<template>
  <div>
    <v-card v-for="location in locations" :key="location.id" flat style="margin-bottom: 32px;">
      <v-img src="https://cdn.vuetifyjs.com/images/parallax/material.jpg" cover></v-img>
      <div class="d-flex justify-space-between align-center">
        <v-text-field
            :ref="'input-' + location.id"
            density="compact"
            hide-details="true"
            style="margin-left: 16px;"
            variant="plain"
            v-model="location.name"
            :readonly="editingId !== location.id"
            @blur="saveLocation(location)"
            @keyup.enter="saveLocation(location)"
        ></v-text-field>
        <div style="padding-top: 8px">
          <v-icon :icon="icons.mdiPencil" style="margin-right: 16px; cursor: pointer; "
                  @click="enableEdit(location.id)"></v-icon>
          <v-icon :icon="icons.mdiTrashCan" style="margin-right: 16px; cursor: pointer; "
                  @click="openDeleteModal(location)"></v-icon>
        </div>
      </div>
      <v-card-text v-if="location.items" class="text-start">
        {{ location.items.length }} Items in this location
      </v-card-text>
    </v-card>

    <v-dialog v-model="isDeleteModalOpen" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Delete Location</v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ locationToDelete?.name }}"? This action cannot be undone. All items will be
          deleted.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="isDeleteModalOpen = false">Cancel</v-btn>
          <v-btn color="error" variant="text" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
