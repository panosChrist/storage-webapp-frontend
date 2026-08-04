---
name: frontend-guidelines
description: Architecture and coding guidelines for the storage-webapp-frontend Vue 3 Options API application.
---

# Storage WebApp Frontend Guidelines

## Architecture Overview
- **Framework**: Vue 3 using **Options API** (`export default { data(), methods, computed, mounted }`).
- **UI Component Library**: Vuetify 3 with Material Design Icons (`@mdi/js`).
- **Key Features**: Barcode scanner (`vue-qrcode-reader`, `barcode-detector`), API HTTP client (`axios`, `itemService`), Routing (`vue-router`).
- **Development Server**: HTTPS on port 5173 with automatic `/api` proxying to `http://localhost:8080`.

## Coding Standards
1. **Always use the Vue 3 Options API**: Structure components with `export default { data() { return {...} }, methods: {...}, mounted() {...} }`.
2. Maintain responsive, modern layouts using Vuetify 3 components (`v-container`, `v-card`, `v-btn`, `v-dialog`, etc.).
3. Use central API services (like `itemService` in `src/javascript/api.js`) for HTTP requests and SSE event streaming.
4. Handle API loading and error states gracefully with Vuetify progress indicators and snackbars.
