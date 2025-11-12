/**
 * ProductCard Component
 *
 * Displays a product card with:
 * - Image carousel (1-5 images)
 * - Product name and description
 * - Price
 * - Add to cart button
 */

import React, { memo, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import type { Product } from '../types/models';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = SCREEN_WIDTH - 32; // 16px padding on each side
const IMAGE_HEIGHT = 200;

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

const ProductCard = memo<ProductCardProps>(({ product, onAddToCart }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / IMAGE_WIDTH);
    setCurrentImageIndex(index);
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'COP') {
      return `$${price.toLocaleString('es-CO')}`;
    }
    return `${currency} ${price.toLocaleString()}`;
  };

  return (
    <View style={styles.card}>
      {/* Image Carousel */}
      <View style={styles.imageContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {product.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image.url }}
              style={styles.image}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {/* Image Indicators */}
        {product.images.length > 1 && (
          <View style={styles.indicators}>
            {product.images.map((_, index) => (
              <View
                key={index}
                style={[styles.indicator, currentImageIndex === index && styles.indicatorActive]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{product.name}</Text>

        {product.description && (
          <Text style={styles.description} numberOfLines={2}>
            {product.description}
          </Text>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {product.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Price and Add Button */}
        <View style={styles.footer}>
          <Text style={styles.price}>{formatPrice(product.price, product.currency)}</Text>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => onAddToCart?.(product)}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>+ Agregar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

ProductCard.displayName = 'ProductCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden'
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: IMAGE_HEIGHT
  },
  image: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT
  },
  indicators: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)'
  },
  indicatorActive: {
    backgroundColor: '#fff',
    width: 24
  },
  infoContainer: {
    padding: 16
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  tagText: {
    fontSize: 12,
    color: '#666'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF'
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default ProductCard;
