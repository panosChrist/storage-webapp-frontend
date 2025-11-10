<script>
export default {
  props: ['foodItemToAdd'],
}
</script>

<template>
  <v-text-field
      density="compact"
      prepend-icon="mdi-drag"
      append-icon="mdi-delete"
      clearable
      variant="outlined">
  </v-text-field>
</template>

<style scoped>
</style>
