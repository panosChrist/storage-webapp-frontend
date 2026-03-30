import {createRouter, createWebHashHistory} from "vue-router";
import ItemDetailView from "../components/ItemDetailComponent.vue";
import StorageListComponent from "../components/StorageListComponent.vue";

const routes = [
    { path: '/', name: 'home', component: StorageListComponent },
    { path: '/item/:id', name: 'item-detail', component: ItemDetailView },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;
