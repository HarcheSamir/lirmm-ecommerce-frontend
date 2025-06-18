// src/store/orderStore.js
import { create } from 'zustand';
import { api } from '../services/api';
import { toast } from 'react-toastify';

export const useOrderStore = create((set) => ({
  orders: [],
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },

  fetchOrders: async (page = 1, limit = 10, params = {}) => {
    try {
      set({ isLoading: true, error: null });
      // The API Gateway routes /orders to the order-service
      const response = await api.get('/orders', {
        params: { page, limit, ...params },
      });
      console.log(response.data.data)
      set({
        orders: response.data.data,
        pagination: response.data.pagination,
        isLoading: false,
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch orders';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      set({ isLoading: true });
      const response = await api.put(`/orders/${orderId}/status`, { status });
      set(state => ({
        orders: state.orders.map(order => (order.id === orderId ? response.data : order)),
        isLoading: false,
      }));
      toast.success(`Order #${orderId.substring(0, 4)} status updated to ${status}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update order status';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },
}));