// src/store/productStore.js
import { create } from 'zustand';
import { api } from '../services/api';
import { toast } from 'react-toastify';

// Re-use image upload helper (or move to a shared service file)
const uploadImage = async (imageFile) => {
    if (!imageFile) return null;
    const formData = new FormData();
    formData.append('imageFile', imageFile);
    try {
        const response = await api.post('/images/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return {
             url: response.data.imageUrl, // Get URL from response
             // You might want to include filename or other data if needed later
             // filename: response.data.filename
         };
    } catch (error) {
        console.error('Image upload failed:', error);
        const message = error.response?.data?.message || `Échec du téléversement de l'image ${imageFile.name}`;
        toast.error(`Erreur d'image: ${message}`);
        throw new Error(message); // Re-throw
    }
};


export const useProductStore = create((set, get) => ({
  products: [],
  product: null, // For detail view
  isLoading: false,
  isUploading: false, // Separate state for image uploads during product creation
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },

  // Fetch Products (Paginated List)
  fetchProducts: async (page = 1, limit = 10, params = {}) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/products', {
        params: { page, limit, ...params },
      });
      set({
        products: response.data.data,
        pagination: response.data.pagination,
        isLoading: false,
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch products';
      console.error("Fetch Products Error:", error);
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  // Create Product
  createProduct: async (productData) => {
    const { imageFiles, ...coreData } = productData;
    set({ isLoading: true, isUploading: !!(imageFiles && imageFiles.length > 0), error: null });

    try {
      // 1. Upload all images concurrently
      let uploadedImageObjects = [];
      if (imageFiles && imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(file => uploadImage(file));
        const results = await Promise.all(uploadPromises); // Wait for all uploads
        uploadedImageObjects = results
           .filter(result => result !== null)
           .map((result, index) => ({
              imageUrl: result.url,
              altText: `Image ${index + 1} for ${coreData.name}`,
              isPrimary: index === 0,
              order: index + 1,
          }));
        set({ isUploading: false });
      }

      // 2. Prepare final payload for product creation API
      const payload = {
        ...coreData,
        images: uploadedImageObjects,
      };
      delete payload.imageFiles;

      // 3. Send request to create product
      const response = await api.post('/products', payload);

      toast.success('Produit créé avec succès !');
      get().fetchProducts(get().pagination.page, get().pagination.limit); // Refresh list
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Échec de la création du produit';
       console.error("Create Product Error:", error.response?.data || error);
      set({ error: message, isLoading: false, isUploading: false });
      toast.error(`Erreur: ${message}`);
      return false;
    }
  },

  // Fetch Product by ID
  fetchProductById: async (id) => {
    try {
        set({ isLoading: true, error: null, product: null });
        const response = await api.get(`/products/id/${id}`);
        set({
            product: response.data,
            isLoading: false,
        });
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to fetch product details';
        console.error("Fetch Product By ID Error:", error);
        set({ error: message, isLoading: false });
        toast.error(message);
        return null;
    }
  },

  // Clear single product state
  clearProduct: () => {
    set({ product: null });
  },

  // Update Product
  updateProduct: async (id, updateData) => {
    const originalProduct = get().product;
    if (!originalProduct) {
        toast.error("Original product data not found. Cannot update.");
        return false;
    }

    const { imageFiles, categoryIds, ...coreData } = updateData;
    set({ isLoading: true, isUploading: !!(imageFiles && imageFiles.length > 0), error: null });

    try {
        // Step 1: Update core product details
        await api.put(`/products/${id}`, {
            sku: coreData.sku,
            name: coreData.name,
            description: coreData.description,
            isActive: coreData.isActive,
        });
        toast.info("Détails du produit mis à jour...");

        // Step 2: Update Categories
        const originalCategoryIds = originalProduct.categories.map(c => c.category.id);
        const newCategoryIds = categoryIds || [];
        const idsToAdd = newCategoryIds.filter(catId => !originalCategoryIds.includes(catId));
        const idsToRemove = originalCategoryIds.filter(catId => !newCategoryIds.includes(catId));

        if (idsToAdd.length > 0) {
            await api.post(`/products/${id}/categories`, { categoryIds: idsToAdd });
        }
        if (idsToRemove.length > 0) {
            // Axios supports DELETE with a body
            await api.delete(`/products/${id}/categories`, { data: { categoryIds: idsToRemove } });
        }
        if (idsToAdd.length > 0 || idsToRemove.length > 0) {
            toast.info("Catégories mises à jour...");
        }

        // Step 3: Update Images
        const { imagesToRemove, newImageFiles } = updateData.imageChanges;
        if (imagesToRemove.length > 0) {
            await api.delete(`/products/${id}/images`, { data: { imageIds: imagesToRemove } });
            toast.info(`${imagesToRemove.length} image(s) supprimée(s)...`);
        }
        if (newImageFiles.length > 0) {
            set({ isUploading: true });
            const uploadPromises = newImageFiles.map(file => uploadImage(file));
            const uploadResults = await Promise.all(uploadPromises);
            const uploadedImageObjects = uploadResults.filter(r => r).map((result, index) => ({
                imageUrl: result.url,
                altText: `Image for ${coreData.name}`,
                isPrimary: false, // Handle primary logic if needed
                order: originalProduct.images.length + index + 1
            }));
            await api.post(`/products/${id}/images`, uploadedImageObjects);
            set({ isUploading: false });
            toast.info(`${newImageFiles.length} nouvelle(s) image(s) ajoutée(s)...`);
        }

        toast.success('Produit mis à jour avec succès !');
        get().fetchProducts(get().pagination.page, get().pagination.limit); // Refresh list
        set({ isLoading: false });
        return true;

    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Échec de la mise à jour du produit';
        console.error("Update Product Error:", error.response?.data || error);
        set({ error: message, isLoading: false, isUploading: false });
        toast.error(`Erreur de mise à jour: ${message}`);
        return false;
    }
  },

  // Delete Product
  deleteProduct: async (id) => {
    try {
        set({ isLoading: true, error: null });
        await api.delete(`/products/${id}`);
        toast.success('Produit supprimé avec succès !');
        // Optimistically remove from state or refetch
        set(state => ({
            products: state.products.filter(p => p.id !== id),
            isLoading: false,
        }));
        // If the number of items on the current page becomes 0, you might want to go to the previous page
        // get().fetchProducts(get().pagination.page, get().pagination.limit);
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete product';
        console.error("Delete Product Error:", error);
        set({ error: message, isLoading: false });
        toast.error(message);
    }
  },
}));