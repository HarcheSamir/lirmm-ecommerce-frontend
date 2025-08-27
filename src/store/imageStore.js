import { create } from 'zustand';
import { api } from '../services/api';
import { toast } from 'react-toastify';

export const useImageStore = create((set) => ({
  isUploading: false,
  error: null,

  uploadImage: async (imageFile) => {
    if (!imageFile) return null;
    
    set({ isUploading: true, error: null });
    const formData = new FormData();
    formData.append('imageFile', imageFile);

    try {
        const response = await api.post('/images/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        set({ isUploading: false });
        toast.success(`Image "${imageFile.name}" uploaded successfully.`);
        return response.data.imageUrl; // Return only the URL

    } catch (error) {
        console.error('Image upload failed:', error);
        const message = error.response?.data?.message || `Failed to upload image ${imageFile.name}`;
        set({ isUploading: false, error: message });
        toast.error(`Image Error: ${message}`);
        return null; // Return null on failure
    }
  },
}));