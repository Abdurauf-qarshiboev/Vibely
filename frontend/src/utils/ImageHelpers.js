/* eslint-disable no-unused-vars */
// Create a new utility file for image handling
import { api } from "../helpers/api";
/**
 * Converts binary image data to a data URL that can be used in <img> src
 * @param {Blob} blob - Binary image data
 * @param {string} contentType - MIME type of the image (e.g. 'image/jpeg')
 * @returns {Promise<string>} - Data URL for the image
 */
export const blobToDataURL = (blob, contentType) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Fetches an image from the API and returns a URL that can be used in <img> src
 * @param {string} imageId - ID of the image to fetch
 * @param {object} imageCache - Cache of already fetched images
 * @param {function} setImageCache - State updater function for the image cache
 * @returns {Promise<string|null>} - URL for the image, or null if there was an error
 */
export const getImageUrl = async (imageId, imageCache, setImageCache) => {
  try {
    if (!imageId) return null;

    // Check cache first
    if (imageCache[imageId]) {
      return imageCache[imageId];
    }

    // Set responseType to 'blob' to handle binary data properly
    const response = await api.get(`images/${imageId}`, {
      responseType: "blob",
    });

    if (response && response.data) {
      // Create a URL from the binary data
      let imageUrl;

      // Use the content type from the response headers
      const contentType = response.headers["content-type"] || "image/jpeg";

      // Convert blob to data URL
      imageUrl = await blobToDataURL(response.data, contentType);

      // Cache the result
      if (setImageCache) {
        setImageCache((prev) => ({ ...prev, [imageId]: imageUrl }));
      }

      return imageUrl;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching image ${imageId}:`, error);
    return null;
  }
};
