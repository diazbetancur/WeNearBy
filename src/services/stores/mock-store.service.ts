/**
 * Mock implementation of StoreService for development and testing
 * Provides in-memory store data with simulated CRUD operations
 * Generates 50 test stores for performance testing
 */

import { distanceMeters, isCoveredByRadius } from '../../geo/geo';
import type { Store } from '../../types/models';
import type { ListNearbyParams, StoreService } from './store.service';

/**
 * Generate 50 dummy stores for testing
 * Creates stores in grid pattern around Bogotá center for performance testing (<200ms with 50 items)
 */
function generateMockStores(): Store[] {
  const baseTimestamp = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days ago

  const storeNames = [
    'Panadería El Sol',
    'Ferretería La Fortaleza',
    'Farmacia Salud Total',
    'Restaurante La Puerta Falsa',
    'Supermercado La Economía',
    'Librería Nacional',
    'Veterinaria Amigos Peludos',
    'Tintorería Clean Express',
    'Óptica Visión Clara',
    'Gimnasio Fitness Zone',
    'Cafetería Aroma',
    'Juguetería Imaginación',
    'Lavandería Express',
    'Floristería Jardín Secreto',
    'Pizzería Napolitana',
    'Heladería Frozen',
    'Carnicería Premium',
    'Frutería La Cosecha',
    'Zapatería Pasos',
    'Tienda de Ropa Moda',
    'Electrodomésticos Tech',
    'Peluquería Estilo',
    'Spa Relax',
    'Taller Mecánico Ruedas',
    'Papelería Escolar',
    'Joyería Brillos',
    'Perfumería Fragance',
    'Licorería La Bodega',
    'Tapicería Confort',
    'Cerrajería Segura',
    'Repostería Dulce',
    'Asadero El Carbón',
    'Sushi Bar Tokyo',
    'Hamburguesería Burger King',
    'Tacos Mexicanos',
    'Comida China Dragón',
    'Pastelería Delicias',
    'Churros Españoles',
    'Empanadas Colombianas',
    'Arepas La Plaza',
    'Café Gourmet',
    'Té Oriental',
    'Smoothies Natural',
    'Parrilla Argentina',
    'Ceviche Peruano',
    'Hot Dogs Americanos',
    'Donuts Dulces',
    'Croissants Franceses',
    'Bagels Nueva York',
    'Waffles Belgas',
    'Crepes Parisinos'
  ];

  const categories = [
    ['bakery', 'food'],
    ['hardware'],
    ['pharmacy', 'health'],
    ['restaurant', 'food'],
    ['supermarket', 'food'],
    ['bookstore'],
    ['veterinary', 'pets'],
    ['laundry', 'services'],
    ['optics', 'health'],
    ['gym', 'fitness'],
    ['cafe', 'food'],
    ['toys', 'children'],
    ['laundry', 'services'],
    ['flowers', 'gifts'],
    ['restaurant', 'food', 'italian'],
    ['desserts', 'food'],
    ['butcher', 'food'],
    ['fruits', 'food'],
    ['shoes', 'fashion'],
    ['clothing', 'fashion'],
    ['electronics'],
    ['beauty', 'services'],
    ['spa', 'wellness'],
    ['automotive', 'services'],
    ['stationery', 'school'],
    ['jewelry', 'gifts'],
    ['perfume', 'beauty'],
    ['liquor', 'beverages'],
    ['furniture'],
    ['locksmith', 'services'],
    ['bakery', 'desserts'],
    ['restaurant', 'bbq'],
    ['restaurant', 'japanese'],
    ['restaurant', 'fast-food'],
    ['restaurant', 'mexican'],
    ['restaurant', 'chinese'],
    ['bakery', 'desserts'],
    ['restaurant', 'spanish'],
    ['restaurant', 'colombian'],
    ['restaurant', 'colombian'],
    ['cafe', 'beverages'],
    ['cafe', 'beverages'],
    ['beverages', 'healthy'],
    ['restaurant', 'bbq'],
    ['restaurant', 'peruvian'],
    ['restaurant', 'fast-food'],
    ['bakery', 'desserts'],
    ['bakery', 'french'],
    ['bakery', 'american'],
    ['bakery', 'belgian'],
    ['bakery', 'french']
  ];

  const descriptions = [
    'Productos frescos todos los días',
    'Todo lo que necesitas para tu hogar',
    'Medicamentos y cuidado personal',
    'Comida tradicional de calidad',
    'Los mejores precios de la zona',
    'La mejor selección de libros',
    'Cuidado veterinario profesional',
    'Servicio rápido y confiable',
    'Exámenes visuales y monturas',
    'Entrena con los mejores',
    'El mejor café de la ciudad',
    'Diversión para toda la familia',
    'Lavado y planchado express',
    'Flores frescas y arreglos especiales',
    'Pizza artesanal al horno',
    'Los mejores helados naturales',
    'Carnes selectas y frescas',
    'Frutas y verduras de primera',
    'Calzado de todas las marcas',
    'Última moda en ropa',
    'Tecnología para tu hogar',
    'Cortes modernos y clásicos',
    'Tratamientos de relajación',
    'Reparación y mantenimiento',
    'Útiles escolares y oficina',
    'Joyas y accesorios únicos',
    'Fragancias importadas',
    'Bebidas nacionales e importadas',
    'Muebles a tu medida',
    'Cerrajería 24 horas',
    'Pasteles para toda ocasión',
    'Carnes a la parrilla',
    'Sushi fresco diario',
    'Hamburguesas gourmet',
    'Auténtico sabor mexicano',
    'Comida china tradicional',
    'Pasteles y postres',
    'Churros recién hechos',
    'Empanadas caseras',
    'Arepas de todos los tipos',
    'Café de especialidad',
    'Variedad de tés',
    'Batidos naturales',
    'Parrillada argentina',
    'Ceviche fresco',
    'Hot dogs artesanales',
    'Donas glaseadas',
    'Croissants mantequilla',
    'Bagels recién horneados',
    'Waffles belgas',
    'Crepes dulces y salados'
  ];

  // Generate stores in grid pattern around Bogotá center (Chapinero)
  const centerLat = 4.6533;
  const centerLng = -74.0627;
  const latStep = 0.01; // ~1.1 km
  const lngStep = 0.01; // ~1.1 km

  const stores: Store[] = [];

  for (let i = 0; i < 50; i++) {
    const row = Math.floor(i / 10);
    const col = i % 10;
    // Add small random offset for more realistic distribution
    const lat = centerLat + (row - 2.5) * latStep + (Math.random() - 0.5) * 0.003;
    const lng = centerLng + (col - 4.5) * lngStep + (Math.random() - 0.5) * 0.003;

    const isOpen = Math.random() > 0.2; // 80% open
    const hasDelivery = Math.random() > 0.3; // 70% with delivery
    const featured = Math.random() > 0.7; // 30% featured

    stores.push({
      id: `store-${i + 1}`,
      vendorUserId: `vendor-${i + 1}`,
      name: storeNames[i] || `Tienda ${i + 1}`,
      description: descriptions[i % descriptions.length],
      address: `Calle ${10 + i} #${15 + (i % 20)}-${20 + (i % 40)}, Bogotá`,
      geo: { lat, lng },
      coverageKm: 2 + Math.floor(Math.random() * 4), // 2-5 km
      isOpen,
      hasDelivery,
      contact: {
        phone: `+57 3${10 + (i % 3)}${i.toString().padStart(7, '0')}`,
        whatsapp: hasDelivery ? `+57 3${10 + (i % 3)}${i.toString().padStart(7, '0')}` : undefined,
        email: i % 3 === 0 ? `info@tienda${i + 1}.co` : undefined
      },
      categoryIds: categories[i] || ['general'],
      featured,
      createdAt: baseTimestamp + i * 86400000, // 1 day apart
      updatedAt: baseTimestamp + i * 86400000,
      operatingHours: isOpen
        ? { open: `0${6 + (i % 4)}:00`, close: `${18 + (i % 5)}:00` }
        : undefined
    });
  }

  return stores;
}

