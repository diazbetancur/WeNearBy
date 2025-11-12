/**
 * Service Registry
 * Central registry for all services with environment-based selection (Firebase vs Mock)
 *
 * Usage:
 *   import { getAuthService, getStoreService } from '@/services/registry';
 *   const authService = getAuthService();
 *   await authService.signUpEmail(email, password);
 */

import type { AuthService } from './auth/auth.service';
import { FirebaseAuthService } from './auth/firebase-auth.service';
import { FirebaseOrderIntentService } from './orders/firebase-order-intent.service';
import type { OrderIntentService } from './orders/order-intent.service';
import { FirebaseProductService } from './products/firebase-product.service';
import type { ProductService } from './products/product.service';
import { FirebaseRoleService } from './role/firebase-role.service';
import type { RoleService } from './role/role.service';
import { FirebaseStoreService } from './stores/firebase-store.service';
import { MockStoreService } from './stores/mock-store.service';
import type { StoreService } from './stores/store.service';

// Environment flag to select implementation (Firebase | Mock)
const USE_FIREBASE = process.env.EXPO_PUBLIC_USE_FIREBASE === 'true';

// ---------- Stub Implementations (throw until real implementations are wired) ----------

class StubAuthService implements AuthService {
  signUpEmail(): Promise<never> {
    throw new Error('AuthService not implemented');
  }
  signInEmail(): Promise<never> {
    throw new Error('AuthService not implemented');
  }
  signOut(): Promise<never> {
    throw new Error('AuthService not implemented');
  }
  onAuthStateChanged(): () => void {
    throw new Error('AuthService not implemented');
  }
  getCurrentUser(): Promise<never> {
    throw new Error('AuthService not implemented');
  }
}

class StubRoleService implements RoleService {
  requestVendorRole(): Promise<never> {
    throw new Error('RoleService not implemented');
  }
  watchVendorProfile(): () => void {
    throw new Error('RoleService not implemented');
  }
}

class StubStoreService implements StoreService {
  create(): Promise<never> {
    throw new Error('StoreService not implemented');
  }
  update(): Promise<never> {
    throw new Error('StoreService not implemented');
  }
  get(): Promise<never> {
    throw new Error('StoreService not implemented');
  }
  listNearby(): Promise<never> {
    throw new Error('StoreService not implemented');
  }
}

class StubProductService implements ProductService {
  listByStore(): Promise<never> {
    throw new Error('ProductService not implemented');
  }
  create(): Promise<never> {
    throw new Error('ProductService not implemented');
  }
  update(): Promise<never> {
    throw new Error('ProductService not implemented');
  }
}

class StubOrderIntentService implements OrderIntentService {
  create(): Promise<never> {
    throw new Error('OrderIntentService not implemented');
  }
}

// ---------- Service Instance Singletons ----------

let authServiceInstance: AuthService | null = null;
let roleServiceInstance: RoleService | null = null;
let storeServiceInstance: StoreService | null = null;
let productServiceInstance: ProductService | null = null;
let orderIntentServiceInstance: OrderIntentService | null = null;

// ---------- Getters (lazy initialization) ----------

export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    if (USE_FIREBASE) {
      // Firebase implementation
      authServiceInstance = new FirebaseAuthService();
    } else {
      // TODO: Wire Mock implementation
      // authServiceInstance = new MockAuthService();
      authServiceInstance = new StubAuthService();
    }
  }
  return authServiceInstance;
}

export function getRoleService(): RoleService {
  if (!roleServiceInstance) {
    if (USE_FIREBASE) {
      // Firebase implementation
      roleServiceInstance = new FirebaseRoleService();
    } else {
      // TODO: Wire Mock implementation
      // roleServiceInstance = new MockRoleService();
      roleServiceInstance = new StubRoleService();
    }
  }
  return roleServiceInstance;
}

export function getStoreService(): StoreService {
  if (!storeServiceInstance) {
    if (USE_FIREBASE) {
      // Firebase implementation
      storeServiceInstance = new FirebaseStoreService();
    } else {
      // Mock implementation with 15 test stores
      storeServiceInstance = new MockStoreService();
    }
  }
  return storeServiceInstance;
}

export function getProductService(): ProductService {
  if (!productServiceInstance) {
    if (USE_FIREBASE) {
      // Firebase implementation
      productServiceInstance = new FirebaseProductService();
    } else {
      // TODO: Wire Mock implementation
      // productServiceInstance = new MockProductService();
      productServiceInstance = new StubProductService();
    }
  }
  return productServiceInstance;
}

export function getOrderIntentService(): OrderIntentService {
  if (!orderIntentServiceInstance) {
    if (USE_FIREBASE) {
      // Firebase implementation
      orderIntentServiceInstance = new FirebaseOrderIntentService();
    } else {
      // TODO: Wire Mock implementation
      // orderIntentServiceInstance = new MockOrderIntentService();
      orderIntentServiceInstance = new StubOrderIntentService();
    }
  }
  return orderIntentServiceInstance;
}

// ---------- Registry Reset (useful for testing) ----------

export function resetServiceRegistry(): void {
  authServiceInstance = null;
  roleServiceInstance = null;
  storeServiceInstance = null;
  productServiceInstance = null;
  orderIntentServiceInstance = null;
}
