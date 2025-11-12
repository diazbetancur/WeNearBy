/**
 * Firebase implementation of StoreService
 * Manages stores collection in Firestore
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Timestamp
} from 'firebase/firestore';
import { distanceMeters, getBoundingBox, isCoveredByRadius } from '../../geo/geo';
import { db } from '../../lib/firebase';
import type { Store } from '../../types/models';
import type { ListNearbyParams, StoreService } from './store.service';

/**
 * Firestore document structure for stores
 */
interface StoreDoc {
  vendorUserId: string;
  name: string;
  description?: string;
  address: string;
  geo: {
    lat: number;
    lng: number;
  };
  coverageKm: number;
  isOpen: boolean;
  hasDelivery: boolean;
  contact: {
    phone?: string;
    whatsapp?: string;
    email?: string;
  };
  categoryIds?: string[];
  featured?: boolean;
  createdAt: Timestamp | ReturnType<typeof serverTimestamp>;
  updatedAt: Timestamp | ReturnType<typeof serverTimestamp>;
  operatingHours?: {
    open: string;
    close: string;
  };
}

/**
 * Convert Firestore document to Store model
 */
function firestoreToStore(id: string, data: StoreDoc): Store {
  return {
    id,
    vendorUserId: data.vendorUserId,
    name: data.name,
    description: data.description,
    address: data.address,
    geo: data.geo,
    coverageKm: data.coverageKm,
    isOpen: data.isOpen,
    hasDelivery: data.hasDelivery,
    contact: data.contact,
    categoryIds: data.categoryIds,
    featured: data.featured,
    createdAt: (data.createdAt as Timestamp).toMillis(),
    updatedAt: (data.updatedAt as Timestamp).toMillis(),
    operatingHours: data.operatingHours
  };
}

/**
 * Convert Store model to Firestore document
 */
function storeToFirestore(
  store: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>
): Omit<StoreDoc, 'createdAt' | 'updatedAt'> {
  return {
    vendorUserId: store.vendorUserId,
    name: store.name,
    description: store.description,
    address: store.address,
    geo: store.geo,
    coverageKm: store.coverageKm,
    isOpen: store.isOpen,
    hasDelivery: store.hasDelivery,
    contact: store.contact,
    categoryIds: store.categoryIds,
    featured: store.featured,
    operatingHours: store.operatingHours
  };
}

/**
 * Firebase implementation of StoreService
 *
 * @example
 * ```typescript
 * const storeService = new FirebaseStoreService();
 *
 * // Create a store
 * const store = await storeService.create({
 *   vendorUserId: 'vendor-123',
 *   name: 'Mi Tienda',
 *   address: 'Calle 123, Bogotá',
 *   geo: { lat: 4.7110, lng: -74.0721 },
 *   coverageKm: 3,
 *   isOpen: true,
 *   hasDelivery: true,
 *   contact: { phone: '+57 123 456 7890' }
 * });
 *
 * // List nearby stores
 * const nearby = await storeService.listNearby({
 *   center: { lat: 4.7110, lng: -74.0721 },
 *   isOpen: true,
 *   hasDelivery: true,
 *   limit: 20
 * });
 * ```
 */
export class FirebaseStoreService implements StoreService {
  private readonly collectionName = 'stores';

  /**
   * Create a new store in Firestore
   *
   * @param store Store data without id and timestamps
   * @returns Promise with the created Store
   *
   * @throws Error if Firestore operation fails
   */
  async create(store: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>): Promise<Store> {
    const docRef = doc(collection(db, this.collectionName));
    const now = serverTimestamp();

    const storeDoc: StoreDoc = {
      ...storeToFirestore(store),
      createdAt: now,
      updatedAt: now
    };

    await setDoc(docRef, storeDoc);

    // Fetch the created document to get server-generated timestamps
    const created = await getDoc(docRef);
    if (!created.exists()) {
      throw new Error('Failed to create store');
    }

    return firestoreToStore(docRef.id, created.data() as StoreDoc);
  }

