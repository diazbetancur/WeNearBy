import type { LatLng, Store } from '../../types/models';

/**
 * Parameters for nearby store query
 */
export interface ListNearbyParams {
  center: LatLng;
  radiusKm?: number;
  isOpen?: boolean;
  hasDelivery?: boolean;
  categoryId?: string;
  limit?: number;
  offset?: number;
}

/**
 * StoreService interface
 * Manages store CRUD and nearby queries
 */
export interface StoreService {
  /**
   * Create a new store
   * @returns Promise with the created Store
   */
  create(store: Omit<Store, 'id' | 'createdAt'>): Promise<Store>;

  /**
   * Update an existing store
   * @param id Store ID
   * @param patch Partial store data to update
   * @returns Promise with the updated Store
   */
  update(id: string, patch: Partial<Omit<Store, 'id' | 'createdAt'>>): Promise<Store>;

  /**
   * Get a store by ID
   * @returns Promise with the Store or null if not found
   */
  get(id: string): Promise<Store | null>;

  /**
   * List stores near a location with optional filters
   * @returns Promise with array of Stores
   */
  listNearby(params: ListNearbyParams): Promise<Store[]>;

  /**
   * List stores by vendor user ID
   * @param vendorUserId Vendor's user ID
   * @returns Promise with array of Stores
   */
  listByVendor(vendorUserId: string): Promise<Store[]>;
}
