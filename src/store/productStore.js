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
        return {
             url: response.data.imageUrl,
             filename: response.data.filename
         };
    } catch (error) {
        console.error('Image upload failed:', error);
        const message = error.response?.data?.message || `Échec du téléversement de l'image ${imageFile.name}`;
        toast.error(`Erreur d'image: ${message}`);
        throw new Error(message);
    }
};


export const useProductStore = create((set, get) => ({
  products: [],
  product: null,
  stockHistory: [],
  isLoading: false,
  isUploading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },

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

  createProduct: async (productData) => {
    const { imageFiles, ...coreData } = productData;
    set({ isLoading: true, isUploading: !!(imageFiles && imageFiles.length > 0), error: null });

    try {
      let uploadedImageObjects = [];
      if (imageFiles && imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(file => uploadImage(file));
        const results = await Promise.all(uploadPromises);
        uploadedImageObjects = results
           .filter(result => result !== null)
           .map((result, index) => ({
              imageUrl: result.url,
              altText: `Image for ${coreData.name.fr}`,
              isPrimary: index === 0,
              order: index + 1,
          }));
        set({ isUploading: false });
      }

      const payload = {
        ...coreData,
        images: uploadedImageObjects,
      };
      delete payload.imageFiles;

      const response = await api.post('/products', payload);

      toast.success('Produit créé avec succès !');
      get().fetchProducts(get().pagination.page, get().pagination.limit);
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

  fetchProductById: async (id) => {
    try {
        set({ isLoading: true, error: null, product: null });
        const response = await api.get(`/products/id/${id}`);
        set({
            product: response.data.data,
            isLoading: false,
        });
        return response.data.data;
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to fetch product details';
        console.error("Fetch Product By ID Error:", error);
        set({ error: message, isLoading: false });
        toast.error(message);
        return null;
    }
  },

  clearProduct: () => {
    set({ product: null });
  },

  updateProduct: async (id, updateData) => {
    const originalProduct = get().product;
    if (!originalProduct) {
        toast.error("Original product data not found. Cannot update.");
        return false;
    }

    const { imageFiles, categoryIds, ...coreData } = updateData;
    set({ isLoading: true, isUploading: !!(imageFiles && imageFiles.length > 0), error: null });

    try {
        await api.put(`/products/${id}`, {
            sku: coreData.sku,
            name: coreData.name,
            description: coreData.description,
            isActive: coreData.isActive,
        });
        toast.info("Détails du produit mis à jour...");

        const originalCategoryIds = originalProduct.categories.map(c => c.id);
        const newCategoryIds = categoryIds || [];
        const idsToAdd = newCategoryIds.filter(catId => !originalCategoryIds.includes(catId));
        const idsToRemove = originalCategoryIds.filter(catId => !newCategoryIds.includes(catId));

        if (idsToAdd.length > 0) {
            await api.post(`/products/${id}/categories`, { categoryIds: idsToAdd });
        }
        if (idsToRemove.length > 0) {
            await api.delete(`/products/${id}/categories`, { data: { categoryIds: idsToRemove } });
        }
        if (idsToAdd.length > 0 || idsToRemove.length > 0) {
            toast.info("Catégories mises à jour...");
        }

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
                altText: `Image for ${coreData.name.fr}`,
                isPrimary: false,
                order: originalProduct.images.length + index + 1
            }));
            await api.post(`/products/${id}/images`, uploadedImageObjects);
            set({ isUploading: false });
            toast.info(`${newImageFiles.length} nouvelle(s) image(s) ajoutée(s)...`);
        }

        toast.success('Produit mis à jour avec succès !');
        get().fetchProducts(get().pagination.page, get().pagination.limit);
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

  deleteProduct: async (id) => {
    try {
        set({ isLoading: true, error: null });
        await api.delete(`/products/${id}`);
        toast.success('Produit supprimé avec succès !');
        set(state => ({
            products: state.products.filter(p => p.id !== id),
            isLoading: false,
        }));
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete product';
        console.error("Delete Product Error:", error);
        set({ error: message, isLoading: false });
        toast.error(message);
    }
  },

  fetchStockHistory: async (variantId) => {
    try {
        set({ isLoading: true, error: null, stockHistory: [] });
        const response = await api.get(`/products/stock/history/${variantId}`);
        set({
            stockHistory: response.data,
            isLoading: false,
        });
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to fetch stock history';
        console.error("Fetch Stock History Error:", error);
        set({ error: message, isLoading: false });
        toast.error(message);
    }
  },

  adjustStock: async (variantId, adjustmentData) => {
    try {
      set({ isLoading: true });
      const response = await api.post(`/products/stock/adjust/${variantId}`, adjustmentData);
      toast.success(response.data.message || 'Stock adjusted successfully!');
      get().fetchProducts(get().pagination.page, get().pagination.limit);
      set({ isLoading: false });
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to adjust stock';
      console.error("Adjust Stock Error:", error);
      set({ error: message, isLoading: false });
      toast.error(message);
      return false;
    }
  },
}));