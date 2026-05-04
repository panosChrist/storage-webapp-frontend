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

    async updateLocation(locationId, locationData) {
        try {
            // Sends the DTO (e.g., { name: "New Name" }) to match your LocationUpdateDto
            const response = await apiClient.put(`/api/location/${locationId}`, locationData);
            console.log('Location updated:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error updating location:', error);
            throw error;
        }
    },

    async deleteLocation(locationId) {
        try {
            const response = await apiClient.delete(`/api/location/${locationId}`);
            console.log('Location deleted successfully');
            return response.data;
        } catch (error) {
            console.error('Error deleting location:', error);
            throw error;
        }
    },
    async createLocation(locationData) {
        try {
            // Sends the DTO (e.g., { name: "New Location" }) to match your LocationCreateDto
            const response = await apiClient.post('/api/location/', locationData);
            console.log('Location created:', response.data);
            return response.data; // This will return the newly created Location entity from the backend
        } catch (error) {
            console.error('Error creating location:', error);
            throw error;
        }
    },

    async getAllLocations() {
        try {
            const response = await apiClient.get('/api/location/all');
            console.log("Got all the Location data");
            return response.data;
        } catch (error) {
            console.log(error);
        }
    },

    async updateItemLocation(itemId, locationId) {
        try {
            const response = await apiClient.put(`/api/item/${itemId}/location/${locationId}`);
            return response.data;
        } catch (error) {
            console.error('Error updating location:', error);
            throw error;
        }
    },

    async addItemByBarcode(barcode) {
        try {
            const response = await apiClient.get('/api/item/', { params: { barcode } });
            return response.data;
        } catch (error) {
            console.error('Error adding item by barcode:', error);
            throw error;
        }
    },

    async checkIfItemExists(barcode) {
        try {
            const response = await apiClient.get('/api/item/exists/' + barcode);
            return response.data;
        } catch (error) {
            console.error('Error checking if item exists:', error);
            throw error;
        }
    },

    async deleteItem(itemId) {
      try {
          const response = await apiClient.delete(`/api/item/${itemId}`);
          return response.data;
      } catch (error) {
          console.error('Error deleting item:', error);
          throw error;
      }
    },

    async reduceItemByBarcode(barcode) {
        try {
            const response = await apiClient.get('/api/item/reduce/' + barcode);
            return response.data;
        } catch (error) {
            console.error('Error reducing item by barcode:', error);
            throw error;
        }
    },

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
    async getItemDetails(itemId) {
        try {
            const response = await apiClient.get(`/api/item/${itemId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching item details:', error);
            throw error;
        }
    },
    async putItemQuantity(itemId, newQuantity) {
        try {
            const response = await apiClient.put(`/api/item/${itemId}/${newQuantity}`);
            console.log('Saved:', response.data);
        } catch (error) {
            console.error('Error saving:', error);
        }
    },

    async streamAllItemsAxios(onDataReceived, onError) {
        // We use AbortController so we can close the connection if the user leaves the page
        const controller = new AbortController();
        let seenBytes = 0; // Keep track of what we've already read
        let buffer = "";   // <--- NEW: Store incomplete lines here

        try {
            await apiClient.get('/api/item/stream', {
                headers: {
                    'Accept': 'text/event-stream'
                },
                signal: controller.signal,
                onDownloadProgress: (progressEvent) => {
                    const responseText = progressEvent.event.target.responseText;

                    // Extract only the brand new text we haven't seen yet
                    const newChunk = responseText.substring(seenBytes);
                    seenBytes = responseText.length;

                    // 1. Add the new chunk to whatever was left over from the last event
                    buffer += newChunk;

                    // 2. Split the buffer by newlines
                    const lines = buffer.split('\n');

                    // 3. The last item in the array is EITHER an incomplete line
                    // OR an empty string (if the chunk ended perfectly with \n).
                    // We pop it off and save it in the buffer for the NEXT progress event.
                    buffer = lines.pop();

                    // 4. Safely process all complete lines
                    for (const line of lines) {
                        if (line.startsWith('data:')) {
                            try {
                                const jsonString = line.substring(5).trim();
                                if (jsonString) {
                                    const data = JSON.parse(jsonString);
                                    onDataReceived(data);
                                }
                            } catch (e) {
                                console.error("Error parsing stream chunk:", e, "Line:", line);
                            }
                        }
                    }
                }
            });
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log("Stream successfully disconnected by client.");
            } else {
                console.error("Stream connection failed:", error);
                if (onError) onError(error);
            }
        }

        return controller;
    },


}
