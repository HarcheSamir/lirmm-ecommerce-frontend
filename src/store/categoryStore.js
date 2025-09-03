//src/store/categoryStore.js
import { create } from 'zustand';
import { api } from '../services/api';
import { toast } from 'react-toastify';

const uploadImage = async (imageFile) => {
  if (!imageFile) return null;
  const formData = new FormData();
  formData.append('imageFile', imageFile);
  try {
    const response = await api.post('/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.imageUrl;
  } catch (error) {
    console.error('Image upload failed:', error);
    const message = error.response?.data?.message || 'Image upload failed';
    toast.error(`Image Upload Error: ${message}`);
    throw new Error(message);
  }
};

export const useCategoryStore = create((set, get) => ({
  categories: [],
  parentCategories: [],
  category: null,
  isLoading: false,
  error: null,

  fetchCategories: async (page = 1, limit = 100, params = {}) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/products/categories', {
        params: { page, limit, ...params },
      });
      const allCategories = Array.isArray(response.data) ? response.data : (response.data.data || []);
      set({
        categories: allCategories,
        parentCategories: allCategories.filter(c => c.parentId === null),
        isLoading: false,
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch categories';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  createCategory: async (categoryData, thumbnailFile) => {
    try {
      set({ isLoading: true, error: null });
      let imageUrl = null;
      if (thumbnailFile) {
        imageUrl = await uploadImage(thumbnailFile);
      }
      const payload = { ...categoryData, imageUrl };
      const response = await api.post('/products/categories', payload);
      toast.success('Catégorie créée avec succès !');
      get().fetchCategories();
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Échec de la création de la catégorie';
      set({ error: message, isLoading: false });
      toast.error(message);
      return false;
    }
  },

  fetchCategoryById: async (id) => {
    try {
      set({ isLoading: true, error: null, category: null });
      const response = await api.get(`/products/categories/id/${id}`);
      set({ category: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch category';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  updateCategory: async (id, categoryData, thumbnailFile) => {
    try {
      set({ isLoading: true, error: null });
      let imageUrl = categoryData.imageUrl;

      if (thumbnailFile) {
        imageUrl = await uploadImage(thumbnailFile);
      } else if (imageUrl === null) {
        imageUrl = null;
      }

      const payload = { ...categoryData, imageUrl };
      const response = await api.put(`/products/categories/${id}`, payload);
      toast.success('Catégorie mise à jour avec succès !');
      get().fetchCategories();
      set({ isLoading: false, category: response.data });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Échec de la mise à jour de la catégorie';
      set({ error: message, isLoading: false });
      toast.error(message);
      return false;
    }
  },

  deleteCategory: async (id) => {
    // TODO: Implement API call to delete /products/categories/:id
  },

  clearCategory: () => {
    set({ category: null });
  },

}));