// src/store/orderStore.js
import { create } from 'zustand';
import { api } from '../services/api';
import { toast } from 'react-toastify';

export const useOrderStore = create((set, get) => ({ // <-- Add get
  orders: [],
  order: null, // <-- ADDED: For a single order view
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

  // --- NEW: Fetch a single order by ID ---
  fetchOrderById: async (orderId) => {
    try {
      set({ isLoading: true, error: null, order: null });
      const response = await api.get(`/orders/${orderId}`);
      set({
        order: response.data,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch order details';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  // --- NEW: Clear single order state ---
  clearOrder: () => {
    set({ order: null });
  },


  updateOrderStatus: async (orderId, status) => {
    try {
      set({ isLoading: true });
      const response = await api.put(`/orders/${orderId}/status`, { status });

      // Update the list if it's currently loaded
      set(state => ({
        orders: state.orders.map(order => (order.id === orderId ? { ...order, status: response.data.status } : order)),
        // Also update the single order if it's the one being viewed
        order: state.order && state.order.id === orderId ? response.data : state.order,
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