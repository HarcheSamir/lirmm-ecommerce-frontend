// src/store/statsStore.js
import { create } from 'zustand';
import { api } from '../services/api';
import { toast } from 'react-toastify';

const initialState = {
  kpis: {
    customers: { value: 0, change: '0.00' },
    orders: { value: 0, change: '0.00' },
    revenue: { value: 0, change: '0.00' },
    growth: { value: '0.0', change: '0.00' },
  },
  revenueCogs: [],
  revenueYoY: [],
  revenueWoW: {
    currentWeekRevenue: 0,
    previousWeekRevenue: 0,
  },
  topProducts: [],
  isLoading: true,
  error: null,
};

export const useStatsStore = create((set) => ({
  ...initialState,

  fetchAllStats: async () => {
    try {
      set({ isLoading: true, error: null });

      const [kpisRes, revenueCogsRes, revenueYoYRes, revenueWoWRes, topProductsRes] = await Promise.all([
        api.get('/stats/kpis'),
        api.get('/stats/revenue-cogs-over-time'),
        api.get('/stats/revenue-yoy'),
        api.get('/stats/revenue-wow'),
        api.get('/stats/top-products')
      ]);

      set({
        kpis: kpisRes.data,
        revenueCogs: revenueCogsRes.data,
        revenueYoY: revenueYoYRes.data,
        revenueWoW: revenueWoWRes.data,
        topProducts: topProductsRes.data,
        isLoading: false,
      });

    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch dashboard statistics';
      console.error("Fetch All Stats Error:", error);
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },
}));