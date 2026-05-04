<script>
import {mdiInformationOutline, mdiBarcode, mdiImageOffOutline, mdiTrashCanOutline } from "@mdi/js";
import {itemService} from "../javascript/api.js";

export default {
  name: "ItemCard",
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isDeleteDialogOpen: false,
      icons: {
        mdiInformationOutline,
        mdiBarcode,
        mdiImageOffOutline,
        mdiTrashCanOutline
      }
    }
  },
  emits: ['update-quantity', 'item-deleted'],
  methods: {
    updateQuantity(itemId, newValue) {
      // Just emit to the parent - don't process here
      this.$emit('update-quantity', itemId, newValue);
    },
    openDetails() {
      this.$router.push({name: 'item-detail', params: {id: this.item.id}});
    },
    deleteItem() {
      this.isDeleteDialogOpen = true;
    },
    confirmDeleteItem() {
      this.$emit('item-deleted', this.item.id);
      this.isDeleteDialogOpen = false;
    }
  },
  computed: {
    localQuantity: {
      get() {
        return this.item.quantity;
      },
      set(val) {
        this.updateQuantity(this.item.id, val);
      }
    }
  }
}
</script>

<template>
  <v-card style="margin-bottom: 16px; overflow: hidden;" @click="openDetails">
    <div class="d-flex flex-no-wrap" style="min-width: 0;">

      <v-img
          v-if="item.foodItem?.category?.imageUrl"
          height="100"
          width="100"
          min-width="100"
          max-width="250"
          class="rounded-lg flex-shrink-0 ma-3 bg-grey-lighten-4"
          cover
          :src="item.foodItem.category.imageUrl">
      </v-img>
      <v-img
          v-else
          height="100"
          width="100"
          min-width="100"
          max-width="250"
          class="rounded-lg flex-shrink-0 ma-3 bg-grey-lighten-4"
          cover
          src="https://api.minio.christakis.dev/storage-images/image-not-found.png">
      </v-img>


      <div class="flex-grow-1 py-2 pr-2" style="min-width: 0; overflow: hidden;">
        <!-- Title row with icon aligned -->
        <div class="d-flex align-start" style="min-width: 0;">
          <span class="text-body-1 text-start font-weight-medium text-truncate" style="min-width: 0; flex: 1;">
            {{item.foodItem.brand}} - {{item.foodItem.productName}}
          </span>
          <v-btn
              density="compact"
              variant="text"
              :icon="icons.mdiTrashCanOutline"
              class="flex-shrink-0 ml-1"
              size="small"
              @click.stop="deleteItem"
          ></v-btn>
        </div>

        <v-card-subtitle class="text-start pa-0 mt-1">
          <v-icon :icon="icons.mdiBarcode" size="small"></v-icon> {{item.foodItem.barcode}}
        </v-card-subtitle>

        <div class="d-flex flex-wrap align-center justify-space-between mt-3 ga-2">
          <v-number-input
              controlVariant="split"
              variant="solo"
              flat
              :min="0"
              density="compact"
              hide-details
              rounded="lg"
              bg-color="grey-lighten-4"
              style="max-width: 140px;"
              v-model="localQuantity">
          </v-number-input>
          <v-chip size="small" :color="item.quantity === 0 ? 'error' : 'success'">{{item.quantity === 0 ? 'Out of stock' : item.quantity + ' left'}}</v-chip>
        </div>
      </div>
    </div>

    <v-dialog v-model="isDeleteDialogOpen" max-width="500px" @click.stop>
      <v-card>
        <v-card-title class="text-h5">Confirm Deletion</v-card-title>
        <v-card-text>
          Are you sure you want to delete '{{ item.foodItem.brand }} - {{ item.foodItem.productName }}'? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="isDeleteDialogOpen = false">Cancel</v-btn>
          <v-btn color="red-darken-1" variant="text" @click="confirmDeleteItem">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<style scoped>

</style>
