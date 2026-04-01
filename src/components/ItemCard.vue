<script>
import {mdiInformationOutline, mdiBarcode} from "@mdi/js";

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
      icons: {
        mdiInformationOutline,
        mdiBarcode
      }
    }
  },
  emits: ['update-quantity'],
  methods: {
    updateQuantity(itemId, newValue) {
      // Just emit to the parent - don't process here
      this.$emit('update-quantity', itemId, newValue);
    },
    openDetails() {
      this.$router.push({ name: 'item-detail', params: { id: this.item.id } });
    }
  }
}
</script>

<template>
  <v-card style="margin-bottom: 16px; overflow: hidden;">
    <div class="d-flex flex-no-wrap" style="min-width: 0;">
      <v-img
          height="100"
          width="100"
          min-width="100"
          class="rounded-lg flex-shrink-0 ma-3"
          cover
          src="https://cdn.vuetifyjs.com/images/parallax/material.jpg">
      </v-img>

      <div class="flex-grow-1 py-2 pr-2" style="min-width: 0; overflow: hidden;">
        <!-- Title row with icon aligned -->
        <div class="d-flex align-start" style="min-width: 0;">
          <span class="text-body-1 text-start font-weight-medium text-truncate" style="min-width: 0; flex: 1;">
            {{item.brand}} - {{item.productName}}
          </span>
          <v-btn
              density="compact"
              variant="text"
              :icon="icons.mdiInformationOutline"
              class="flex-shrink-0 ml-1"
              size="small"
              @click="openDetails"
          ></v-btn>
        </div>

        <v-card-subtitle class="text-start pa-0 mt-1">
          <v-icon :icon="icons.mdiBarcode" size="small"></v-icon> {{item.barcode}}
        </v-card-subtitle>

        <div class="d-flex flex-wrap align-center justify-space-between mt-3 ga-2">
          <v-number-input
              controlVariant="split"
              variant="solo"
              flat
              @update:model-value="updateQuantity(item.id, $event)"
              :min="0"
              density="compact"
              hide-details
              rounded="lg"
              bg-color="grey-lighten-4"
              style="max-width: 140px;"
              :model-value="item.quantity">
          </v-number-input>
          <v-chip size="small">in stock</v-chip>
        </div>
      </div>
    </div>
  </v-card>
</template>

<style scoped>

</style>
