import type { Product } from '../../types/models';

/**
 * Options for listing products by store
 */
export interface ListByStoreOptions {
  categoryId?: string;
  activeOnly?: boolean;
}

/**
 * ProductService interface
 * Manages product CRUD operations
 */
export interface ProductService {
  /**
   * List products for a specific store
   * @param storeId Store ID
   * @param opts Optional filters (categoryId, activeOnly)
   * @returns Promise with array of Products
   */
  listByStore(storeId: string, opts?: ListByStoreOptions): Promise<Product[]>;

  /**
   * Create a new product
   * @returns Promise with the created Product
   */
  create(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product>;

  /**
   * Update an existing product
   * @param id Product ID
   * @param patch Partial product data to update
   * @returns Promise with the updated Product
   */
  update(id: string, patch: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product>;
}
