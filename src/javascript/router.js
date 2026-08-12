import {createRouter, createWebHashHistory, createWebHistory} from "vue-router";
import ItemDetailView from "../components/ItemDetailComponent.vue";
import StorageListComponent from "../components/StorageListComponent.vue";
import {getUser, login, handleLoginCallback} from "./authService.js";
import LocationsComponent from "../components/LocationsComponent.vue";
import SettingsHubComponent from "../components/SettingsHubComponent.vue";
import ThemeSelectionComponent from "../components/ThemeSelectionComponent.vue";
import ProfileDetailsComponent from "../components/ProfileDetailsComponent.vue";
import PlanBillingComponent from "../components/PlanBillingComponent.vue";
import NotificationSettingsComponent from "../components/NotificationSettingsComponent.vue";
import LoginComponent from "../components/LoginComponent.vue";

const routes = [
    {
        path: '/',
        name: 'home',
        meta: { requiresAuth: true },
        component: StorageListComponent },
    {
        path: '/login',
        name: 'login',
        meta: { requiresAuth: false },
        component: LoginComponent },
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
        path: '/settings',
        name: 'settings',
        meta: { requiresAuth: true },
        component: SettingsHubComponent },
    {
        path: '/settings/theme',
        name: 'theme-selection',
        meta: { requiresAuth: true },
        component: ThemeSelectionComponent },
    {
        path: '/settings/profile',
        name: 'profile-details',
        meta: { requiresAuth: true },
        component: ProfileDetailsComponent },
    {
        path: '/settings/billing',
        name: 'plan-billing',
        meta: { requiresAuth: true },
        component: PlanBillingComponent },
    {
        path: '/settings/notifications',
        name: 'notification-settings',
        meta: { requiresAuth: true },
        component: NotificationSettingsComponent },
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
            return { name: 'login' }; // Redirect to the login choice portal
        }
    } else {
        return true; // Route does not require auth
    }
});

export default router;