/**
 * Mock implementation of StoreService
 * Stores data in memory for development and testing
 *
 * Performance: <200ms with 50 items (memoization, filtering, sorting)
 *
 * @example
 * ```typescript
 * const storeService = new MockStoreService();
 *
 * // List nearby stores
 * const nearby = await storeService.listNearby({
 *   center: { lat: 4.6753, lng: -74.0501 }, // Bogotá center
 *   isOpen: true,
 *   hasDelivery: true,
 *   limit: 20
 * });
 * ```
 */
export class MockStoreService implements StoreService {
  private readonly stores: Map<string, Store>;
  private nextId = 51; // Start after generated stores

  constructor() {
    this.stores = new Map();
    // Initialize with 50 mock stores
    const mockStores = generateMockStores();
    for (const store of mockStores) {
      this.stores.set(store.id, store);
    }
  }

  /**
   * Create a new store
   *
   * @param store Store data without id and timestamps
   * @returns Promise with the created Store
   */
  async create(store: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>): Promise<Store> {
    const now = Date.now();
    const newStore: Store = {
      ...store,
      id: `store-${this.nextId++}`,
      createdAt: now,
      updatedAt: now
    };

    this.stores.set(newStore.id, newStore);
    return newStore;
  }

  /**
   * Update an existing store
   *
   * @param id Store ID
   * @param patch Partial store data to update
   * @returns Promise with the updated Store
   *
   * @throws Error if store not found
   */
  async update(
    id: string,
    patch: Partial<Omit<Store, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Store> {
    const existing = this.stores.get(id);
    if (!existing) {
      throw new Error(`Store with id ${id} not found`);
    }

    const updated: Store = {
      ...existing,
      ...patch,
      updatedAt: Date.now()
    };

    this.stores.set(id, updated);
    return updated;
  }

  /**
   * Get a store by ID
   *
   * @param id Store ID
   * @returns Promise with the Store or null if not found
   */
  async get(id: string): Promise<Store | null> {
    const store = this.stores.get(id);
    return store || null;
  }

  /**
   * List stores near a location with optional filters
   * Implementation uses the same logic as FirebaseStoreService but with in-memory data
   * Optimized for <200ms with 50 items
   *
   * @param params Query parameters
   * @returns Promise with array of Stores sorted by distance
   */
  async listNearby(params: ListNearbyParams): Promise<Store[]> {
    const { center, isOpen = true, hasDelivery, categoryId, limit = 20, offset = 0 } = params;

    // Filter stores (optimized with early returns)
    const filteredStores = Array.from(this.stores.values()).filter((store) => {
      // Filter by isOpen
      if (isOpen !== undefined && store.isOpen !== isOpen) {
        return false;
      }

      // Filter by hasDelivery
      if (hasDelivery !== undefined && store.hasDelivery !== hasDelivery) {
        return false;
      }

      // Filter by categoryId
      if (categoryId && !store.categoryIds?.includes(categoryId)) {
        return false;
      }

      // Filter by coverage radius
      if (!isCoveredByRadius(center, { geo: store.geo, coverageKm: store.coverageKm })) {
        return false;
      }

      return true;
    });

    // Calculate distances and sort (single pass)
    const storesWithDistance = filteredStores.map((store) => ({
      store,
      distance: distanceMeters(center, store.geo)
    }));

    storesWithDistance.sort((a, b) => a.distance - b.distance);

    // Apply pagination
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
    return Array.from(this.stores.values()).filter(
      (store) => store.vendorUserId === vendorUserId
    );
  }
}
