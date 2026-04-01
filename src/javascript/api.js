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

        try {
            await apiClient.get('/api/item/stream', {
                headers: {
                    'Accept': 'text/event-stream'
                },
                signal: controller.signal,
                // Axios fires this every time the backend sends a new chunk
                onDownloadProgress: (progressEvent) => {
                    const responseText = progressEvent.event.target.responseText;

                    // Extract only the brand new text we haven't seen yet
                    const newChunk = responseText.substring(seenBytes);
                    seenBytes = responseText.length;

                    // SSE sends data separated by newlines
                    const lines = newChunk.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data:')) {
                            try {
                                const jsonString = line.substring(5).trim();
                                if (jsonString) {
                                    const data = JSON.parse(jsonString);
                                    onDataReceived(data); // Send data to your UI components
                                }
                            } catch (e) {
                                console.error("Error parsing stream chunk", e);
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
    }
}
