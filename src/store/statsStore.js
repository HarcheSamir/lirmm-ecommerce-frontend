import { create } from 'zustand';
import { api } from '../services/api';

export const useStatsStore = create((set) => ({
  kpis: null,
  revenueTimeSeries: [],
  topSellingProducts: [],
  isLoading: true,
  error: null,

  fetchStatistics: async () => {
    try {
      set({ isLoading: true, error: null });

      const [kpisRes, timeSeriesRes, topSellingRes] = await Promise.all([
        api.get('/stats/kpis'),
        api.get('/stats/revenue/time-series'),
        api.get('/stats/products/top-selling?limit=5')
      ]);

      set({
        kpis: kpisRes.data,
        revenueTimeSeries: timeSeriesRes.data,
        topSellingProducts: topSellingRes.data,
        isLoading: false,
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch statistics';
      set({ error: message, isLoading: false });
      // Optionally, show a toast notification here if you have a global toast setup
      // toast.error(message); 
    }
  },
}));