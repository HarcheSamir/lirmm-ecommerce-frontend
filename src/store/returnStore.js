import { create } from 'zustand';
import { api } from '../services/api';
import { toast } from 'react-toastify';

export const useReturnStore = create((set, get) => ({
  returnRequests: [],
  returnRequest: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },

  fetchReturnRequests: async (page = 1, limit = 10, params = {}) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/orders/admin/returns', {
        params: { page, limit, ...params },
      });
      set({
        returnRequests: response.data.data,
        pagination: response.data.pagination,
        isLoading: false,
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch return requests';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  fetchReturnRequestById: async (requestId) => {
    try {
      set({ isLoading: true, error: null, returnRequest: null });
      const response = await api.get(`/orders/returns/${requestId}`);
      set({
        returnRequest: response.data,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch return request details';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  clearReturnRequest: () => {
    set({ returnRequest: null });
  },

  manageReturnRequest: async (requestId, status, adminComments) => {
    try {
      set({ isLoading: true });
      const payload = { status, ...(adminComments && { adminComments }) };
      const response = await api.put(`/orders/admin/returns/${requestId}`, payload);

      set(state => ({
        returnRequest: response.data,
        returnRequests: state.returnRequests.map(req =>
          req.id === requestId ? response.data : req
        ),
        isLoading: false,
      }));

      toast.success(`Return request status updated to ${status}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update return request';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  createReturnRequestComment: async (requestId, commentText) => {
    try {
      // No isLoading set here to allow UI to remain responsive
      const response = await api.post(`/orders/returns/${requestId}/comments`, { commentText });
      
      set(state => ({
        returnRequest: state.returnRequest
          ? { ...state.returnRequest, comments: [...state.returnRequest.comments, response.data] }
          : state.returnRequest,
        isLoading: false,
      }));

      toast.info("Comment added successfully.");
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add comment';
      set({ error: message, isLoading: false }); // Set error state if needed
      toast.error(message);
      return null;
    }
  },
}));