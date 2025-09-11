import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { auth, firestore } from '../../../services/firebase';
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
 * Implementación de ApiService usando Firebase
 * 
 * Esta clase implementa todos los métodos abstractos de ApiService
 * usando Firebase como backend (Firestore + Authentication)
 */
export class FirebaseService extends ApiService {
  private authUser: User | null = null;

  constructor() {
    super('https://firestore.googleapis.com'); // Firebase URL base
    this.initAuthListener();
  }

  private initAuthListener(): void {
    onAuthStateChanged(auth, (user) => {
      this.authUser = user;
    });
  }

  // ========== AUTH METHODS ==========
  async signIn(email: string, password: string): Promise<ApiResponse<AuthUser>> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const authUser = this.mapFirebaseUser(userCredential.user);
      return this.createSuccessResponse(authUser, 'Inicio de sesión exitoso');
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async signUp(email: string, password: string): Promise<ApiResponse<AuthUser>> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const authUser = this.mapFirebaseUser(userCredential.user);
      return this.createSuccessResponse(authUser, 'Registro exitoso');
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async signOut(): Promise<ApiResponse<void>> {
    try {
      await signOut(auth);
      return this.createSuccessResponse(undefined, 'Sesión cerrada exitosamente');
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getCurrentUser(): Promise<ApiResponse<AuthUser | null>> {
    try {
      if (this.authUser) {
        const authUser = this.mapFirebaseUser(this.authUser);
        return this.createSuccessResponse(authUser);
      }
      return this.createSuccessResponse(null);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async resetPassword(email: string): Promise<ApiResponse<void>> {
    try {
      await sendPasswordResetEmail(auth, email);
      return this.createSuccessResponse(undefined, 'Correo de recuperación enviado');
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async updateProfile(userData: Partial<AuthUser>): Promise<ApiResponse<AuthUser>> {
    try {
      if (!this.authUser) {
        return this.createErrorResponse('Usuario no autenticado');
      }

      await updateProfile(this.authUser, {
        displayName: userData.displayName,
        photoURL: userData.photoURL
      });

      const updatedUser = this.mapFirebaseUser(this.authUser);
      return this.createSuccessResponse(updatedUser, 'Perfil actualizado');
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // ========== BUSINESS METHODS ==========
  async getBusinesses(options?: QueryOptions): Promise<ApiResponse<Business[]>> {
    try {
      const businessesRef = collection(firestore, 'businesses');
      let q = query(businessesRef);

      if (options?.orderBy) {
        q = query(q, orderBy(options.orderBy, options.orderDirection || 'asc'));
      }

      if (options?.limit) {
        q = query(q, limit(options.limit));
      }

      if (options?.filters) {
        Object.entries(options.filters).forEach(([field, value]) => {
          q = query(q, where(field, '==', value));
        });
      }

      const querySnapshot = await getDocs(q);
      const businesses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Business));

      return this.createSuccessResponse(businesses);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getBusinessById(id: string): Promise<ApiResponse<Business>> {
    try {
      const businessDoc = await getDoc(doc(firestore, 'businesses', id));
      
      if (!businessDoc.exists()) {
        return this.createErrorResponse('Negocio no encontrado');
      }

      const business = { id: businessDoc.id, ...businessDoc.data() } as Business;
      return this.createSuccessResponse(business);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async createBusiness(businessData: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Business>> {
    try {
      const now = new Date();
      const dataToSave = {
        ...businessData,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(firestore, 'businesses'), dataToSave);
      const business = { id: docRef.id, ...dataToSave } as Business;
      
      return this.createSuccessResponse(business, 'Negocio creado exitosamente');
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async updateBusiness(id: string, businessData: Partial<Business>): Promise<ApiResponse<Business>> {
    try {
      const dataToUpdate = {
        ...businessData,
        updatedAt: new Date()
      };

      await updateDoc(doc(firestore, 'businesses', id), dataToUpdate);
      
      // Obtener el documento actualizado
      const updatedBusiness = await this.getBusinessById(id);
      return updatedBusiness;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async deleteBusiness(id: string): Promise<ApiResponse<void>> {
    try {
      await deleteDoc(doc(firestore, 'businesses', id));
      return this.createSuccessResponse(undefined, 'Negocio eliminado exitosamente');
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getBusinessesByOwner(ownerId: string): Promise<ApiResponse<Business[]>> {
    return this.getBusinesses({
      filters: { ownerId }
    });
  }

  async searchBusinesses(searchQuery: string, options?: QueryOptions): Promise<ApiResponse<Business[]>> {
    try {
      // Para búsqueda simple, filtraremos por nombre
      // En una implementación más avanzada, usarías Algolia o similar
      const businessesRef = collection(firestore, 'businesses');
      let q = query(businessesRef);

      if (options?.limit) {
        q = query(q, limit(options.limit));
      }

      const querySnapshot = await getDocs(q);
      const businesses = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Business))
        .filter(business => 
          business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          business.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          business.category.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return this.createSuccessResponse(businesses);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // ========== PRODUCT METHODS ==========
  async getProducts(businessId?: string, options?: QueryOptions): Promise<ApiResponse<Product[]>> {
    try {
      const productsRef = collection(firestore, 'products');
      let q = query(productsRef);

      if (businessId) {
        q = query(q, where('businessId', '==', businessId));
      }

      if (options?.orderBy) {
        q = query(q, orderBy(options.orderBy, options.orderDirection || 'asc'));
      }

      if (options?.limit) {
        q = query(q, limit(options.limit));
      }

      if (options?.filters) {
        Object.entries(options.filters).forEach(([field, value]) => {
          q = query(q, where(field, '==', value));
        });
      }

      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));

      return this.createSuccessResponse(products);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      const productDoc = await getDoc(doc(firestore, 'products', id));
      
      if (!productDoc.exists()) {
        return this.createErrorResponse('Producto no encontrado');
      }

      const product = { id: productDoc.id, ...productDoc.data() } as Product;
      return this.createSuccessResponse(product);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Product>> {
    try {
      const now = new Date();
      const dataToSave = {
        ...productData,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(firestore, 'products'), dataToSave);
      const product = { id: docRef.id, ...dataToSave } as Product;
      
      return this.createSuccessResponse(product, 'Producto creado exitosamente');
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<ApiResponse<Product>> {
    try {
      const dataToUpdate = {
        ...productData,
        updatedAt: new Date()
      };

      await updateDoc(doc(firestore, 'products', id), dataToUpdate);
      
      const updatedProduct = await this.getProductById(id);
      return updatedProduct;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    try {
      await deleteDoc(doc(firestore, 'products', id));
      return this.createSuccessResponse(undefined, 'Producto eliminado exitosamente');
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getProductsByCategory(category: string, options?: QueryOptions): Promise<ApiResponse<Product[]>> {
    return this.getProducts(undefined, {
      ...options,
      filters: { category }
    });
  }

  // ========== ORDER METHODS ==========
  async getOrders(customerId?: string, businessId?: string, options?: QueryOptions): Promise<ApiResponse<Order[]>> {
    try {
      const ordersRef = collection(firestore, 'orders');
      let q = query(ordersRef);

      if (customerId) {
        q = query(q, where('customerId', '==', customerId));
      }

      if (businessId) {
        q = query(q, where('businessId', '==', businessId));
      }

      if (options?.orderBy) {
        q = query(q, orderBy(options.orderBy, options.orderDirection || 'desc'));
      } else {
        q = query(q, orderBy('createdAt', 'desc'));
      }

      if (options?.limit) {
        q = query(q, limit(options.limit));
      }

      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));

      return this.createSuccessResponse(orders);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    try {
      const orderDoc = await getDoc(doc(firestore, 'orders', id));
      
      if (!orderDoc.exists()) {
        return this.createErrorResponse('Pedido no encontrado');
      }

      const order = { id: orderDoc.id, ...orderDoc.data() } as Order;
      return this.createSuccessResponse(order);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Order>> {
    try {
      const now = new Date();
      const dataToSave = {
        ...orderData,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(firestore, 'orders'), dataToSave);
      const order = { id: docRef.id, ...dataToSave } as Order;
      
      return this.createSuccessResponse(order, 'Pedido creado exitosamente');
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async updateOrder(id: string, orderData: Partial<Order>): Promise<ApiResponse<Order>> {
    try {
      const dataToUpdate = {
        ...orderData,
        updatedAt: new Date()
      };

      await updateDoc(doc(firestore, 'orders', id), dataToUpdate);
      
      const updatedOrder = await this.getOrderById(id);
      return updatedOrder;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async deleteOrder(id: string): Promise<ApiResponse<void>> {
    try {
      await deleteDoc(doc(firestore, 'orders', id));
      return this.createSuccessResponse(undefined, 'Pedido eliminado exitosamente');
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getOrdersByStatus(status: Order['status'], options?: QueryOptions): Promise<ApiResponse<Order[]>> {
    return this.getOrders(undefined, undefined, {
      ...options,
      filters: { status }
    });
  }

  // ========== UTILITY METHODS ==========
  async uploadImage(file: any, path: string): Promise<ApiResponse<string>> {
    try {
      // TODO: Implementar con Firebase Storage
      console.log('Upload image not implemented yet');
      return this.createErrorResponse('Subida de imágenes no implementada aún');
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async deleteImage(path: string): Promise<ApiResponse<void>> {
    try {
      // TODO: Implementar con Firebase Storage
      console.log('Delete image not implemented yet');
      return this.createErrorResponse('Eliminación de imágenes no implementada aún');
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async sendNotification(userId: string, title: string, body: string, data?: any): Promise<ApiResponse<void>> {
    try {
      // TODO: Implementar con Firebase Cloud Messaging
      console.log('Send notification not implemented yet');
      return this.createErrorResponse('Notificaciones no implementadas aún');
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // ========== HELPER METHODS ==========
  private mapFirebaseUser(user: User): AuthUser {
    return {
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
      emailVerified: user.emailVerified,
      createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : undefined,
      lastLoginAt: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime) : undefined
    };
  }
}