<script>
import { useRoute } from 'vue-router';
import {itemService} from '../javascript/api';
import {mdiBarcode,mdiAlertCircle, mdiCheckCircle, mdiLeaf, mdiNutrition, mdiMapMarker } from "@mdi/js";

export default {
  name: "ItemDetailComponent",
  data() {
    return {
      icons: {
        mdiBarcode,
        mdiAlertCircle,
        mdiCheckCircle,
        mdiLeaf,
        mdiNutrition,
        mdiMapMarker
      },
      item: null,
      loading: true,
      error: null,
      locations: [],
      selectedLocationId: null,
      isUpdatingLocation: false,
    }
  },
  methods: {
    async handleLocationChange(newLocationId) {
      if (!newLocationId) return;

      this.isUpdatingLocation = true;
      try {
        await itemService.updateItemLocation(this.item.id, newLocationId);
        console.log("Location updated successfully!");
        // Optional: Show a success toast/snackbar here
      } catch (error) {
        console.error("Failed to update location:", error);
        // Optional: Revert the dropdown if the API call fails
      } finally {
        this.isUpdatingLocation = false;
      }
    }
  },
  async created() {
    const itemId = this.$route.params.id;

    try {
      // 7. Fetch both the foodItem details and the locations at the same time
      const [itemData, locationsData] = await Promise.all([
        itemService.getItemDetails(itemId),
        itemService.getAllLocations()
      ]);

      this.item = itemData;
      this.locations = locationsData;

      // 8. Set the initial value of the dropdown.
      // Adjust 'location.id' based on how your backend returns the foodItem's current location!
      this.selectedLocationId = this.item.location?.id || null;

    } catch (error) {
      console.error('Failed to load data:', error);
      this.error = 'Failed to load foodItem details or locations';
    } finally {
      this.loading = false;
    }
  }
}
</script>

<template>
  <!-- Loading state -->
  <v-container
      v-if="loading"
      class="d-flex justify-center align-center"
      style="height: 200px;">
    <v-progress-circular
        indeterminate
        color="primary">
    </v-progress-circular>
  </v-container>

  <!-- Error state -->
  <v-container
      v-else-if="error">
    <v-alert
        type="error">
      {{ error }}
    </v-alert>
    <v-btn
        @click="$router.back()">
      Go Back
    </v-btn>
  </v-container>

  <!-- Content (only renders when foodItem exists) -->
  <v-container
      v-else-if="item"
      style="height: calc(100vh - 180px); overflow-y: auto; background-color: #F5F5F5; ">
    <v-card
        flat
        style="margin-bottom: 32px;">

      <v-img
          v-if="item.foodItem?.category?.imageUrl"
          :src="item.foodItem.category.imageUrl">
      </v-img>
      <v-img
          v-else
          src="https://api.minio.christakis.dev/storage-images/image-not-found.png">
      </v-img>

      <v-card-title
          class="text-wrap text-start">
        {{ item.foodItem.brand }} - {{ item.foodItem.productName }}
      </v-card-title>
      <v-card-subtitle
          class="text-start"
          style="margin-bottom: 8px">
        <v-icon :icon="icons.mdiBarcode"
                style="margin-right: 8px">
        </v-icon>
        {{ item.foodItem.barcode }}
      </v-card-subtitle>
      <v-chip
          label
          class="text-start mx-4 mb-4 w-100"
          style="max-width: calc(100% - 32px);"
          :color="item.quantity === 0 ? 'error' : 'success'">

        <v-icon
            :icon="item.quantity === 0 ? icons.mdiAlertCircle : icons.mdiCheckCircle"
            style="margin-right: 8px">
        </v-icon>
        {{ item.quantity === 0 ? 'Out of stock' : `Currently in stock: ${item.quantity}` }}
      </v-chip>
    </v-card>

    <v-card flat style="margin-bottom: 32px;">
      <v-card-title class="text-start">
        <v-icon :icon="icons.mdiMapMarker" style="margin-bottom: 4px"></v-icon>
        Storage Location
      </v-card-title>
      <v-card-text>
        <v-select
            v-model="selectedLocationId"
            :items="locations"
            item-title="name"
            item-value="id"
            label="Select Location"
            variant="outlined"
            density="comfortable"
            hide-details
            :loading="isUpdatingLocation"
            :disabled="isUpdatingLocation"
            @update:model-value="handleLocationChange"
        ></v-select>
      </v-card-text>
    </v-card>

    <v-card
        flat
        style="margin-bottom: 32px;">
      <v-card-title
          class="text-start">
        <v-icon :icon="icons.mdiLeaf">
        </v-icon>
        Ingredients
      </v-card-title>
      <div v-for="ingredients in item.foodItem.ingredientsList">
        <v-card-text
            class="text-start"
            v-if="ingredients.language === 'German'">
          {{ingredients.ingredients}}
        </v-card-text>
      </div>
    </v-card>

    <v-card flat style="margin-bottom: 32px;">
      <div class="d-flex justify-space-between align-center">
        <v-card-title class="text-start"><v-icon :icon="icons.mdiNutrition" style="margin-bottom: 8px"></v-icon> Nutrition Facts</v-card-title>
        <v-card-subtitle class="text-start text-uppercase">per 100G</v-card-subtitle>
      </div>

      <v-card-text>
        <v-row no-gutters>
          <v-col cols="6"  align-self="stretch"  class=" border-b border-e">
            <v-card-subtitle class="text-start " style="padding-left: 0" >Calories</v-card-subtitle>
            <v-card-title class="text-start text-uppercase" style="padding-left: 0">{{item.foodItem.basicNutritionData.energyKcal}}</v-card-title>
          </v-col>
          <v-col cols="6" align-self="stretch" class="border-b" style="padding-left: 16px">
            <v-card-subtitle class="text-start" style="padding-left: 0" >Total FAT</v-card-subtitle>
            <v-card-title class="text-start text-uppercase" style="padding-left: 0">{{item.foodItem.basicNutritionData.fatGrams}}</v-card-title>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="6"  align-self="stretch"  class=" border-b border-e">
            <v-card-subtitle class="text-start " style="padding-left: 0" >Carbs</v-card-subtitle>
            <v-card-title class="text-start text-uppercase" style="padding-left: 0">{{item.foodItem.basicNutritionData.carbohydratesGrams}}</v-card-title>
          </v-col>
          <v-col cols="6" align-self="stretch" class="border-b" style="padding-left: 16px">
            <v-card-subtitle class="text-start" style="padding-left: 0" >Salt</v-card-subtitle>
            <v-card-title class="text-start text-uppercase" style="padding-left: 0">{{item.foodItem.basicNutritionData.saltGrams}}</v-card-title>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="6"  align-self="stretch"  class="border-e">
            <v-card-subtitle class="text-start " style="padding-left: 0" >Protein</v-card-subtitle>
            <v-card-title class="text-start text-uppercase" style="padding-left: 0">{{item.foodItem.basicNutritionData.proteinGrams}}</v-card-title>
          </v-col>
          <v-col cols="6" align-self="stretch"  style="padding-left: 16px">
            <v-card-subtitle class="text-start" style="padding-left: 0" >Sugar</v-card-subtitle>
            <v-card-title class="text-start text-uppercase" style="padding-left: 0">{{item.foodItem.basicNutritionData.sugarGrams}}</v-card-title>
          </v-col>
        </v-row>
        <p class="text-caption text-start text-medium-emphasis font-italic mt-4">
          * Information retrieved via AI. Not 100% accurate. Read the label for more details.
        </p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>

</style>
