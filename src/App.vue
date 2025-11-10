<script>
import HelloWorld from "./components/HelloWorld.vue";
import {QrcodeStream} from 'vue-qrcode-reader';

export default {
  components: {
    HelloWorld,
    QrcodeStream
  },
  data() {
    return {
      show: true,
      showCamera: false,
      items: [
        {"name": "BBQ", "number": 3, "checked": false, "key": 1},
        {"name": "Mustard", "number": 2, "checked": false, "key": 2},
        {"name": "Honey", "number": 1, "checked": false, "key": 3},
        {"name": "Ketchup", "number": 2, "checked": false, "key": 4},
        {"name": "Mayonnaise", "number": 1, "checked": false, "key": 5},
        {"name": "Olive Oil", "number": 4, "checked": false, "key": 6},
        {"name": "Vinegar", "number": 2, "checked": false, "key": 7},
        {"name": "Soy Sauce", "number": 3, "checked": false, "key": 8},
        {"name": "Hot Sauce", "number": 1, "checked": false, "key": 9},
        {"name": "Salt", "number": 5, "checked": false, "key": 10},
        {"name": "Pepper", "number": 4, "checked": false, "key": 11},
        {"name": "Garlic Powder", "number": 2, "checked": false, "key": 12},
        {"name": "Paprika", "number": 1, "checked": false, "key": 13},
        {"name": "Cumin", "number": 2, "checked": false, "key": 14},
        {"name": "Oregano", "number": 1, "checked": false, "key": 15},
        {"name": "Basil", "number": 2, "checked": false, "key": 16},
        {"name": "Thyme", "number": 1, "checked": false, "key": 17},
        {"name": "Cinnamon", "number": 3, "checked": false, "key": 18},
        {"name": "Vanilla Extract", "number": 1, "checked": false, "key": 19},
        {"name": "Brown Sugar", "number": 2, "checked": false, "key": 20}
      ],
      foodItemToAdd: {"name": "", "number": 0, "checked": false, "key": crypto.randomUUID()},
      foodItemsDone: [],
      tab: "storage",
      storageList: [
        {"name": "Ketchup", "number": 2, "checked": false, "key": 4},
        {"name": "Mayonnaise", "number": 1, "checked": false, "key": 5},
        {"name": "Olive Oil", "number": 4, "checked": false, "key": 6},
        {"name": "Vinegar", "number": 2, "checked": false, "key": 7},
        {"name": "Soy Sauce", "number": 3, "checked": false, "key": 8},
        {"name": "Hot Sauce", "number": 1, "checked": false, "key": 9}
      ]
    }
  },
  methods: {
    onDetect(detectedCodes) {
      console.log(detectedCodes);

      if (detectedCodes.length > 0) {
        const barcode = detectedCodes[0].rawValue;
        this.items.push({name: barcode, number: 1, checked: false});
        this.showCamera = false;
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
  },
  computed: {}
}
</script>

<template>
  <v-app>
    <v-app-bar>
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

          {{storageList}}
          <v-container>
            <v-list lines="one">
              <v-list-item v-for="item in storageList" :key="item.key" :title="item.name">
                <template v-slot:append>
                  <v-number-input control-variant="stacked" v-model="item.number" density="compact" variant="plain" center-affix></v-number-input>
                </template>
                <v-divider></v-divider>
              </v-list-item>
            </v-list>
          </v-container>

        </v-tabs-window-item>
      </v-tabs-window>


    </v-main>
    <v-footer class="d-flex flex-column" style="max-height: 40px; height: 40px">Christakis</v-footer>
  </v-app>
</template>

<style scoped>
</style>
