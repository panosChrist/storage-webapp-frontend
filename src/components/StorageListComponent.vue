// src/components/StorageComponent.vue
<script>
import { QrcodeStream } from 'vue-qrcode-reader';
import axios from 'axios';
import { debounce } from 'lodash';
import ItemCard from './ItemCard.vue';
import {itemService} from "../javascript/api.js";

export default {
  name: 'StorageComponent',
  components: {
    QrcodeStream,
    ItemCard
  },
  data() {
    return {
      storageList: [],

    };
  },
  methods: {
    updateQuantity(itemId, newValue) {
      const item = this.storageList.find(i => i.id === itemId);
      const numericValue = Number(newValue);

      if (item && !isNaN(numericValue)) {
        const oldValue = item.quantity;
        item.quantity = numericValue;

        if (numericValue !== Number(oldValue)) {
          this.debouncedSave(itemId, numericValue);
        }
      }
    },
    async syncWithBackend(itemId, value) {
      try {
        const response = await apiClient.put(`/api/item/${itemId}/${value}`);
        console.log('Saved:', response.data);
      } catch (error) {
        console.error('Error saving:', error);
      }
    },


  },
  async mounted() {
      console.log('Loading storage data');
      this.storageList = await itemService.getAllItems();
  },
  beforeUnmount() {
    this.debouncedSave.cancel();
  },
  created() {
    this.debouncedSave = debounce((item, value) => {
      this.syncWithBackend(item, value);
    }, 500);
  }
};
</script>

<template>


    <v-container fluid style="height: calc(100vh - 104px); overflow-y: auto; background-color: #F5F5F5; ">

      <ItemCard v-for="item in storageList" :key="item.id" :item="item" @update-quantity="updateQuantity"/>

    </v-container>

</template>
