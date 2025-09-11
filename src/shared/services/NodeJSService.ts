import {
  ApiResponse,
  ApiService,
  AuthUser,
  Business,
  Order,
  Product,
  QueryOptions
} from './ApiService';

/**
 * Implementación de ApiService para Node.js Backend
 * 
 * Esta clase implementa todos los métodos abstractos de ApiService
 * usando tu propio backend de Node.js con REST API
 * 
 * NOTA: Este es un ejemplo de implementación futura.
 * No está actualmente funcional, pero muestra cómo migrar
 * fácilmente de Firebase a tu propio backend.
 */
export class NodeJSService extends ApiService {
  private accessToken: string | null = null;

  constructor(baseUrl: string) {
    super(baseUrl);
    this.loadStoredToken();
  }

  private async loadStoredToken(): Promise<void> {
    try {
      // En React Native usarías AsyncStorage
      // this.accessToken = await AsyncStorage.getItem('@auth_token');
      console.log('Loading stored token...');
    } catch (error) {
      console.log('No stored token found');
    }
  }

  private async saveToken(token: string): Promise<void> {
    try {
      this.accessToken = token;
      // await AsyncStorage.setItem('@auth_token', token);
      console.log('Token saved');
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  private async removeToken(): Promise<void> {
    try {
      this.accessToken = null;
      // await AsyncStorage.removeItem('@auth_token');
      console.log('Token removed');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const config: RequestInit = {
        method,
        headers: this.getHeaders()
      };

      if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return this.createErrorResponse(data.message || `HTTP ${response.status}`);
      }

      return this.createSuccessResponse(data.data || data, data.message);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // ========== AUTH METHODS ==========
  async signIn(email: string, password: string): Promise<ApiResponse<AuthUser>> {
    const response = await this.makeRequest<{ user: AuthUser; token: string }>('/auth/login', 'POST', {
      email,
      password
    });

    if (response.success && response.data) {
      await this.saveToken(response.data.token);
      return this.createSuccessResponse(response.data.user, 'Inicio de sesión exitoso');
    }

    return response as ApiResponse<AuthUser>;
  }

  async signUp(email: string, password: string): Promise<ApiResponse<AuthUser>> {
    const response = await this.makeRequest<{ user: AuthUser; token: string }>('/auth/register', 'POST', {
      email,
      password
    });

    if (response.success && response.data) {
      await this.saveToken(response.data.token);
      return this.createSuccessResponse(response.data.user, 'Registro exitoso');
    }

    return response as ApiResponse<AuthUser>;
  }

  async signOut(): Promise<ApiResponse<void>> {
    await this.removeToken();
    await this.makeRequest('/auth/logout', 'POST');
    return this.createSuccessResponse(undefined, 'Sesión cerrada exitosamente');
  }

  async getCurrentUser(): Promise<ApiResponse<AuthUser | null>> {
    if (!this.accessToken) {
      return this.createSuccessResponse(null);
    }

    return this.makeRequest<AuthUser>('/auth/me');
  }

  async resetPassword(email: string): Promise<ApiResponse<void>> {
    return this.makeRequest('/auth/reset-password', 'POST', { email });
  }

  async updateProfile(userData: Partial<AuthUser>): Promise<ApiResponse<AuthUser>> {
    return this.makeRequest<AuthUser>('/auth/profile', 'PUT', userData);
  }

  // ========== BUSINESS METHODS ==========
  async getBusinesses(options?: QueryOptions): Promise<ApiResponse<Business[]>> {
    const queryParams = new URLSearchParams();
    
    if (options?.limit) queryParams.append('limit', options.limit.toString());
    if (options?.offset) queryParams.append('offset', options.offset.toString());
    if (options?.orderBy) queryParams.append('orderBy', options.orderBy);
    if (options?.orderDirection) queryParams.append('orderDirection', options.orderDirection);
    
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        queryParams.append(`filter[${key}]`, value.toString());
      });
    }

    const endpoint = `/businesses?${queryParams.toString()}`;
    return this.makeRequest<Business[]>(endpoint);
  }

  async getBusinessById(id: string): Promise<ApiResponse<Business>> {
    return this.makeRequest<Business>(`/businesses/${id}`);
  }

