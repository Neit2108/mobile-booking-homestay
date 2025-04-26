import axios from "axios";
import { API_URL } from "../constants/config";
import { setAuthToken } from "./auth";
import { formatPrice } from "../utils/formatPrice";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Get top rated places
 * @param {number} limit - Number of places to fetch
 * @returns {Promise} - Response data
 */
export const getTopRatedPlaces = async (limit = 5) => {
  try {
    const response = await apiClient.get(`/places/top-rating?limit=${limit}`);

    // Add placeholder image URLs if missing
    const places = response.data.map((place) => {
      if (!place.images || place.images.length === 0) {
        place.images = [
          {
            imageUrl: `https://source.unsplash.com/random/300x200/?hotel,${place.id}`,
          },
        ];
      }
      return place;
    });

    return places;
  } catch (error) {
    console.error("Error fetching top rated places:", error);

    // For development/fallback, return mock data
    if (process.env.NODE_ENV !== "production") {
      return getMockPlaces(limit);
    }

    throw handleApiError(error);
  }
};

/**
 * Get all places
 * @param {Object} params - Query parameters
 * @returns {Promise} - Response data
 */
export const getAllPlaces = async (params = {}) => {
  try {
    const response = await apiClient.get("/places/get-all", { params });
    
    // Ensure each place has images array
    const places = response.data.map((place) => {
      if (!place.images || place.images.length === 0) {
        place.images = [
          {
            imageUrl: `https://source.unsplash.com/random/300x200/?hotel,${place.id}`,
          },
        ];
      }
      return place;
    });
    
    return places;
  } catch (error) {
    console.error("Error fetching all places:", error);

    // For development/fallback, return mock data
    if (process.env.NODE_ENV !== "production") {
      return getMockPlaces(params.limit || 10);
    }

    throw handleApiError(error);
  }
};

/**
 * Get place details by ID
 * @param {number} id - Place ID
 * @returns {Promise} - Response data
 */
export const getPlaceById = async (id) => {
  try {
    const response = await apiClient.get(`/places/place-details/${id}`);

    // Ensure place has images array
    if (!response.data.images || response.data.images.length === 0) {
      response.data.images = [
        {
          id: "default",
          imageUrl: `https://source.unsplash.com/random/800x600/?hotel,${id}`,
        },
      ];
    } else if (!Array.isArray(response.data.images)) {
      // If images is not an array, convert it to an array
      response.data.images = [response.data.images];
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching place with ID ${id}:`, error);

    // For development/fallback, return mock data
    if (process.env.NODE_ENV !== "production") {
      return getMockPlaceDetails(id);
    }

    throw handleApiError(error);
  }
};

/**
 * Get places in the same category as the specified place
 * @param {number} id - Place ID to find similar places for
 * @returns {Promise} - Response data with similar places
 */
export const getSameCategoryPlaces = async (id) => {
  try {
    const response = await apiClient.get(`/places/get-same-category/${id}`);
    
    // Ensure each place has images array
    const places = response.data.map((place) => {
      if (!place.images || place.images.length === 0) {
        place.images = [
          {
            imageUrl: `https://source.unsplash.com/random/300x200/?hotel,${place.id}`,
          },
        ];
      }
      return place;
    });
    
    return places;
  } catch (error) {
    console.error(`Error fetching same category places for place ${id}:`, error);

    // For development/fallback, return mock data
    if (process.env.NODE_ENV !== "production") {
      return getMockSameCategoryPlaces(id);
    }

    throw handleApiError(error);
  }
};

/**
 * Get place reviews by place ID
 * @param {number} placeId - Place ID
 * @returns {Promise} - Response data
 */
export const getPlaceReviews = async (placeId) => {
  try {
    const response = await apiClient.get(
      `/comments/all-comments-of-place/${placeId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching reviews for place ${placeId}:`, error);

    // For development/fallback, return mock reviews
    if (process.env.NODE_ENV !== "production") {
      return getMockReviews(placeId);
    }

    throw handleApiError(error);
  }
};

/**
 * Post a new review for a place
 * @param {Object} reviewData - Review data including rating and content
 * @returns {Promise} - Response data
 */
