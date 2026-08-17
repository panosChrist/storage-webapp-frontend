<script>
import { useRoute } from 'vue-router';
import {itemService} from '../javascript/api';
import {mdiArrowLeft, mdiBarcode, mdiAlertCircle, mdiCheckCircle, mdiLeaf, mdiNutrition, mdiMapMarker, mdiShieldAlert, mdiAlertOctagon, mdiFire, mdiBiohazard, mdiClockOutline } from "@mdi/js";

export default {
  name: "ItemDetailComponent",
  data() {
    return {
      icons: {
        mdiArrowLeft,
        mdiBarcode,
        mdiAlertCircle,
        mdiCheckCircle,
        mdiLeaf,
        mdiNutrition,
        mdiMapMarker,
        mdiShieldAlert,
        mdiAlertOctagon,
        mdiFire,
        mdiBiohazard,
        mdiClockOutline
      },
      item: null,
      loading: true,
      error: null,
      locations: [],
      selectedLocationId: null,
      isUpdatingLocation: false,
    }
  },
  computed: {
    product() {
      return this.item?.product || this.item?.foodItem || {};
    }
  },
  methods: {
    goBack() {
      if (this.$router) {
        this.$router.back();
      } else {
        this.$emit('navigate', 'home');
      }
    },
    async handleLocationChange(newLocationId) {
      if (!newLocationId) return;

      this.isUpdatingLocation = true;
      try {
        await itemService.updateItemLocation(this.item.id, newLocationId);
        console.log("Location updated successfully!");
      } catch (error) {
        console.error("Failed to update location:", error);
      } finally {
        this.isUpdatingLocation = false;
      }
    }
  },
  async created() {
    const itemId = this.$route.params.id;

    try {
      const [itemData, locationsData] = await Promise.all([
        itemService.getItemDetails(itemId),
        itemService.getAllLocations()
      ]);

      this.item = itemData;
      this.locations = locationsData;

      this.selectedLocationId = this.item.location?.id || null;

    } catch (error) {
      console.error('Failed to load data:', error);
      this.error = 'Failed to load item details or locations';
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

  <!-- Content (only renders when item exists) -->
  <v-container
      v-else-if="item"
      style="height: calc(100vh - 140px); overflow-y: auto; background-color: #F5F5F5;"
      class="pb-16">
    
    <!-- Top Back Navigation -->
    <div class="d-flex align-center mb-4 pt-2">
      <v-btn
        icon
        variant="text"
        density="comfortable"
        color="#00483C"
        class="mr-2"
        @click="goBack"
        title="Back to Storage List"
      >
        <v-icon :icon="icons.mdiArrowLeft"></v-icon>
      </v-btn>
      <span class="text-caption font-weight-bold text-teal-darken-4 text-uppercase tracking-wider">
        STORAGE / ITEM DETAILS
      </span>
    </div>
    <v-card
        flat
        style="margin-bottom: 32px;">

      <div class="position-relative">
        <v-img
            height="260"
            cover
            class="bg-grey-lighten-4"
            :src="product.imageUrl || product.category?.imageUrl || 'https://api.minio.christakis.dev/storage-images/image-not-found.png'">
        </v-img>
        <v-chip
          v-if="product.imageSource === 'AI_GENERATED'"
          size="x-small"
          color="black"
          variant="flat"
          class="position-absolute ma-2 text-caption font-weight-bold"
          style="bottom: 0; right: 0; opacity: 0.85;"
          title="EU AI Act Article 50: Synthetic illustrative visual representation"
        >
          ✨ AI Generated • Illustrative
        </v-chip>
      </div>
      <v-card-title
          class="text-wrap text-start">
        {{ product.brand ? product.brand + ' - ' : '' }}{{ product.productName || 'Scanning product...' }}
      </v-card-title>
      <v-card-subtitle
          class="text-start"
          style="margin-bottom: 8px">
        <v-icon :icon="icons.mdiBarcode"
                style="margin-right: 8px">
        </v-icon>
        {{ product.barcode }}
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

    <!-- Non-Food Specifications Container (Flammable, Hazardous, Period After Opening) -->
    <v-card v-if="product.periodAfterOpeningMonths != null || product.isHazardous != null || product.isFlammable != null" flat style="margin-bottom: 32px;">
      <div class="d-flex justify-space-between align-center">
        <v-card-title class="text-start">
          <v-icon :icon="icons.mdiShieldAlert" style="margin-bottom: 4px" class="mr-1"></v-icon>
          Product Specifications
        </v-card-title>
      </div>

      <v-card-text>
        <v-row no-gutters>
          <v-col cols="4" class="border-e pa-3 align-self-stretch">
            <v-card-subtitle class="text-start pa-0 mb-2">Flammable</v-card-subtitle>
            <div class="d-flex align-center">
              <v-chip size="small" :color="product.isFlammable ? 'error' : 'grey-lighten-1'" label>
                {{ product.isFlammable ? 'YES' : 'NO' }}
              </v-chip>
            </div>
          </v-col>

          <v-col cols="4" class="border-e pa-3 align-self-stretch">
            <v-card-subtitle class="text-start pa-0 mb-2">Hazardous</v-card-subtitle>
            <div class="d-flex align-center">
              <v-chip size="small" :color="product.isHazardous ? 'warning' : 'grey-lighten-1'" label>
                {{ product.isHazardous ? 'YES' : 'NO' }}
              </v-chip>
            </div>
          </v-col>

          <v-col cols="4" class="pa-3 align-self-stretch">
            <v-card-subtitle class="text-start pa-0 mb-2">Period After Opening</v-card-subtitle>
            <v-card-title class="text-start text-uppercase pa-0 font-weight-bold" style="font-size: 1.1rem;">
              {{ product.periodAfterOpeningMonths ? product.periodAfterOpeningMonths + ' Months' : 'N/A' }}
            </v-card-title>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Safety Instructions Container -->
    <v-card v-if="product.safetyInstructions" flat style="margin-bottom: 32px;">
      <v-card-title class="text-start">
        <v-icon :icon="icons.mdiAlertOctagon" style="margin-bottom: 4px" class="mr-1" color="amber-darken-3"></v-icon>
        Safety Instructions & Directions
      </v-card-title>
      <v-card-text class="text-start text-body-1">
        {{ product.safetyInstructions }}
      </v-card-text>
    </v-card>

    <v-card
        v-if="product.ingredientsList && product.ingredientsList.length > 0"
        flat
        style="margin-bottom: 32px;">
      <v-card-title
          class="text-start">
        <v-icon :icon="icons.mdiLeaf">
        </v-icon>
        Ingredients
      </v-card-title>
      <div v-for="ingredients in product.ingredientsList" :key="ingredients.id">
        <v-card-text
            class="text-start"
            v-if="['de', 'German', 'en', 'English', 'el', 'Greek'].includes(ingredients.language)">
          <div class="text-caption text-uppercase font-weight-bold color-primary mb-1">{{ ingredients.language }}:</div>
          {{ingredients.ingredients}}
        </v-card-text>
      </div>
    </v-card>

    <!-- Nutrition Facts Container (Food Items Only) -->
    <v-card v-if="product.basicNutritionData" flat style="margin-bottom: 32px;">
      <div class="d-flex justify-space-between align-center">
        <v-card-title class="text-start"><v-icon :icon="icons.mdiNutrition" style="margin-bottom: 8px"></v-icon> Nutrition Facts</v-card-title>
        <v-card-subtitle class="text-start text-uppercase">per 100G</v-card-subtitle>
      </div>

      <v-card-text>
        <v-row no-gutters>
          <v-col cols="6"  align-self="stretch"  class=" border-b border-e">
            <v-card-subtitle class="text-start " style="padding-left: 0" >Calories</v-card-subtitle>
            <v-card-title class="text-start text-uppercase" style="padding-left: 0">{{product.basicNutritionData.energyKcal || 0}}</v-card-title>
          </v-col>
          <v-col cols="6" align-self="stretch" class="border-b" style="padding-left: 16px">
            <v-card-subtitle class="text-start" style="padding-left: 0" >Total FAT</v-card-subtitle>
            <v-card-title class="text-start text-uppercase" style="padding-left: 0">{{product.basicNutritionData.fatGrams || 0}}</v-card-title>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="6"  align-self="stretch"  class=" border-b border-e">
            <v-card-subtitle class="text-start " style="padding-left: 0" >Carbs</v-card-subtitle>
            <v-card-title class="text-start text-uppercase" style="padding-left: 0">{{product.basicNutritionData.carbohydratesGrams || 0}}</v-card-title>
          </v-col>
          <v-col cols="6" align-self="stretch" class="border-b" style="padding-left: 16px">
            <v-card-subtitle class="text-start" style="padding-left: 0" >Salt</v-card-subtitle>
            <v-card-title class="text-start text-uppercase" style="padding-left: 0">{{product.basicNutritionData.saltGrams || 0}}</v-card-title>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="6"  align-self="stretch"  class="border-e">
            <v-card-subtitle class="text-start " style="padding-left: 0" >Protein</v-card-subtitle>
            <v-card-title class="text-start text-uppercase" style="padding-left: 0">{{product.basicNutritionData.proteinGrams || 0}}</v-card-title>
          </v-col>
          <v-col cols="6" align-self="stretch"  style="padding-left: 16px">
            <v-card-subtitle class="text-start" style="padding-left: 0" >Sugar</v-card-subtitle>
            <v-card-title class="text-start text-uppercase" style="padding-left: 0">{{product.basicNutritionData.sugarGrams || 0}}</v-card-title>
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
