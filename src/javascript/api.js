import axios from "axios";

export const itemService = {
    async getAllItems() {
        try {
            const response = await axios.get('/api/item/all');
            console.log("Got all the Data");
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async getAllLocations() {
        try {
            const response = await axios.get('/api/location/');
            console.log("Got all the Location data");
            return response.data;
        } catch (error) {
            console.log(error);
        }
    },
    async getItemDetails(itemId) {
        try {
            const response = await axios.get(`/api/item/${itemId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching item details:', error);
            throw error;
        }
    }
}
