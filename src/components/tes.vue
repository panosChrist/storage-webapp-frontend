<script>
export default {
  name: "tes"
}
</script>

<template>
  <v-col cols="12">
    <v-card color="#1F7087">
      <div class="d-flex flex-no-wrap justify-space-between">
        <div>
          <v-card-title class="text-headline-small">
            Supermodel
          </v-card-title>

          <v-card-subtitle>Foster the People</v-card-subtitle>

          <v-card-actions>
            <v-btn
                class="ms-2"
                size="small"
                text="START RADIO"
                variant="outlined"
            ></v-btn>
          </v-card-actions>
        </div>

        <v-avatar
            class="ma-3"
            rounded="0"
            size="125"
        >
          <v-img src="https://cdn.vuetifyjs.com/images/cards/foster.jpg"></v-img>
        </v-avatar>
      </div>
    </v-card>
  </v-col>










  <v-card-subtitle class="text-start">
    <v-icon icon="mdi-barcode"></v-icon>  {{item.barcode}}
  </v-card-subtitle>



</template>

<style scoped>

</style>
