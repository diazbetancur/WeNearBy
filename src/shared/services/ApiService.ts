/**
 * Abstract API Service Base Class
 *
 * Esta clase abstracta define la interfaz común para todos los servicios de API.
 * Permite fácil migración entre diferentes proveedores (Firebase, Node.js, etc.)
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified?: boolean;
  createdAt?: Date;
  lastLoginAt?: Date;
}

export interface Business {
  id: string;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  email?: string;
  category: string;
  rating?: number;
  imageUrl?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  ownerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  stock?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  customerId: string;
  businessId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentMethod: string;
  deliveryAddress?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

/**
 * Clase base abstracta para servicios de API
 */
export abstract class ApiService {
  protected baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  // ========== AUTH METHODS ==========
  abstract signIn(email: string, password: string): Promise<ApiResponse<AuthUser>>;
  abstract signUp(email: string, password: string): Promise<ApiResponse<AuthUser>>;
  abstract signOut(): Promise<ApiResponse<void>>;
  abstract getCurrentUser(): Promise<ApiResponse<AuthUser | null>>;
  abstract resetPassword(email: string): Promise<ApiResponse<void>>;
  abstract updateProfile(userData: Partial<AuthUser>): Promise<ApiResponse<AuthUser>>;

  // ========== BUSINESS METHODS ==========
  abstract getBusinesses(options?: QueryOptions): Promise<ApiResponse<Business[]>>;
  abstract getBusinessById(id: string): Promise<ApiResponse<Business>>;
  abstract createBusiness(
    businessData: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Business>>;
  abstract updateBusiness(
    id: string,
    businessData: Partial<Business>
  ): Promise<ApiResponse<Business>>;
  abstract deleteBusiness(id: string): Promise<ApiResponse<void>>;
  abstract getBusinessesByOwner(ownerId: string): Promise<ApiResponse<Business[]>>;
  abstract searchBusinesses(
    query: string,
    options?: QueryOptions
  ): Promise<ApiResponse<Business[]>>;

  // ========== PRODUCT METHODS ==========
  abstract getProducts(
    businessId?: string,
    options?: QueryOptions
  ): Promise<ApiResponse<Product[]>>;
  abstract getProductById(id: string): Promise<ApiResponse<Product>>;
  abstract createProduct(
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Product>>;
  abstract updateProduct(id: string, productData: Partial<Product>): Promise<ApiResponse<Product>>;
  abstract deleteProduct(id: string): Promise<ApiResponse<void>>;
  abstract getProductsByCategory(
    category: string,
    options?: QueryOptions
  ): Promise<ApiResponse<Product[]>>;

  // ========== ORDER METHODS ==========
  abstract getOrders(
    customerId?: string,
    businessId?: string,
    options?: QueryOptions
  ): Promise<ApiResponse<Order[]>>;
  abstract getOrderById(id: string): Promise<ApiResponse<Order>>;
  abstract createOrder(
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Order>>;
  abstract updateOrder(id: string, orderData: Partial<Order>): Promise<ApiResponse<Order>>;
  abstract deleteOrder(id: string): Promise<ApiResponse<void>>;
  abstract getOrdersByStatus(
    status: Order['status'],
    options?: QueryOptions
  ): Promise<ApiResponse<Order[]>>;

  // ========== UTILITY METHODS ==========
  abstract uploadImage(file: any, path: string): Promise<ApiResponse<string>>;
  abstract deleteImage(path: string): Promise<ApiResponse<void>>;
  abstract sendNotification(
    userId: string,
    title: string,
    body: string,
    data?: any
  ): Promise<ApiResponse<void>>;

  // ========== HELPER METHODS ==========
  protected createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message
    };
  }

  protected createErrorResponse(error: string): ApiResponse {
    return {
      success: false,
      error
    };
  }

  protected handleError(error: any): ApiResponse {
    console.error('API Service Error:', error);

    if (error?.code) {
      // Firebase/API specific errors
      return this.createErrorResponse(this.mapErrorCode(error.code));
    }

    return this.createErrorResponse(error?.message || 'Error desconocido');
  }

  protected mapErrorCode(code: string): string {
    const errorMap: Record<string, string> = {
      // Auth errors
      'auth/invalid-email': 'Correo electrónico inválido',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'El correo ya está en uso',
      'auth/weak-password': 'La contraseña es muy débil',
      'auth/user-disabled': 'Cuenta deshabilitada',
      'auth/invalid-api-key': 'Clave API inválida',
      'auth/configuration-not-found': 'Configuración no encontrada',

      // Firestore errors
      'permission-denied': 'Permisos insuficientes',
      'not-found': 'Documento no encontrado',
      'already-exists': 'El documento ya existe',
      'resource-exhausted': 'Cuota excedida',
      unauthenticated: 'Usuario no autenticado',

      // Network errors
      unavailable: 'Servicio no disponible',
      'deadline-exceeded': 'Tiempo de espera agotado',
      internal: 'Error interno del servidor'
    };

    return errorMap[code] || `Error: ${code}`;
  }
}
