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
      streamController: null
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
      console.log('Put quantity called with itemId:', itemId, 'and value:', value)
      await itemService.putItemQuantity(itemId, value);
    },
    async startItemStream() {
      console.log("Starting real-time storage stream")

      this.streamController = await itemService.streamAllItemsAxios(
          (newData) => {
            // Vue's reactivity will automatically update the ItemCards
            // when this array is replaced with the fresh backend data.
            this.storageList = newData;
          },
          (error) => {
            console.error("Stream failed:", error);
            // Optional: Add logic here to reconnect after a few seconds
          }
      );
    }
  },
  async mounted() {
      await this.startItemStream();
  },
  beforeUnmount() {
    this.debouncedSave.cancel();

    if (this.streamController) {
      this.streamController.abort();
    }
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
