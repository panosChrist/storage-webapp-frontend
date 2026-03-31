import {createRouter, createWebHashHistory, createWebHistory} from "vue-router";
import ItemDetailView from "../components/ItemDetailComponent.vue";
import StorageListComponent from "../components/StorageListComponent.vue";
import {getUser, login, handleLoginCallback} from "./authService.js";

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

router.beforeEach(async (to, from, next) => {
    if (to.meta.requiresAuth) {
        const user = await getUser();
        if (user && !user.expired) {
            next(); // User is authenticated, proceed
        } else {
            login(); // User is not authenticated, redirect to login
        }
    } else {
        next(); // Route does not require auth
    }
});

export default router;