export const postPlaceReview = async (reviewData) => {
  try {
    const response = await apiClient.post("/comments/add-comment", reviewData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting review:", error);
    throw handleApiError(error);
  }
};

/**
 * Search places by name, address, or description
 * @param {string} query - Search query
 * @param {Object} filters - Optional filter parameters
 * @returns {Promise} - Response data
 */
export const searchPlaces = async (query, filters = {}) => {
  try {
    // In a real app, you would pass both query and filters to the backend
    // For now, we'll fetch all places and filter locally
    const response = await apiClient.get("/places/get-all");
    
    let results = response.data;
    
    // Apply search filter
    if (query && query.trim() !== '') {
      const searchLower = query.toLowerCase();
      results = results.filter(place => 
        (place.name?.toLowerCase() || '').includes(searchLower) || 
        (place.address?.toLowerCase() || '').includes(searchLower) ||
        (place.description?.toLowerCase() || '').includes(searchLower)
      );
    }
    
    // Ensure each place has images array
    results = results.map((place) => {
      if (!place.images || place.images.length === 0) {
        place.images = [
          {
            imageUrl: `https://source.unsplash.com/random/300x200/?hotel,${place.id}`,
          },
        ];
      }
      return place;
    });
    
    return results;
  } catch (error) {
    console.error("Error searching places:", error);
    
    // For development/fallback, return mock data
    if (process.env.NODE_ENV !== "production") {
      const mockPlaces = getMockPlaces(20);
      
      if (query && query.trim() !== '') {
        const searchLower = query.toLowerCase();
        return mockPlaces.filter(place => 
          place.name.toLowerCase().includes(searchLower) || 
          place.location.toLowerCase().includes(searchLower) ||
          (place.description || '').toLowerCase().includes(searchLower)
        );
      }
      
      return mockPlaces;
    }
    
    throw handleApiError(error);
  }
};

/**
 * Check if user can comment on a place (has confirmed booking)
 * @param {number} placeId - Place ID
 * @returns {Promise} - Response data
 */
export const canCommentOnPlace = async (placeId) => {
  try {
    const response = await apiClient.get(`/bookings/can-comment/${placeId}`);
    return response.data;
  } catch (error) {
    // console.error(
    //   `Error checking comment permission for place ${placeId}:`,
    //   error
    // );
    return { canComment: false, message: "Failed to check comment permission" };
  }
};

/**
 * Handle API errors
 * @param {Error} error - Error object
 * @returns {Error} - Processed error
 */
const handleApiError = (error) => {
  let message = "Something went wrong";

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    if (error.response.data && error.response.data.message) {
      message = error.response.data.message;
    } else {
      message = `Error ${error.response.status}: ${error.response.statusText}`;
    }
  } else if (error.request) {
    // The request was made but no response was received
    message = "No response from server";
  } else {
    // Something happened in setting up the request that triggered an Error
    message = error.message;
  }

  const customError = new Error(message);
  customError.originalError = error;
  return customError;
};

/**
 * Generate mock place details for development
 * @param {number} id - Place ID
 * @returns {Object} - Mock place details
 */
const getMockPlaceDetails = (id) => {
  const mockPlace = {
    id: id,
    name: `Port Friedaberg Apartment ${id}`,
    address: `8714 Anthony Fork, Connstad, Vietnam`,
    category: Math.random() > 0.5 ? "Hotel" : "Homestay",
    price: Math.floor(Math.random() * 5000000) + 1000000,
    rating: (Math.random() * 2 + 3).toFixed(1),
    numOfRating: Math.floor(Math.random() * 320) + 10,
    images: [
      {
        id: "img1",
        imageUrl: `https://source.unsplash.com/random/800x600/?homestay,${id}`,
      },
      {
        id: "img2",
        imageUrl: `https://source.unsplash.com/random/800x600/?interior,${id}`,
      },
      {
        id: "img3",
        imageUrl: `https://source.unsplash.com/random/800x600/?bedroom,${id}`,
      },
      {
        id: "img4",
        imageUrl: `https://source.unsplash.com/random/800x600/?bathroom,${id}`,
      },
    ],
    maxGuests: Math.floor(Math.random() * 4) + 2,
    description: `Harum sapiente dolores at et ipsum reprehenderit. Ex corrupti dolorem ut non natus sapiente possimus dolore. Enim adipisci voluptates in totam. Commodi eveniet magni. Doloribus aut blanditiis.`,
  };

  return mockPlace;
};

/**
 * Generate mock same category places for development
 * @param {number} id - Original place ID
 * @returns {Array} - Mock same category places
 */
const getMockSameCategoryPlaces = (id) => {
  const category = Math.random() > 0.5 ? "Hotel" : "Homestay";
  return Array.from({ length: 5 }, (_, index) => {
    const placeId = id + index + 1;
    return {
      id: placeId,
      name: `${category} ${placeId}`,
      address: `${Math.floor(Math.random() * 9000) + 1000} Chestnut Street, Rome, NY 13440`,
      category: category,
      price: Math.floor(Math.random() * 200) + 80,
      rating: (Math.random() * 2 + 3).toFixed(1),
      numOfRating: Math.floor(Math.random() * 500) + 30,
      images: [
        {
          id: "img1",
          imageUrl: `https://source.unsplash.com/random/300x200/?${category.toLowerCase()},${placeId}`,
        }
      ],
      maxGuests: Math.floor(Math.random() * 4) + 2,
      description: `A beautiful ${category.toLowerCase()} with excellent amenities and friendly staff.`
    };
  });
};