  /**
   * Update an existing store
   *
   * @param id Store ID
   * @param patch Partial store data to update
   * @returns Promise with the updated Store
   *
   * @throws Error if store not found or Firestore operation fails
   */
  async update(
    id: string,
    patch: Partial<Omit<Store, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Store> {
    const docRef = doc(db, this.collectionName, id);

    // Verify store exists
    const existing = await getDoc(docRef);
    if (!existing.exists()) {
      throw new Error(`Store with id ${id} not found`);
    }

    // Update with server timestamp
    await updateDoc(docRef, {
      ...patch,
      updatedAt: serverTimestamp()
    });

    // Fetch updated document
    const updated = await getDoc(docRef);
    return firestoreToStore(id, updated.data() as StoreDoc);
  }

  /**
   * Get a store by ID
   *
   * @param id Store ID
   * @returns Promise with the Store or null if not found
   */
  async get(id: string): Promise<Store | null> {
    const docRef = doc(db, this.collectionName, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return firestoreToStore(snapshot.id, snapshot.data() as StoreDoc);
  }

  /**
   * List stores near a location with optional filters
   *
   * Implementation strategy:
   * 1. Use bounding box to reduce Firestore query size
   * 2. Fetch stores from Firestore with basic filters
   * 3. Apply client-side filtering for coverage radius
   * 4. Sort by distance
   * 5. Apply pagination
   *
   * Performance: Optimized for 10-50 stores, works well up to ~200 stores
   *
   * @param params Query parameters
   * @returns Promise with array of Stores sorted by distance
   *
   * @example
   * ```typescript
   * // Find open stores with delivery within 5km
   * const stores = await storeService.listNearby({
   *   center: { lat: 4.7110, lng: -74.0721 },
   *   isOpen: true,
   *   hasDelivery: true,
   *   limit: 10,
   *   offset: 0
   * });
   * ```
   */
  async listNearby(params: ListNearbyParams): Promise<Store[]> {
    const {
      center,
      radiusKm = 10, // Default 10km search radius
      isOpen = true, // Default: only open stores
      hasDelivery,
      categoryId,
      limit = 20,
      offset = 0
    } = params;

    // Step 1: Calculate bounding box for efficient query
    const bounds = getBoundingBox(center, radiusKm);

    // Step 2: Build Firestore query with basic filters
    // Note: Firestore has limitations on composite queries, so we apply
    // some filters client-side after fetching
    let q = query(
      collection(db, this.collectionName),
      where('geo.lat', '>=', bounds.minLat),
      where('geo.lat', '<=', bounds.maxLat)
    );

    // Fetch stores within bounding box
    const snapshot = await getDocs(q);

    // Step 3: Convert to Store models and apply client-side filters
    let stores = snapshot.docs
      .map((doc) => firestoreToStore(doc.id, doc.data() as StoreDoc))
      .filter((store) => {
        // Filter by longitude (not done in Firestore query)
        if (store.geo.lng < bounds.minLng || store.geo.lng > bounds.maxLng) {
          return false;
        }

        // Filter by isOpen
        if (isOpen !== undefined && store.isOpen !== isOpen) {
          return false;
        }

        // Filter by hasDelivery
        if (hasDelivery !== undefined && store.hasDelivery !== hasDelivery) {
          return false;
        }

        // Filter by categoryId
        if (categoryId && (!store.categoryIds || !store.categoryIds.includes(categoryId))) {
          return false;
        }

        // Filter by coverage radius (user must be within store's delivery area)
        if (!isCoveredByRadius(center, { geo: store.geo, coverageKm: store.coverageKm })) {
          return false;
        }

        return true;
      });

    // Step 4: Calculate distances and sort
    const storesWithDistance = stores.map((store) => ({
      store,
      distance: distanceMeters(center, store.geo)
    }));

    storesWithDistance.sort((a, b) => a.distance - b.distance);

    // Step 5: Apply pagination
    const paginatedStores = storesWithDistance
      .slice(offset, offset + limit)
      .map((item) => item.store);

    return paginatedStores;
  }

  /**
   * List stores by vendor user ID
   * @param vendorUserId Vendor's user ID
   * @returns Promise with array of Stores
   */
  async listByVendor(vendorUserId: string): Promise<Store[]> {
    const q = query(collection(db, this.collectionName), where('vendorUserId', '==', vendorUserId));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => firestoreToStore(doc.id, doc.data() as StoreDoc));
  }
}
