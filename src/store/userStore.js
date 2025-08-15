// src/store/userStore.js
import { create } from 'zustand';
import { api } from '../services/api';
import { toast } from 'react-toastify';

export const useUserStore = create((set, get) => ({
  users: [],
  roles: [],
  permissions: [],
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },

  // --- User Actions ---
  // --- FIX: Added /auth prefix to all API calls ---
  fetchUsers: async (page = 1, limit = 10, params = {}) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/auth/users', { params: { page, limit, ...params } });
      set({
        users: response.data.data,
        pagination: response.data.pagination,
        isLoading: false,
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch users';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  updateUserRole: async (userId, roleId) => {
    try {
      set({ isLoading: true });
      const response = await api.put(`/auth/users/${userId}`, { roleId });
      set(state => ({
        users: state.users.map(user => user.id === userId ? response.data : user),
        isLoading: false,
      }));
      get().fetchRoles();
      toast.success('User role updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update user role';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  toggleUserStatus: async (userId, isActive) => {
    try {
      set({ isLoading: true });
      let updatedUser;
      if (isActive) {
        const response = await api.post(`/auth/users/${userId}/activate`);
        updatedUser = response.data;
      } else {
        await api.delete(`/auth/users/${userId}`);
        const originalUser = get().users.find(u => u.id === userId);
        updatedUser = { ...originalUser, isActive: false };
      }

      set(state => ({
        users: state.users.map(user => user.id === userId ? updatedUser : user),
        isLoading: false,
      }));
      toast.success(`User status changed to ${isActive ? 'Active' : 'Blocked'}.`);
      return updatedUser;

    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change user status';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  // --- Role Actions ---
  fetchRoles: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/auth/roles');
      set({ roles: response.data, isLoading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch roles';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  createRole: async (roleData) => {
    try {
      set({ isLoading: true });
      const response = await api.post('/auth/roles', roleData);
      get().fetchRoles();
      set({ isLoading: false });
      toast.success(`Role '${response.data.name}' created successfully!`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create role';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  updateRole: async (roleId, roleData) => {
    try {
      set({ isLoading: true });
      const response = await api.put(`/auth/roles/${roleId}`, roleData);
      set(state => ({
        roles: state.roles.map(role => role.id === roleId ? response.data : role),
        isLoading: false
      }));
      toast.success(`Role '${response.data.name}' updated successfully!`);
      return response.data;
    } catch (error)      {
      const message = error.response?.data?.message || 'Failed to update role';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  deleteRole: async (roleId) => {
    try {
      set({ isLoading: true });
      await api.delete(`/auth/roles/${roleId}`);
      set(state => ({
        roles: state.roles.filter(role => role.id !== roleId),
        isLoading: false,
      }));
      toast.success('Role deleted successfully!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete role';
      set({ error: message, isLoading: false });
      toast.error(message);
      return false;
    }
  },

  // --- Permission Actions ---
  fetchPermissions: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/auth/permissions');
      set({ permissions: response.data, isLoading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch permissions';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  inviteUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
        await api.post('/users/invite', userData);
        toast.success(`Invitation successfully sent to ${userData.email}`);
        await get().fetchUsers(); // Refresh the user list to show the pending user
        set({ isLoading: false });
        return true;
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to send invitation.';
        set({ error: message, isLoading: false });
        toast.error(message);
        return false;
    }
},

}));