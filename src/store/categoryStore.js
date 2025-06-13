// src/store/categoryStore.js
import { create } from 'zustand';
import { api } from '../services/api';
import { toast } from 'react-toastify';

// Helper function to upload image (can be moved to a dedicated image service helper if needed)
const uploadImage = async (imageFile) => {
  if (!imageFile) return null;

  const formData = new FormData();
  formData.append('imageFile', imageFile);

  try {
    const response = await api.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.imageUrl; // Return the URL from the image service
  } catch (error) {
    console.error('Image upload failed:', error);
    const message = error.response?.data?.message || 'Image upload failed';
    toast.error(`Image Upload Error: ${message}`);
    throw new Error(message); // Re-throw to stop category creation process
  }
};

export const useCategoryStore = create((set, get) => ({
  categories: [],
  parentCategories: [], // For dropdown/selection
  category: null, // For detail view maybe
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },

  // Fetch Categories (Example: Paginated List)
  fetchCategories: async (page = 1, limit = 10, params = {}) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/products/categories', { // Assuming API gateway path
        params: { page, limit, ...params }, // Add format=tree if needed
      });

      // Check if response is paginated or flat list based on your API design
      // This example assumes a flat list for simplicity in selection for now
      if (Array.isArray(response.data)) { // Simple flat list case
           set({
             categories: response.data,
             parentCategories: response.data.filter(c => !c.isLeaf), // Example filter for parents
             isLoading: false,
             // Reset pagination if API doesn't provide it for flat list
             pagination: { total: response.data.length, page: 1, limit: response.data.length, totalPages: 1 }
           });
           console.log(response.data)
      } else if (response.data && response.data.data && response.data.pagination) { // Paginated response case
          set({
              categories: response.data.data,
              parentCategories: response.data.data.filter(c => !c.isLeaf), // Example filter for parents
              pagination: response.data.pagination,
              isLoading: false,
          });
      } else {
           // Handle unexpected response structure
           console.warn("Received unexpected categories response structure:", response.data);
           set({ isLoading: false, error: "Format de réponse des catégories inattendu." });
      }


    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch categories';
      console.error("Fetch Categories Error:", error);
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  // Create Category
  // Accepts categoryData (name, slug, desc, parentId) and the optional thumbnailFile
  createCategory: async (categoryData, thumbnailFile) => {
    try {
      set({ isLoading: true, error: null });

      let imageUrl = null;
      // 1. Upload image if provided
      if (thumbnailFile) {
        imageUrl = await uploadImage(thumbnailFile); // Use helper function
        if (!imageUrl) {
          // Error handled and toast shown in uploadImage
          set({ isLoading: false });
          return false; // Stop if image upload failed
        }
      }

      // 2. Prepare final payload for category creation
      const payload = {
        ...categoryData,
        imageUrl: imageUrl, // Add the uploaded image URL (can be null)
      };

      // 3. Send request to create category
      const response = await api.post('/products/categories', payload); // Use API gateway path

      toast.success('Catégorie créée avec succès !');
      // Optional: Fetch categories again to update the list or add directly
      // get().fetchCategories(); // Example: Refresh list
      set(state => ({
        categories: [...state.categories, response.data], // Add new category optimistically (if API returns created object)
        isLoading: false,
      }));
      return response.data; // Return the created category object
    } catch (error) {
      // Catch errors from both image upload (re-thrown) and category creation
      const message = error.response?.data?.message || error.message || 'Échec de la création de la catégorie';
      console.error("Create Category Error:", error);
      set({ error: message, isLoading: false });
      toast.error(message);
      return false;
    }
  },

  // Placeholder for future actions
  fetchCategoryById: async (id) => {
    // TODO: Implement API call to get /products/categories/id/:id
  },
  updateCategory: async (id, categoryData, thumbnailFile) => {
    // TODO: Implement update logic, potentially including image upload/replacement
  },
  deleteCategory: async (id) => {
    // TODO: Implement API call to delete /products/categories/:id
  },

}));