/**
 * Generate mock reviews for development
 * @param {number} placeId - Place ID
 * @returns {Array} - Mock reviews
 */
const getMockReviews = (placeId) => {
  const reviewers = [
    {
      id: "user1",
      name: "John Smith",
      avatar: "https://i.pravatar.cc/100?img=1",
    },
    {
      id: "user2",
      name: "Emily Johnson",
      avatar: "https://i.pravatar.cc/100?img=2",
    },
    {
      id: "user3",
      name: "Michael Brown",
      avatar: "https://i.pravatar.cc/100?img=3",
    },
    {
      id: "user4",
      name: "Jessica Davis",
      avatar: "https://i.pravatar.cc/100?img=4",
    },
    {
      id: "user5",
      name: "David Wilson",
      avatar: "https://i.pravatar.cc/100?img=5",
    },
  ];

  const reviewContents = [
    "Great place! Highly recommend it.",
    "The location was perfect, but the amenities could be better.",
    "We had an amazing stay. The host was very helpful and responsive.",
    "Clean, comfortable, and convenient. Would stay again.",
    "Beautiful views and excellent service!",
    "Good value for the price. Not luxury but comfortable.",
    "A bit disappointing compared to the photos, but overall okay.",
    "Perfect for our family vacation. Kids loved it!",
    "Very quiet and peaceful. Great for a relaxing getaway.",
    "Central location, easy to get around the city.",
  ];

  return Array.from({ length: 8 }, (_, i) => {
    const reviewer = reviewers[Math.floor(Math.random() * reviewers.length)];
    const content =
      reviewContents[Math.floor(Math.random() * reviewContents.length)];
    const rating = Math.floor(Math.random() * 3) + 3; // Random rating between 3-5
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 60)); // Random date within last 60 days

    return {
      id: i + 1,
      placeId: placeId,
      senderId: reviewer.id,
      senderName: reviewer.name,
      senderAvatar: reviewer.avatar,
      rating: rating,
      content: content,
      createdAt: date.toISOString(),
      images:
        Math.random() > 0.7
          ? [
              {
                id: `review-img-${i}-1`,
                imageUrl: `https://source.unsplash.com/random/300x200/?hotel,${
                  i + 10
                }`,
              },
            ]
          : [],
    };
  });
};

/**
 * Generate mock places data for development
 * @param {number} count - Number of mock places to generate
 * @returns {Array} - Mock places data
 */
const getMockPlaces = (count = 5) => {
  const locations = [
    { city: "Ha Noi", country: "Vietnam" },
    { city: "Ho Chi Minh", country: "Vietnam" },
    { city: "Da Nang", country: "Vietnam" },
    { city: "Nha Trang", country: "Vietnam" },
    { city: "Da Lat", country: "Vietnam" },
    { city: "Hoi An", country: "Vietnam" },
  ];

  const placeNames = [
    "The Horizon Retreat",
    "Opal Grove Inn",
    "Serenity Sands",
    "Elysian Suites",
    "Tranquil Shores",
    "Azure Bay Resort",
    "Majestic Heights",
    "Golden Vista Lodge",
    "Harbor Cove Inn",
    "Sunset Palms Resort",
  ];

  const categories = ["Hotel", "Homestay", "Resort", "Villa", "Apartment"];

  return Array.from({ length: count }, (_, i) => {
    const location = locations[Math.floor(Math.random() * locations.length)];
    const name = placeNames[Math.floor(Math.random() * placeNames.length)];
    const price = Math.floor(Math.random() * 5000000) + 1000000; // Random price between 1M-6M VND
    const rating = (Math.random() * 2 + 3).toFixed(1); // Random rating between 3.0-5.0
    const numOfRating = Math.floor(Math.random() * 500) + 50;
    const category = categories[Math.floor(Math.random() * categories.length)];

    return {
      id: i + 1,
      name: `${name} ${i + 1}`,
      address: `${location.city}, ${location.country}`,
      location: `${location.city}, ${location.country}`,
      category: category,
      price: price,
      rating: parseFloat(rating),
      numOfRating: numOfRating,
      images: [
        {
          id: i + 1,
          imageUrl: `https://source.unsplash.com/random/300x200/?${category.toLowerCase()},${
            i + 1
          }`,
        },
      ],
      maxGuests: Math.floor(Math.random() * 5) + 2,
      description:
        "A beautiful place to stay with amazing views and excellent amenities.",
    };
  });
};

export default {
  getTopRatedPlaces,
  getAllPlaces,
  getPlaceById,
  getPlaceReviews,
  postPlaceReview,
  searchPlaces,
  canCommentOnPlace,
  getSameCategoryPlaces,
};