import {createRouter, createWebHashHistory, createWebHistory} from "vue-router";
import ItemDetailView from "../components/ItemDetailComponent.vue";
import StorageListComponent from "../components/StorageListComponent.vue";
import {getUser, login, handleLoginCallback} from "./authService.js";
import LocationsComponent from "../components/LocationsComponent.vue";

const routes = [
    {
        path: '/',
        name: 'home',
        meta: { requiresAuth: true },
        component: StorageListComponent },
    {
        path: '/item/:id',
        name: 'item-detail',
        meta: { requiresAuth: true },
        component: ItemDetailView },
    {
        path: '/locations',
        name: 'locations',
        meta: { requiresAuth: true },
        component: LocationsComponent },
    {
        path: '/login/callback',
        meta: { requiresAuth: false },
        component: {
            async created() {
                try {
                    await handleLoginCallback();
                    this.$router.push('/'); // Redirect to home after login
                } catch (e) {
                    console.error(e);
                    this.$router.push('/error'); // Or show an error page
                }
            }
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, from) => {
    // Skip authentication entirely if disabled via environment variable
    if (import.meta.env.VITE_DISABLE_AUTH === 'true') {

        console.log("Skipping authentication check because VITE_DISABLE_AUTH is set to true");

        return true;
    }

    if (to.meta.requiresAuth) {
        const user = await getUser();
        if (user && !user.expired) {
            return true; // User is authenticated, proceed
        } else {
            login(); // User is not authenticated, redirect to login
            return false; // Abort the current Vue Router navigation while the browser redirects
        }
    } else {
        return true; // Route does not require auth
    }
});

export default router;
