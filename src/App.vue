<script>
import HelloWorld from "./components/HelloWorld.vue";
import {QrcodeStream} from 'vue-qrcode-reader';
import axios from 'axios';
import {ref} from 'vue';
import { debounce } from 'lodash';


export default {
  components: {
    HelloWorld,
    QrcodeStream
  },
  data() {
    return {
      show: true,
      showCamera: false,
      items: [],
      foodItemToAdd: {"name": "", "number": 0, "checked": false, "key": crypto.randomUUID()},
      foodItemsDone: [],
      tab: "storage",
      storageList: [],
      barcodeFound: false,
      barcodeScanned: "",
      loading: false
    }
  },
  methods: {
    getAllItems() {
      axios.get('/api/item/')
          .then((response) => {
            console.log("Got all the Data");
            this.storageList = response.data;
          })
          .catch((error) => {
            console.log(error);
          })
    },
    updateQuantity(itemId, newValue) {
      console.log(itemId);

      console.log(newValue)
      const item = this.storageList.find(i => i.id === itemId);

      // Ensure we compare numbers to numbers
      const numericValue = Number(newValue);

      if (item && !isNaN(numericValue) && numericValue !== Number(item.quantity)) {
        this.debouncedSave(itemId, numericValue);
      }
    },
    async syncWithBackend(itemId, value) {
      try {
        const response = await axios.put(`/api/item/${itemId}/${value}`);
        console.log('Saved:', response.data);
        //this.getAllItems();
      } catch (error) {
        console.error('Error saving:', error);
      }
    },
    onDetect(detectedCodes, isActive) {
      if (detectedCodes.length > 0) {
        const barcode = detectedCodes[0].rawValue;
        this.loading = true;
        this.barcodeFound = true;
        this.barcodeScanned = barcode;

        axios.get('/api/openfoodfacts/test/' + barcode)
            .then((response) => {
              const updatedItem = response.data;

              const index = this.storageList.findIndex(i => i.id === updatedItem.id);

              if (index !== -1) {
                this.storageList[index] = updatedItem;
              } else {

                this.storageList.unshift(updatedItem);
              }

              this.loading = false;
              this.barcodeFound = false;
              this.barcodeScanned = "";
              isActive.value = false;
            })
            .catch((error) => {
              this.loading = false;
              this.barcodeFound = false;
              this.barcodeScanned = "";
              isActive.value = false;
              console.error("Scanning error:", error);
            });
      }
    },
    onDelete(detectedCodes, isActive) {
      if (detectedCodes.length > 0) {
        const barcode = detectedCodes[0].rawValue;
        this.loading = false;
        this.barcodeFound = false;
        isActive.value = false;
        this.barcodeScanned = barcode;

        axios.get('/api/item/reduce/' + barcode)
            .then((response) => {
              const updatedItem = response.data;

              if (updatedItem) {
                // Find the item in your local list
                const index = this.storageList.findIndex(i => i.barcode === barcode);

                if (index !== -1) {
                  // Update only this specific item in the array
                  this.storageList[index].quantity = updatedItem.quantity;
                }
              }

              this.loading = false;
              this.barcodeFound = false;
              isActive.value = false;
            })
            .catch((error) => {
              this.loading = false;
              this.barcodeFound = false;
              this.barcodeScanned = "";
              isActive.value = false;
              console.error("Delete error:", error);
            });
      }
    },
    addNewItem(item) {
      const newKey = Math.max(...this.items.map(item => item.key), 0) + 1;
      this.items.push({...item, key: newKey})
      this.foodItemToAdd = {"name": "", "number": 0, "checked": false}
    },
    deleteItemFromList(key) {
      const index = this.items.findIndex(item => item.key === key);
      if (index !== -1) {
        this.items.splice(index, 1);
      }
    },
    deleteItemFromDoneList(key) {
      const index = this.foodItemsDone.findIndex(item => item.key === key);
      if (index !== -1) {
        this.foodItemsDone.splice(index, 1);
      }
    },
    moveItemToDone(item) {
      const index = this.items.findIndex(i => i.key === item.key);
      if (index !== -1) {
        this.foodItemsDone.push({...item});
        this.items.splice(index, 1);
      }
    },
    moveItemBackToActive(item) {
      const index = this.foodItemsDone.findIndex(i => i.key === item.key);
      if (index !== -1) {
        item.checked = false;
        this.items.push({...item});
        this.foodItemsDone.splice(index, 1);
      }
    },
    onItemCheck(key) {
      const item = this.items.find(i => i.key === key);
      if (item && item.checked) {
        this.moveItemToDone(item);
      }
    }
  },
  mounted() {
    console.log("Got the Data on the mount")
    this.getAllItems();
  },
  beforeUnmount() {
    this.debouncedSave.cancel();
  },
  created() {
    this.debouncedSave = debounce((item, value) => {
      this.syncWithBackend(item, value);
    }, 500);
  }
}
</script>

