// src/components/StorageComponent.vue
<script>
import { QrcodeStream } from 'vue-qrcode-reader';
import { debounce } from 'lodash';
import ItemCard from './ItemCard.vue';
import {itemService} from "../javascript/api.js";
import {mdiMapMarkerPlus, mdiPackageVariantClosed, mdiMagnify, mdiFilterVariant, mdiAlertOutline  } from "@mdi/js";

export default {
  name: 'StorageComponent',
  components: {
    QrcodeStream,
    ItemCard
  },
  data() {
    return {
      icons: {
        mdiMapMarkerPlus,
        mdiPackageVariantClosed,
        mdiMagnify,
        mdiFilterVariant,
        mdiAlertOutline
      },
      storageList: [],
      filterSheet: false, // Controls the visibility of the overlay
      filters: {
        sortBy: 'newest',
        stockStatus: [],
        categories: [],
      },
      searchQuery: '',
      streamController: null,
      isLoading: true,
      locationList: [],
      filterOptions: [
        { title: 'Sort by Name (A-Z)', value: 'name_asc' },
        { title: 'Sort by Name (Z-A)', value: 'name_desc' },
        { title: 'Sort by Quantity (High-Low)', value: 'qty_desc' },
        { title: 'Sort by Quantity (Low-High)', value: 'qty_asc' },
      ],
      selectedFilter: null,
      clearFilters() {
        this.searchQuery = '';
        this.filters = {
          sortBy: 'newest',
          stockStatus: [],
          categories: []
        };
      }
    };
  },
  computed: {
    filteredStorageList() {
      let list = [...this.storageList];

      // 1. Search Query Filter
      if (this.searchQuery && this.searchQuery.trim()) {
        const q = this.searchQuery.trim().toLowerCase();
        list = list.filter(item => {
          const product = item.product || item.foodItem || {};
          const name = (product.productName || '').toLowerCase();
          const brand = (product.brand || '').toLowerCase();
          const barcode = (product.barcode || '').toLowerCase();
          return name.includes(q) || brand.includes(q) || barcode.includes(q);
        });
      }

      // 2. Stock Status Filter
      if (this.filters.stockStatus && this.filters.stockStatus.length > 0) {
        list = list.filter(item => {
          const qty = Number(item.quantity) || 0;
          if (this.filters.stockStatus.includes('out_of_stock') && qty === 0) return true;
          if (this.filters.stockStatus.includes('low_stock') && qty === 1) return true;
          if (this.filters.stockStatus.includes('in_stock') && qty > 0) return true;
          return false;
        });
      }

      // 3. Category/Location Filter
      if (this.filters.categories && this.filters.categories.length > 0) {
        list = list.filter(item => {
          if (!item.location) return false;
          return this.filters.categories.some(cat => {
            if (typeof cat === 'object' && cat !== null) {
              return cat.id === item.location?.id;
            }
            return cat === item.location?.id || cat === item.location?.name;
          });
        });
      }

      // 4. Stable Deterministic Sorting
      if (this.filters.sortBy === 'name_asc') {
        list.sort((a, b) => {
          const nameA = (a.product?.productName || a.foodItem?.productName || '').toLowerCase();
          const nameB = (b.product?.productName || b.foodItem?.productName || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
      } else if (this.filters.sortBy === 'name_desc') {
        list.sort((a, b) => {
          const nameA = (a.product?.productName || a.foodItem?.productName || '').toLowerCase();
          const nameB = (b.product?.productName || b.foodItem?.productName || '').toLowerCase();
          return nameB.localeCompare(nameA);
        });
      } else if (this.filters.sortBy === 'qty_desc') {
        list.sort((a, b) => (Number(b.quantity) || 0) - (Number(a.quantity) || 0));
      } else if (this.filters.sortBy === 'qty_asc') {
        list.sort((a, b) => (Number(a.quantity) || 0) - (Number(b.quantity) || 0));
      } else {
        // Default 'newest': Active Skeletons first, then sort stably by createdDate DESC, then ID
        list.sort((a, b) => {
          if (a.isSkeleton && !b.isSkeleton) return -1;
          if (!a.isSkeleton && b.isSkeleton) return 1;
          const timeA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
          const timeB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
          if (timeB !== timeA) return timeB - timeA;
          return String(b.id || '').localeCompare(String(a.id || ''));
        });
      }

      return list;
    }
  },
  methods: {
    mdiMagnify() {
      return mdiMagnify
    },
    applyFilter(filterValue) {
      this.selectedFilter = filterValue;
      console.log('Applying filter/sort:', filterValue);
      // TODO: Add your logic here to actually sort or filter this.storageList
    },
    updateQuantity(itemId, newValue) {
      const foodItem = this.storageList.find(i => i.id === itemId);
      if (!foodItem) return;

      const numericValue = Number(newValue);
      if (isNaN(numericValue) || numericValue === null || numericValue === undefined || numericValue < 0) {
        return;
      }

      const oldValue = Number(foodItem.quantity);
      if (!isNaN(oldValue) && numericValue !== oldValue) {
        foodItem.quantity = numericValue;
        this.debouncedSave(itemId, numericValue);
      }
    },
    async syncWithBackend(itemId, value) {
      console.log('Put quantity called with itemId:', itemId, 'and value:', value)
      await itemService.putItemQuantity(itemId, value);
    },
    async startItemStream() {
      console.log("Starting real-time storage stream");

      itemService.streamAllItemsAxios(
          (newData) => {
            if (!newData) return;
            // Preserve active client-side skeletons if not yet in DB newData
            const activeSkeletons = this.storageList.filter(
              i => i.isSkeleton && !newData.some(n => (n.product?.barcode || n.foodItem?.barcode) === i.product?.barcode)
            );
            this.storageList = [...activeSkeletons, ...newData];
          },
          (error) => {
            console.error("Stream failed:", error);
          }
      ).then(controller => {
        this.streamController = controller;
      });
    },
    goToLocations() {
      this.$router.push('/locations');
    },
    async handleItemDeleted(itemId) {
      try {
        await itemService.deleteItem(itemId);
        this.storageList = this.storageList.filter(item => item.id !== itemId);
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
    },
    onOptimisticAdd(event) {
      const skeleton = event.detail;
      if (!skeleton) return;

      const barcode = skeleton.product?.barcode;
      if (barcode) {
        const existingItem = this.storageList.find(i => {
          const b = i.product?.barcode || i.foodItem?.barcode;
          return b === barcode;
        });

        if (existingItem) {
          // Deduplicate: increment quantity on existing card instead of unshifting duplicate
          existingItem.quantity = (Number(existingItem.quantity) || 0) + 1;
          return;
        }
      }

      this.storageList.unshift(skeleton);
    },
    onOptimisticComplete(event) {
      const { skeletonId, newItem } = event.detail || {};
      const index = this.storageList.findIndex(i => i.id === skeletonId);
      if (index !== -1) {
        if (newItem && newItem.id) {
          this.storageList.splice(index, 1, newItem);
        } else {
          this.storageList.splice(index, 1);
        }
      }
    },
    onOptimisticError(event) {
      const { skeletonId } = event.detail || {};
      this.storageList = this.storageList.filter(i => i.id !== skeletonId);
    }
  },
  async mounted() {
    window.addEventListener('optimistic-item-add', this.onOptimisticAdd);
    window.addEventListener('optimistic-item-complete', this.onOptimisticComplete);
    window.addEventListener('optimistic-item-error', this.onOptimisticError);

    try {
      const [items, locations] = await Promise.all([
        itemService.getAllItems(),
        itemService.getAllLocations()
      ]);
      this.storageList = items || [];
      this.locationList = locations || [];
    } catch (error) {
      console.error("Failed to load initial storage data", error);
    } finally {
      this.isLoading = false;
    }
    this.startItemStream();
  },
  beforeUnmount() {
    window.removeEventListener('optimistic-item-add', this.onOptimisticAdd);
    window.removeEventListener('optimistic-item-complete', this.onOptimisticComplete);
    window.removeEventListener('optimistic-item-error', this.onOptimisticError);

    this.debouncedSave.cancel();

    if (this.streamController) {
      this.streamController.abort();
    }
  },
  created() {
    this.debouncedSave = debounce((foodItem, value) => {
      this.syncWithBackend(foodItem, value);
    }, 500);
  },
};
</script>

<template>

    <v-container fluid style="height: calc(100vh - 180px); overflow-y: auto; background-color: #F5F5F5; ">

      <div v-if="isLoading" class="d-flex justify-center align-center" style="height: 100%;">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      </div>

      <div v-else-if="locationList.length === 0" class="d-flex flex-column justify-center align-center text-center" style="height: 100%;">
        <v-icon size="80" color="grey-lighten-1" class="mb-4" :icon="icons.mdiPackageVariantClosed"></v-icon>
        <h3 class="text-h5 text-grey-darken-1 mb-2">Your storage is empty</h3>
        <p class="text-body-1 text-grey mb-6">Create a location first to start adding items.</p>

        <v-btn
            color="primary"
            :prepend-icon="icons.mdiMapMarkerPlus"
            @click="goToLocations"
        >
          Go to Locations
        </v-btn>
      </div>

      <div v-else-if="storageList.length === 0"  class="d-flex flex-column justify-center align-center text-center" style="height: 100%;">
        <v-icon size="80" color="grey-lighten-1" class="mb-4" :icon="icons.mdiPackageVariantClosed"></v-icon>
        <h3 class="text-h5 text-grey-darken-1 mb-2">Your storage is empty</h3>
        <p class="text-body-1 text-grey mb-6">Click on the icon to add items to your storage.</p>
      </div>

      <template v-else>

        <v-card flat style="margin-bottom: 32px; background-color: #F5F5F5;" >

          <div class="d-inline-flex w-100 justify-center ">
            <v-text-field
              v-model="searchQuery"
              density="compact"
              :prepend-inner-icon="icons.mdiMagnify"
              variant="solo"
              style="margin-right: 16px"
              clearable
              label="Search">
            </v-text-field>

            <v-btn :icon="icons.mdiFilterVariant" @click="filterSheet = true" density="comfortable"></v-btn>

            <v-bottom-sheet v-model="filterSheet">
              <v-card class="pa-4" rounded="t-xl">
                <div class="d-flex justify-space-between align-center mb-6">
                  <h2 class="text-h5 font-weight-bold" style="color: #0F4238">Filters</h2>
                  <v-btn variant="text" color="teal-darken-4" @click="clearFilters">Clear All</v-btn>
                </div>

                <div class="mb-6">
                  <p class="text-subtitle-1 font-weight-bold mb-2">Sort By</p>
                  <v-chip-group v-model="filters.sortBy" mandatory selected-class="bg-teal-darken-4 text-white">
                    <v-chip value="newest" filter>Newest</v-chip>
                    <v-chip value="name_asc">Name (A-Z)</v-chip>
                    <v-chip value="name_desc">Name (Z-A)</v-chip>
                    <v-chip value="qty_desc">Qty (High-Low)</v-chip>
                    <v-chip value="qty_asc">Qty (Low-High)</v-chip>
                  </v-chip-group>
                </div>

                <div class="mb-6">
                  <p class="text-subtitle-1 font-weight-bold mb-2">Stock Status</p>
                  <v-chip-group v-model="filters.stockStatus" multiple>
                    <v-chip value="in_stock" variant="tonal">In Stock</v-chip>
                    <v-chip value="low_stock" color="orange-lighten-4" variant="flat" class="text-orange-darken-4">
                      Low Stock <v-icon end :icon="icons.mdiAlertOutline"></v-icon>
                    </v-chip>
                    <v-chip value="out_of_stock" variant="tonal">Out of Stock</v-chip>
                  </v-chip-group>
                </div>

                <div class="mb-8">
                  <div class="d-flex justify-space-between mb-2">
                    <p class="text-subtitle-1 font-weight-bold">Categories</p>
                    <span class="text-grey">{{ filters.categories.length }} selected</span>
                  </div>
                  <v-chip-group v-model="filters.categories" multiple column>
                    <v-chip
                        v-for="cat in locationList"
                        :key="cat"
                        :value="cat"
                        closable
                        color="blue-lighten-5"
                        class="text-blue-darken-4"
                    >
                      {{ cat.name }}
                    </v-chip>
                  </v-chip-group>
                </div>

                <v-btn block color="#0F4238" size="x-large" class="text-white rounded-lg" @click="filterSheet = false">
                  Show Results
                </v-btn>
              </v-card>
            </v-bottom-sheet>
          </div>
        </v-card>

        <div v-if="filteredStorageList.length === 0" class="d-flex flex-column justify-center align-center text-center py-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-3" :icon="icons.mdiMagnify"></v-icon>
          <h4 class="text-h6 text-grey-darken-1 mb-1">No items found</h4>
          <p class="text-body-2 text-grey mb-4">Try adjusting your search query or active filters.</p>
          <v-btn variant="tonal" size="small" color="primary" @click="clearFilters">Clear Filters</v-btn>
        </div>

        <v-row v-else density="compact">
          <v-col
              v-for="item in filteredStorageList"
              :key="item.id"
              cols="12">
            <ItemCard
                :item="item"
                @update-quantity="updateQuantity"
                @item-deleted="handleItemDeleted"
            />
          </v-col>
        </v-row>
      </template>

    </v-container>

</template>
