/**
 * API Service for Fresh Grocery Backend
 * 
 * This service provides communication with the real Express.js backend API
 * running on port 3001. It replaces the localStorage-based backend service.
 */

const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3001';

// Helper function for API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// Add auth token to requests
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Product API
export const productAPI = {
  // Get all products with optional filtering
  getProducts: async (params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    const queryString = queryParams.toString();
    const endpoint = `/api/products${queryString ? `?${queryString}` : ''}`;
    return apiRequest(endpoint);
  },

  // Get product by ID
  getProduct: async (id: string) => {
    return apiRequest(`/api/products/${id}`);
  },

  // Get product categories
  getCategories: async () => {
    return apiRequest('/api/products/categories');
  },

  // Get featured products
  getFeaturedProducts: async () => {
    return apiRequest('/api/products/featured');
  },

  // Admin-only product operations
  createProduct: async (productData: any) => {
    return apiRequest('/api/products', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
  },

  updateProduct: async (id: string, productData: any) => {
    return apiRequest(`/api/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
  },

  deleteProduct: async (id: string) => {
    return apiRequest(`/api/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  updateStock: async (id: string, stockData: {
    quantity: number;
    type: 'addition' | 'deduction' | 'adjustment';
    reason?: string;
  }) => {
    return apiRequest(`/api/products/${id}/stock`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(stockData),
    });
  },
};

// Authentication API
export const authAPI = {
  // Send OTP for user authentication
  sendOTP: async (email: string) => {
    return apiRequest('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Verify OTP and authenticate user
  verifyOTP: async (email: string, code: string) => {
    return apiRequest('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  // Admin login
  adminLogin: async (email: string, password: string) => {
    return apiRequest('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Logout
  logout: async () => {
    const response = await apiRequest('/api/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    localStorage.removeItem('auth_token');
    return response;
  },

  // Refresh token
  refreshToken: async () => {
    return apiRequest('/api/auth/refresh', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },
};

// User API
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return apiRequest('/api/users/profile', {
      headers: getAuthHeaders(),
    });
  },

  // Update user profile
  updateProfile: async (profileData: any) => {
    return apiRequest('/api/users/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
  },

  // Get user favorites
  getFavorites: async () => {
    return apiRequest('/api/users/favorites', {
      headers: getAuthHeaders(),
    });
  },

  // Add to favorites
  addToFavorites: async (productId: string) => {
    return apiRequest('/api/users/favorites', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId }),
    });
  },

  // Remove from favorites
  removeFromFavorites: async (productId: string) => {
    return apiRequest(`/api/users/favorites/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },
};

// Order API
export const orderAPI = {
  // Create order
  createOrder: async (orderData: any) => {
    return apiRequest('/api/orders', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
  },

  // Get user orders
  getUserOrders: async (params: { page?: number; limit?: number; status?: string } = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    const queryString = queryParams.toString();
    const endpoint = `/api/orders${queryString ? `?${queryString}` : ''}`;
    return apiRequest(endpoint, {
      headers: getAuthHeaders(),
    });
  },

  // Get order by ID
  getOrder: async (id: string) => {
    return apiRequest(`/api/orders/${id}`, {
      headers: getAuthHeaders(),
    });
  },
};

// Admin API
export const adminAPI = {
  // Dashboard statistics
  getDashboardStats: async () => {
    return apiRequest('/api/admin/dashboard', {
      headers: getAuthHeaders(),
    });
  },

  // Product statistics
  getProductStats: async () => {
    return apiRequest('/api/admin/products/stats', {
      headers: getAuthHeaders(),
    });
  },

  // Order statistics
  getOrderStats: async () => {
    return apiRequest('/api/admin/orders/stats', {
      headers: getAuthHeaders(),
    });
  },

  // Get all orders (admin)
  getAllOrders: async (params: { page?: number; limit?: number; status?: string } = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    const queryString = queryParams.toString();
    const endpoint = `/api/admin/orders${queryString ? `?${queryString}` : ''}`;
    return apiRequest(endpoint, {
      headers: getAuthHeaders(),
    });
  },

  // Update order status
  updateOrderStatus: async (id: string, status: string, notes?: string) => {
    return apiRequest(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes }),
    });
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    return apiRequest('/health');
  },
};

// Helper functions for token management
export const tokenManager = {
  saveToken: (token: string) => {
    localStorage.setItem('auth_token', token);
  },

  getToken: () => {
    return localStorage.getItem('auth_token');
  },

  removeToken: () => {
    localStorage.removeItem('auth_token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },
};

// Default export for convenience
export default {
  productAPI,
  authAPI,
  userAPI,
  orderAPI,
  adminAPI,
  healthAPI,
  tokenManager,
};