  async createBusiness(businessData: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Business>> {
    return this.makeRequest<Business>('/businesses', 'POST', businessData);
  }

  async updateBusiness(id: string, businessData: Partial<Business>): Promise<ApiResponse<Business>> {
    return this.makeRequest<Business>(`/businesses/${id}`, 'PUT', businessData);
  }

  async deleteBusiness(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/businesses/${id}`, 'DELETE');
  }

  async getBusinessesByOwner(ownerId: string): Promise<ApiResponse<Business[]>> {
    return this.getBusinesses({ filters: { ownerId } });
  }

  async searchBusinesses(query: string, options?: QueryOptions): Promise<ApiResponse<Business[]>> {
    const searchOptions = { ...options, filters: { ...options?.filters, search: query } };
    return this.getBusinesses(searchOptions);
  }

  // ========== PRODUCT METHODS ==========
  async getProducts(businessId?: string, options?: QueryOptions): Promise<ApiResponse<Product[]>> {
    const queryParams = new URLSearchParams();
    
    if (businessId) queryParams.append('businessId', businessId);
    if (options?.limit) queryParams.append('limit', options.limit.toString());
    if (options?.offset) queryParams.append('offset', options.offset.toString());
    if (options?.orderBy) queryParams.append('orderBy', options.orderBy);
    if (options?.orderDirection) queryParams.append('orderDirection', options.orderDirection);
    
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        queryParams.append(`filter[${key}]`, value.toString());
      });
    }

    const endpoint = `/products?${queryParams.toString()}`;
    return this.makeRequest<Product[]>(endpoint);
  }

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    return this.makeRequest<Product>(`/products/${id}`);
  }

  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Product>> {
    return this.makeRequest<Product>('/products', 'POST', productData);
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<ApiResponse<Product>> {
    return this.makeRequest<Product>(`/products/${id}`, 'PUT', productData);
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/products/${id}`, 'DELETE');
  }

  async getProductsByCategory(category: string, options?: QueryOptions): Promise<ApiResponse<Product[]>> {
    return this.getProducts(undefined, { ...options, filters: { category } });
  }

  // ========== ORDER METHODS ==========
  async getOrders(customerId?: string, businessId?: string, options?: QueryOptions): Promise<ApiResponse<Order[]>> {
    const queryParams = new URLSearchParams();
    
    if (customerId) queryParams.append('customerId', customerId);
    if (businessId) queryParams.append('businessId', businessId);
    if (options?.limit) queryParams.append('limit', options.limit.toString());
    if (options?.offset) queryParams.append('offset', options.offset.toString());
    if (options?.orderBy) queryParams.append('orderBy', options.orderBy);
    if (options?.orderDirection) queryParams.append('orderDirection', options.orderDirection);
    
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        queryParams.append(`filter[${key}]`, value.toString());
      });
    }

    const endpoint = `/orders?${queryParams.toString()}`;
    return this.makeRequest<Order[]>(endpoint);
  }

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    return this.makeRequest<Order>(`/orders/${id}`);
  }

  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Order>> {
    return this.makeRequest<Order>('/orders', 'POST', orderData);
  }

  async updateOrder(id: string, orderData: Partial<Order>): Promise<ApiResponse<Order>> {
    return this.makeRequest<Order>(`/orders/${id}`, 'PUT', orderData);
  }

  async deleteOrder(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/orders/${id}`, 'DELETE');
  }

  async getOrdersByStatus(status: Order['status'], options?: QueryOptions): Promise<ApiResponse<Order[]>> {
    return this.getOrders(undefined, undefined, { ...options, filters: { status } });
  }

  // ========== UTILITY METHODS ==========
  async uploadImage(file: any, path: string): Promise<ApiResponse<string>> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('path', path);

      const response = await fetch(`${this.baseUrl}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        return this.createErrorResponse(data.message || 'Error uploading image');
      }

      return this.createSuccessResponse(data.imageUrl, 'Imagen subida exitosamente');
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async deleteImage(path: string): Promise<ApiResponse<void>> {
    return this.makeRequest('/upload/image', 'DELETE', { path });
  }

  async sendNotification(userId: string, title: string, body: string, data?: any): Promise<ApiResponse<void>> {
    return this.makeRequest('/notifications/send', 'POST', {
      userId,
      title,
      body,
      data
    });
  }
}