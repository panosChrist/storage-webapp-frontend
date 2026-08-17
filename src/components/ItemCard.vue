<script>
import { mdiInformationOutline, mdiBarcode, mdiImageOffOutline, mdiTrashCanOutline, mdiRefresh, mdiAlertCircle } from "@mdi/js";
import { itemService } from "../javascript/api.js";

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
      isRetrying: false,
      icons: {
        mdiInformationOutline,
        mdiBarcode,
        mdiImageOffOutline,
        mdiTrashCanOutline,
        mdiRefresh,
        mdiAlertCircle
      }
    }
  },
  emits: ['update-quantity', 'item-deleted'],
  methods: {
    updateQuantity(itemId, newValue) {
      // Just emit to the parent - don't process here
      this.$emit('update-quantity', itemId, newValue);
    },
    onQuantityChange(newVal) {
      const num = Number(newVal);
      if (!isNaN(num) && num >= 0 && num !== Number(this.item?.quantity)) {
        this.updateQuantity(this.item.id, num);
      }
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
    },
    async retrySearch() {
      if (!this.product?.barcode) return;
      this.isRetrying = true;
      try {
        await itemService.addItemByBarcode(this.product.barcode, this.item.location?.id);
      } catch (e) {
        console.error('Retry search failed:', e);
      } finally {
        this.isRetrying = false;
      }
    }
  },
  computed: {
    product() {
      return this.item?.product || this.item?.foodItem || {};
    },
    isSearching() {
      return this.item?.isSkeleton || this.product?.status === 'SEARCHING';
    },
    isFailed() {
      return this.product?.status === 'FAILED';
    }
  }
}
</script>

<template>
  <!-- Database-backed & Optimistic Status Skeleton Card -->
  <v-card v-if="isSearching" style="overflow: hidden;" class="pa-3 bg-grey-lighten-4 elevation-1 border-sm border-teal-lighten-3" rounded="lg">
    <div class="d-flex align-center">
      <v-skeleton-loader
        type="image"
        width="90"
        height="90"
        class="rounded-lg mr-3 flex-shrink-0"
      ></v-skeleton-loader>
      <div class="flex-grow-1 text-start" style="min-width: 0;">
        <div class="d-flex align-center mb-1">
          <v-progress-circular indeterminate size="18" width="2" color="#00483C" class="mr-2"></v-progress-circular>
          <span class="text-subtitle-2 font-weight-bold text-teal-darken-4 text-truncate">
            Searching product info...
          </span>
        </div>
        <div class="d-flex align-center justify-space-between mt-2 flex-wrap gap-2">
          <span class="px-2 py-1 rounded-pill text-caption font-weight-bold text-white" style="background-color: #00483C;">
            Barcode: {{ product.barcode }}
          </span>
          <v-chip size="small" color="#00483C" variant="flat" class="font-weight-bold text-white">
            Qty: {{ item.quantity }}
          </v-chip>
        </div>
      </div>
    </div>
  </v-card>

  <!-- Failed Status Error Card -->
  <v-card v-else-if="isFailed" style="overflow: hidden;" class="pa-3 bg-red-lighten-5 border-sm border-red-lighten-3 mb-2" rounded="lg">
    <div class="d-flex align-center justify-space-between text-start flex-wrap gap-2">
      <div class="d-flex align-center">
        <v-icon :icon="icons.mdiAlertCircle" color="error" size="32" class="mr-3"></v-icon>
        <div>
          <div class="text-subtitle-2 font-weight-bold text-error">
            Product Search Failed (3 Tries)
          </div>
          <div class="text-caption text-grey-darken-2">
            Barcode: <strong>{{ product.barcode }}</strong> &bull; Qty: {{ item.quantity }}
          </div>
        </div>
      </div>
      <div class="d-flex align-center gap-2">
        <v-btn
          color="error"
          size="small"
          variant="flat"
          class="text-white font-weight-bold text-none"
          :loading="isRetrying"
          @click="retrySearch"
        >
          <v-icon start :icon="icons.mdiRefresh" size="16"></v-icon>
          Retry Search
        </v-btn>
        <v-btn
          icon
          size="small"
          variant="text"
          color="grey-darken-1"
          @click.stop="deleteItem"
          title="Delete Item"
        >
          <v-icon :icon="icons.mdiTrashCanOutline"></v-icon>
        </v-btn>
      </div>
    </div>
  </v-card>

  <!-- Normal Item Card -->
  <v-card v-else style="overflow: hidden; " @click="openDetails">
    <div class="d-flex flex-no-wrap" style="min-width: 0;">
      <div class="position-relative ma-3 flex-shrink-0" style="width: 100px; height: 100px;">
        <v-img
            height="100"
            width="100"
            class="rounded-lg bg-grey-lighten-4"
            cover
            :src="product.imageUrl || product.category?.imageUrl || 'https://api.minio.christakis.dev/storage-images/image-not-found.png'">
        </v-img>
        <span
          v-if="product.imageSource === 'AI_GENERATED'"
          class="position-absolute px-1 rounded-sm text-caption font-weight-bold"
          style="bottom: 4px; right: 4px; background: rgba(0,0,0,0.65); color: #fff; font-size: 10px; line-height: 14px;"
          title="EU AI Act Disclosure: AI-Generated Synthetic Visual"
        >
          AI
        </span>
      </div>


      <div class="flex-grow-1 py-2 pr-2" style="min-width: 0; overflow: hidden;">
        <!-- Title row with icon aligned -->
        <div class="d-flex align-start" style="min-width: 0;">
          <span class="text-body-1 text-start font-weight-medium text-truncate" style="min-width: 0; flex: 1;">
            {{ product.brand ? product.brand + ' - ' : '' }}{{ product.productName || 'Scanning product...' }}
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
          <v-icon :icon="icons.mdiBarcode" size="small"></v-icon> {{ product.barcode }}
        </v-card-subtitle>

        <div class="d-flex flex-wrap align-center justify-space-between mt-3 ga-2" @click.stop>
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
              :model-value="item.quantity"
              @click.stop
              @mousedown.stop
              @touchstart.stop
              @update:model-value="onQuantityChange">
          </v-number-input>
          <v-chip size="small" :color="item.quantity === 0 ? 'error' : 'success'">{{item.quantity === 0 ? 'Out of stock' : item.quantity + ' left'}}</v-chip>
        </div>
      </div>
    </div>

    <v-dialog v-model="isDeleteDialogOpen" max-width="500px" @click.stop>
      <v-card>
        <v-card-title class="text-h5">Confirm Deletion</v-card-title>
        <v-card-text>
          Are you sure you want to delete '{{ product.brand ? product.brand + ' - ' : '' }}{{ product.productName || 'this item' }}'? This action cannot be undone.
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