<template>
  <v-app>
    <v-app-bar app>
      <v-app-bar-title>Storage Solution</v-app-bar-title>
    </v-app-bar>
    <v-main>

      <v-tabs v-model="tab" align-tabs="center">
        <v-tab value="shoppingList">
          <v-icon icon="mdi-cart"></v-icon>
        </v-tab>
        <v-tab value="storage">
          <v-icon icon="mdi-store"></v-icon>
        </v-tab>
      </v-tabs>
      <v-divider></v-divider>

      <v-tabs-window v-model="tab">
        <v-tabs-window-item key="shoppingList" value="shoppingList">
          <qrcode-stream
              v-if="showCamera"
              @detect="onDetect"
              :formats="['qr_code', 'code_128', 'ean_8', 'ean_13', 'upc_e', 'upc_a']">
          </qrcode-stream>

          <v-container fluid style="height: calc(100vh - 104px); overflow: auto;">
            <div class="d-flex w-100" v-for="item in items" :key="item.key">
              <v-checkbox
                  density="compact"
                  @change="onItemCheck(item.key)"
                  v-model="item.checked">
              </v-checkbox>
              <v-text-field
                  :style="item.checked ?  'text-decoration: line-through' : ''"
                  v-model="item.name"
                  :disabled="item.checked"
                  @click:append="deleteItemFromList(item.key)"
                  density="compact"
                  append-icon="mdi-delete"
                  clearable
                  placeholder="Lebensmittel hinzufügen"
                  variant="outlined">
              </v-text-field>
            </div>

            <div class="d-flex w-100 justify-center">
              <v-btn @click="addNewItem(foodItemToAdd)" prepend-icon="mdi-plus" variant="text">
              </v-btn>
              <v-btn
                  variant="text"
                  @click="showCamera = !showCamera"
                  prepend-icon="mdi-barcode-scan"
                  class="mb-4">
              </v-btn>
            </div>

            <v-divider style="margin-bottom: 100px"></v-divider>

            <div class="d-flex w-100" v-for="item in foodItemsDone" :key="'done-' + item.key">
              <v-checkbox
                  density="compact"
                  :model-value="true"
                  @change="moveItemBackToActive(item)">
              </v-checkbox>
              <v-text-field
                  v-model="item.name"
                  style="text-decoration: line-through"
                  disabled
                  @click:append="deleteItemFromDoneList(item.key)"
                  density="compact"
                  append-icon="mdi-delete"
                  placeholder="Erledigtes Item"
                  variant="outlined">
              </v-text-field>
            </div>
          </v-container>
        </v-tabs-window-item>
        <v-tabs-window-item key="storage" value="storage">
          <div class="d-flex justify-center" style="padding: 16px; gap: 8px">
            <v-dialog>
              <template v-slot:activator="{ props: activatorProps }">
                <v-btn v-bind="activatorProps" style=" width: 50%" prepend-icon="mdi-barcode" @click="showCamera = !showCamera">Hinzufügen</v-btn>
              </template>
              <template v-slot:default="{ isActive }">
                <v-card :disabled="loading" :loading="loading">

                  <template v-slot:loader="{isActive}">
                    <v-progress-linear
                        :active="isActive"
                        color="deep-purple"
                        height="4"
                        indeterminate
                    ></v-progress-linear>
                  </template>

                  <qrcode-stream
                      v-if="showCamera"
                      @detect="(codes) => onDetect(codes, isActive)"
                      :formats="['qr_code', 'code_128', 'ean_8', 'ean_13', 'upc_e', 'upc_a']">
                  </qrcode-stream>

                  <v-card-title>Barcode</v-card-title>
                  <v-card-subtitle v-if="!barcodeFound">Barcode wird gesucht. Bitte warten</v-card-subtitle>
                  <v-card-text v-else>Barcode erkannt. Nummer : {{barcodeScanned}}. Wird der Lagerliste hinzugefügt.
                    Bitte warten</v-card-text>
                </v-card>

              </template>
            </v-dialog>

            <v-dialog>
              <template v-slot:activator="{ props: activatorProps }">
                <v-btn v-bind="activatorProps"  style=" width: 50%" prepend-icon="mdi-barcode" @click="showCamera = !showCamera">Löschen</v-btn>
              </template>
              <template v-slot:default="{ isActive }">
                <v-card :disabled="loading" :loading="loading">

                  <template v-slot:loader="{isActive}">
                    <v-progress-linear
                        :active="isActive"
                        color="deep-purple"
                        height="4"
                        indeterminate
                    ></v-progress-linear>
                  </template>

                  <qrcode-stream
                      v-if="showCamera"
                      @detect="(codes) => onDelete(codes, isActive)"
                      :formats="['qr_code', 'code_128', 'ean_8', 'ean_13', 'upc_e', 'upc_a']">
                  </qrcode-stream>

                  <v-card-title>Barcode</v-card-title>
                  <v-card-subtitle v-if="!barcodeFound">Barcode wird gesucht. Bitte warten</v-card-subtitle>
                  <v-card-text v-else>Barcode erkannt. Nummer : {{barcodeScanned}}. Wird von der Lagerliste verringert/auf 0 gesetzt.
                    Bitte warten</v-card-text>
                </v-card>

              </template>
            </v-dialog>
          </div>


          <v-container fluid style="height: calc(100dvh - 220px); overflow: auto; padding-bottom: 48px">
            <v-row dense>
              <v-col cols="6" v-for="item in storageList" :key="item.id">
                <v-card height="300" class="d-flex flex-column">
                  <v-card-title class="text-start" >
                    {{item.brand}}
                  </v-card-title>
                  <v-spacer></v-spacer>
                  <v-card-text class="text-start">
                    {{item.name}}
                  </v-card-text>

                  <v-card-subtitle class="text-start">
                    <v-icon icon="mdi-barcode"></v-icon>  {{item.barcode}}
                  </v-card-subtitle>

                  <v-card-actions style="margin-top: 24px">
                    <v-number-input controlVariant="split" @update:model-value="updateQuantity(item.id, $event)" :min=0 density="compact" hide-details v-model="item.quantity"></v-number-input>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>

          </v-container>

        </v-tabs-window-item>
      </v-tabs-window>


    </v-main>
    <v-footer app class="d-flex flex-column" style="max-height: 40px; height: 40px">Christakis</v-footer>
  </v-app>
</template>

<style scoped>
</style>
