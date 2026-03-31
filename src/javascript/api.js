import axios from "axios";
import {getAccessToken} from "./authService.js";

const apiClient = axios.create();

apiClient.interceptors.request.use(
    async (config) => {
        const token = await getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const itemService = {
    async getAllItems() {
        try {
            const response = await apiClient.get('/api/item/all');
            console.log("Got all the Data");
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async getAllLocations() {
        try {
            const response = await apiClient.get('/api/location/');
            console.log("Got all the Location data");
            return response.data;
        } catch (error) {
            console.log(error);
        }
    },
    async getItemDetails(itemId) {
        try {
            const response = await apiClient.get(`/api/item/${itemId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching item details:', error);
            throw error;
        }
    }
}
