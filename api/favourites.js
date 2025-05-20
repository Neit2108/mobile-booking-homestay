import axios from "axios";
import { API_URL } from "../constants/config";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include the auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Add a place to favourites
 * @param {Object} favouriteRequest - Object containing placeId or other necessary info
 * @returns {Promise<string>} - Response message
 */
export const addFavourite = async (favouriteRequest) => {
  try {
    const response = await apiClient.post("/favourite/add", favouriteRequest);
    return response.data;
  } catch (error) {
    console.error("Error adding favourite:", error);
    throw new Error("Failed to add favourite.");
  }
};

/**
 * Remove a place from favourites
 * @param {Object} favouriteRequest - Object containing placeId or other necessary info
 * @returns {Promise<string>} - Response message
 */
export const removeFavourite = async (favouriteRequest) => {
  try {
    const response = await apiClient.delete("/favourite/remove", {
      data: favouriteRequest,
    });
    return response.data;
  } catch (error) {
    console.error("Error removing favourite:", error);
    throw new Error("Failed to remove favourite.");
  }
};

/**
 * Get all favourite places of the current user
 * @returns {Promise<Array>} - List of favourite places
 */
export const getFavouritesByUser = async () => {
  try {
    const response = await apiClient.get("/favourite/get-by-user-id");

    const favourites = response.data.map((place) => {
      if (!place.images || place.images.length === 0) {
        place.images = [
          {
            imageUrl: `https://source.unsplash.com/random/300x200/?hotel,${place.id}`,
          },
        ];
      }
      return place;
    });

    return favourites;
  } catch (error) {
    console.error("Error fetching favourites:", error);
    throw new Error("Failed to load favourite places.");
  }
};

export default {
  addFavourite,
  removeFavourite,
  getFavouritesByUser,
};
