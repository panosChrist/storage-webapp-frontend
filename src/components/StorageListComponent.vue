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
        categories: ['Pantry', 'Wine Cellar', 'Garage', 'Household'],
      },
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
        this.filters = {
          sortBy: 'newest',
          stockStatus: [],
          categories: []
        };
      }
    };
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
      const numericValue = Number(newValue);

      if (foodItem && !isNaN(numericValue)) {
        const oldValue = foodItem.quantity;
        foodItem.quantity = numericValue;

        if (numericValue !== Number(oldValue)) {
          this.debouncedSave(itemId, numericValue);
        }
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
            this.storageList = newData;
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
    }
  },
  async mounted() {
    try {
      this.storageList = await itemService.getAllItems();
    } catch (error) {
      console.error("Failed to load initial items", error);
    } finally {
      this.isLoading = false;
    }
    await this.startItemStream();
    try {
      this.locationList = await itemService.getAllLocations();
    } catch (error) {
      console.error('Failed to load storage data:', error.message);
    }
  },
  beforeUnmount() {
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
            <v-text-field density="compact"  :prepend-inner-icon="icons.mdiMagnify" variant="solo" style="margin-right: 16px" clearable label="Search"> </v-text-field>


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
                    <v-chip value="name">Name Asc</v-chip>
                    <v-chip value="name">Name Desc</v-chip>
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

<!--            <v-menu location="bottom end" transition="scale-transition">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" :icon="icons.mdiFilterVariant" density="comfortable"></v-btn>
              </template>

              <v-list density="compact" min-width="200" elevation="3">
                <v-list-subheader>Sort & Filter</v-list-subheader>
                <v-list-item
                  v-for="(option, i) in filterOptions"
                  :key="i"
                  :value="option.value"
                  @click="applyFilter(option.value)"
                >
                  <v-list-item-title>{{ option.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>-->
          </div>




        </v-card>

        <ItemCard
            v-for="item in storageList"
            :key="item.id"
            :item="item"
            @update-quantity="updateQuantity"
        />
      </template>

    </v-container>

</template>
