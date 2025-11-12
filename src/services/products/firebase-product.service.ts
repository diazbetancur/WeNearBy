/**
 * Firebase implementation of ProductService
 * Manages products in Firestore with image upload to Storage
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
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import type { Product } from '../../types/models';
import type { ListByStoreOptions, ProductService } from './product.service';

const PRODUCTS_COLLECTION = 'products';

/**
 * Convert Firestore document to Product
 */
function firestoreToProduct(id: string, data: any): Product {
  return {
    id,
    storeId: data.storeId,
    name: data.name,
    description: data.description,
    price: data.price,
    currency: data.currency || 'COP',
    images: data.images || [],
    tags: data.tags || [],
    active: data.active ?? true,
    createdAt: (data.createdAt as Timestamp)?.toMillis() || Date.now()
  };
}

/**
 * Convert Product to Firestore document
 */
function productToFirestore(product: Omit<Product, 'id' | 'createdAt'>) {
  return {
    storeId: product.storeId,
    name: product.name,
    description: product.description || null,
    price: product.price,
    currency: product.currency,
    images: product.images,
    tags: product.tags || [],
    active: product.active,
    createdAt: serverTimestamp()
  };
}

/**
 * Upload image to Firebase Storage
 * Path: stores/{storeId}/products/{productId}/{imageId}
 *
 * @param storeId Store ID
 * @param productId Product ID
 * @param imageBlob Image blob/file
 * @param imageId Image ID (index)
 * @returns Promise with download URL
 */
export async function uploadProductImage(
  storeId: string,
  productId: string,
  imageBlob: Blob,
  imageId: string
): Promise<string> {
  const imagePath = `stores/${storeId}/products/${productId}/${imageId}`;
  const imageRef = ref(storage, imagePath);

  await uploadBytes(imageRef, imageBlob);
  const downloadURL = await getDownloadURL(imageRef);

  return downloadURL;
}

/**
 * Firebase implementation of ProductService
 *
 * Features:
 * - List products by store with filters (category, active)
 * - Create product with image upload to Storage
 * - Update product
 * - Automatic timestamps with serverTimestamp()
 *
 * @example
 * ```typescript
 * const productService = new FirebaseProductService();
 *
 * // List active products
 * const products = await productService.listByStore('store-1', {
 *   activeOnly: true
 * });
 *
 * // Create product with images
 * const product = await productService.create({
 *   storeId: 'store-1',
 *   name: 'Pizza Margarita',
 *   price: 25000,
 *   currency: 'COP',
 *   images: [{ url: 'https://...', alt: 'Pizza' }],
 *   active: true
 * });
 * ```
 */
export class FirebaseProductService implements ProductService {
  /**
   * List products for a specific store
   *
   * @param storeId Store ID
   * @param opts Optional filters (categoryId, activeOnly)
   * @returns Promise with array of Products
   */
  async listByStore(storeId: string, opts?: ListByStoreOptions): Promise<Product[]> {
    const productsRef = collection(db, PRODUCTS_COLLECTION);

    // Build query
    let q = query(productsRef, where('storeId', '==', storeId));

    // Filter by active status (default: show all)
    if (opts?.activeOnly) {
      q = query(q, where('active', '==', true));
    }

    // Filter by category (using tags array)
    if (opts?.categoryId) {
      q = query(q, where('tags', 'array-contains', opts.categoryId));
    }

    const snapshot = await getDocs(q);
    const products: Product[] = [];

    for (const docSnap of snapshot.docs) {
      products.push(firestoreToProduct(docSnap.id, docSnap.data()));
    }

    // Sort by name (client-side since Firestore query ordering is limited)
    products.sort((a, b) => a.name.localeCompare(b.name));

    return products;
  }

  /**
   * Create a new product
   *
   * Note: Images must be uploaded separately using uploadProductImage()
   * and URLs passed in product.images
   *
   * @param product Product data without id and timestamps
   * @returns Promise with the created Product
   */
  async create(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    // Validate images (1-5)
    if (product.images.length < 1 || product.images.length > 5) {
      throw new Error('El producto debe tener entre 1 y 5 imágenes');
    }

    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const newDocRef = doc(productsRef);

    const firestoreData = productToFirestore(product);

    await setDoc(newDocRef, firestoreData);

    // Read back the created document
    const snapshot = await getDoc(newDocRef);
    if (!snapshot.exists()) {
      throw new Error('Error al crear el producto');
    }

    return firestoreToProduct(snapshot.id, snapshot.data());
  }

  /**
   * Update an existing product
   *
   * @param id Product ID
   * @param patch Partial product data to update
   * @returns Promise with the updated Product
   *
   * @throws Error if product not found or images validation fails
   */
  async update(id: string, patch: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product> {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);

    // Validate images if provided (1-5)
    if (patch.images && (patch.images.length < 1 || patch.images.length > 5)) {
      throw new Error('El producto debe tener entre 1 y 5 imágenes');
    }

    // Build update object (filter out undefined values)
    const updateData: Record<string, any> = {};

    if (patch.storeId !== undefined) updateData.storeId = patch.storeId;
    if (patch.name !== undefined) updateData.name = patch.name;
    if (patch.description !== undefined) updateData.description = patch.description || null;
    if (patch.price !== undefined) updateData.price = patch.price;
    if (patch.currency !== undefined) updateData.currency = patch.currency;
    if (patch.images !== undefined) updateData.images = patch.images;
    if (patch.tags !== undefined) updateData.tags = patch.tags;
    if (patch.active !== undefined) updateData.active = patch.active;

    updateData.updatedAt = serverTimestamp();

    await updateDoc(productRef, updateData);

    // Read back the updated document
    const snapshot = await getDoc(productRef);
    if (!snapshot.exists()) {
      throw new Error(`Producto con id ${id} no encontrado`);
    }

    return firestoreToProduct(snapshot.id, snapshot.data());
  }
}
