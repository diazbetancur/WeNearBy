/**
 * StoreScreen - Store Detail with Products
 *
 * Features:
 * - Store header with info
 * - Tabs by category (All, tags)
 * - Product list (only active products)
 * - Floating cart button
 * - Cart modal/sheet
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ProductCard from '../components/ProductCard';
import { CartProvider, useCart } from '../context/CartProvider';
import { getProductService } from '../services/registry';
import type { Product, Store } from '../types/models';
import CartScreen from './CartScreen';

interface StoreScreenProps {
  store: Store;
}

/**
 * Store content with cart context
 */
function StoreContent({ store }: StoreScreenProps) {
  const { itemCount, addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);

  const productService = useMemo(() => getProductService(), []);

  /**
   * Load products from service
   */
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const results = await productService.listByStore(store.id, {
        activeOnly: true, // Only show active products
        categoryId: selectedCategory || undefined
      });
      setProducts(results);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }, [store.id, selectedCategory, productService]);

  /**
   * Load products on mount and when category changes
   */
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /**
   * Extract unique categories from products
   */
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    products.forEach((product) => {
      product.tags?.forEach((tag) => categorySet.add(tag));
    });
    return ['Todos', ...Array.from(categorySet)];
  }, [products]);

  /**
   * Handle add to cart
   */
  const handleAddToCart = useCallback(
    (product: Product) => {
      addItem(product);
    },
    [addItem]
  );

  /**
   * Render product card
   */
  const renderProduct = useCallback(
    ({ item }: { item: Product }) => {
      return <ProductCard product={item} onAddToCart={handleAddToCart} />;
    },
    [handleAddToCart]
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

  /**
   * Render empty state
   */
  const renderEmpty = useCallback(() => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay productos disponibles</Text>
      </View>
    );
  }, [loading]);

  return (
    <View style={styles.container}>
      {/* Store Header */}
      <View style={styles.header}>
        <Text style={styles.storeName}>{store.name}</Text>
        {store.description && <Text style={styles.storeDescription}>{store.description}</Text>}
        <Text style={styles.storeAddress}>📍 {store.address}</Text>
      </View>

      {/* Category Tabs */}
      {categories.length > 1 && (
        <View style={styles.tabsContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.tab,
                  (item === 'Todos' && !selectedCategory) ||
                  (item !== 'Todos' && selectedCategory === item)
                    ? styles.tabActive
                    : null
                ]}
                onPress={() => {
                  setSelectedCategory(item === 'Todos' ? null : item);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    (item === 'Todos' && !selectedCategory) ||
                    (item !== 'Todos' && selectedCategory === item)
                      ? styles.tabTextActive
                      : null
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.tabsContent}
          />
        </View>
      )}

      {/* Products List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={keyExtractor}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Floating Cart Button */}
      {itemCount > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => setShowCart(true)}
          activeOpacity={0.9}
        >
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{itemCount}</Text>
          </View>
          <Text style={styles.cartButtonText}>🛒 Ver Carrito</Text>
        </TouchableOpacity>
      )}

      {/* Cart Modal */}
      <Modal
        visible={showCart}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCart(false)}
      >
        <CartScreen store={store} onClose={() => setShowCart(false)} />
      </Modal>
    </View>
  );
}

/**
 * StoreScreen with CartProvider wrapper
 */
export default function StoreScreen({ store }: StoreScreenProps) {
  return (
    <CartProvider>
      <StoreContent store={store} />
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  storeName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6
  },
  storeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  storeAddress: {
    fontSize: 13,
    color: '#888'
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8
  },
  tabActive: {
    backgroundColor: '#007AFF'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  tabTextActive: {
    color: '#fff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: {
    paddingBottom: 100 // Space for floating cart button
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  emptyText: {
    fontSize: 16,
    color: '#888'
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF3B30',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700'
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  }
});
