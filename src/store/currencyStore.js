import { create } from 'zustand';
import { api } from '../services/api';
import { toast } from 'react-toastify';

export const useCurrencyStore = create((set, get) => ({
  rates: [],
  isLoading: false,
  error: null,

  fetchRates: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/products/currencies');
      set({ rates: response.data, isLoading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch currency rates';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  upsertRate: async (rateData) => {
    try {
      set({ isLoading: true });
      await api.post('/products/currencies', rateData);
      toast.success(`Currency rate for ${rateData.code} saved successfully.`);
      await get().fetchRates();
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save currency rate';
      set({ error: message, isLoading: false });
      toast.error(message);
      return false;
    }
  },

  setBaseRate: async (newBaseCode) => {
    const currentRates = get().rates;
    const oldBase = currentRates.find(r => r.isBase);
    const newBase = currentRates.find(r => r.code === newBaseCode);

    if (!newBase || newBase.isBase) return;

    set({ isLoading: true });
    try {
      const promises = [];
      if (oldBase) {
        promises.push(api.post('/products/currencies', { ...oldBase, rateVsBase: parseFloat(oldBase.rateVsBase), isBase: false }));
      }
      promises.push(api.post('/products/currencies', { ...newBase, rateVsBase: 1.0, isBase: true }));

      await Promise.all(promises);
      toast.success(`${newBaseCode} is now the new base currency.`);
      await get().fetchRates();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update base currency';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },
  
  deleteRate: async (code) => {
    toast.warn("Deletion functionality is not yet supported by the backend.");
  },
}));