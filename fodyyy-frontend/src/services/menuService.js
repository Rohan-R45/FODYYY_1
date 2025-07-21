import api from './api';

const menuService = {
  // Get all menu items for the authenticated restaurant
  async getMenuItems(params = {}) {
    try {
      console.log('📡 API: Getting menu items...');
      const response = await api.get('/menu', { params });
      console.log('📡 API: Menu items response:', response.data);
      return response.data;
    } catch (error) {
      console.error('📡 API: Error getting menu items:', error);
      throw error;
    }
  },

  // Create a new menu item
  async createMenuItem(itemData) {
    try {
      console.log('📡 API: Creating menu item:', itemData);
      const response = await api.post('/menu', itemData);
      console.log('📡 API: Create menu item response:', response.data);
      return response.data;
    } catch (error) {
      console.error('📡 API: Error creating menu item:', error);
      throw error;
    }
  },

  // Update an existing menu item
  async updateMenuItem(itemId, itemData) {
    try {
      console.log('📡 API: Updating menu item:', itemId, itemData);
      const response = await api.put(`/menu/${itemId}`, itemData);
      console.log('📡 API: Update menu item response:', response.data);
      return response.data;
    } catch (error) {
      console.error('📡 API: Error updating menu item:', error);
      throw error;
    }
  },

  // Delete a menu item
  async deleteMenuItem(itemId) {
    try {
      console.log('📡 API: Deleting menu item:', itemId);
      const response = await api.delete(`/menu/${itemId}`);
      console.log('📡 API: Delete menu item response:', response.data);
      return response.data;
    } catch (error) {
      console.error('📡 API: Error deleting menu item:', error);
      throw error;
    }
  },

  // Get menu items by restaurant ID (for students browsing)
  async getMenuItemsByRestaurant(restaurantId) {
    try {
      console.log('📡 API: Getting menu items for restaurant:', restaurantId);
      const response = await api.get(`/menu/restaurant/${restaurantId}`);
      console.log('📡 API: Restaurant menu response:', response.data);
      return response.data;
    } catch (error) {
      console.error('📡 API: Error getting restaurant menu:', error);
      throw error;
    }
  },

  // Get menu categories
  async getCategories() {
    try {
      console.log('📡 API: Getting categories...');
      const response = await api.get('/menu/categories');
      console.log('📡 API: Categories response:', response.data);
      return response.data;
    } catch (error) {
      console.error('📡 API: Error getting categories:', error);
      throw error;
    }
  },

  // Upload menu item image
  async uploadImage(formData) {
    try {
      console.log('📡 API: Uploading image...');
      const response = await api.post('/menu/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('📡 API: Upload image response:', response.data);
      return response.data;
    } catch (error) {
      console.error('📡 API: Error uploading image:', error);
      throw error;
    }
  },

  // Bulk operations
  async bulkUpdateItems(itemIds, updateData) {
    try {
      console.log('📡 API: Bulk updating items:', itemIds, updateData);
      const response = await api.patch('/menu/bulk-update', {
        itemIds,
        updateData
      });
      console.log('📡 API: Bulk update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('📡 API: Error bulk updating items:', error);
      throw error;
    }
  },

  async bulkDeleteItems(itemIds) {
    try {
      console.log('📡 API: Bulk deleting items:', itemIds);
      const response = await api.delete('/menu/bulk-delete', {
        data: { itemIds }
      });
      console.log('📡 API: Bulk delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('📡 API: Error bulk deleting items:', error);
      throw error;
    }
  }
};

export default menuService;