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
    }
}
