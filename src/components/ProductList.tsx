/**
 * ProductList
 * 
 * Component for managing store products with CRUD operations.
 * Supports 1-5 image uploads to Firebase Storage.
 * Includes category filtering and product activation toggle.
 */

import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getProductService } from '../services/registry';
import type { Product, ProductImage } from '../types/models';

interface ProductListProps {
  storeId: string;
  availableCategories: string[]; // Categories from store
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  tags: string[];
  images: ProductImage[];
  active: boolean;
}

export default function ProductList({ storeId, availableCategories }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    tags: [],
    images: [],
    active: true,
  });
  const [uploadingImages, setUploadingImages] = useState(false);

  const productService = getProductService();

  const loadProducts = useCallback(async () => {
    try {
      const fetchedProducts = await productService.listByStore(storeId, {
        activeOnly: false, // Show all products (including inactive) for vendor
        categoryId: selectedCategory || undefined,
      });
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [storeId, selectedCategory, productService]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      tags: [],
      images: [],
      active: true,
    });
    setModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      tags: product.tags || [],
      images: product.images,
      active: product.active,
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingProduct(null);
  };

  const pickImages = async () => {
    if (formData.images.length >= 5) {
      Alert.alert('Límite Alcanzado', 'Solo puedes agregar hasta 5 imágenes por producto');
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso Denegado', 'Necesitas permitir acceso a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - formData.images.length,
    });

    if (!result.canceled && result.assets) {
      setUploadingImages(true);
      try {
        const newImages: ProductImage[] = [];
        
        for (const asset of result.assets) {
          // In a real app, upload to Firebase Storage here
          // For now, use the local URI
          newImages.push({
            url: asset.uri,
            alt: formData.name || 'Producto',
          });
        }

        setFormData({
          ...formData,
          images: [...formData.images, ...newImages],
        });
      } catch (error) {
        console.error('Error uploading images:', error);
        Alert.alert('Error', 'No se pudieron cargar las imágenes');
      } finally {
        setUploadingImages(false);
      }
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
  };

  const toggleTag = (tag: string) => {
    const updatedTags = formData.tags.includes(tag)
      ? formData.tags.filter((t) => t !== tag)
      : [...formData.tags, tag];
    setFormData({ ...formData, tags: updatedTags });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Ingresa el nombre del producto');
      return;
    }

    const priceNum = Number.parseFloat(formData.price);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Error', 'Ingresa un precio válido');
      return;
    }

    if (formData.images.length < 1 || formData.images.length > 5) {
      Alert.alert('Error', 'Debes agregar entre 1 y 5 imágenes');
      return;
    }

    setLoading(true);
    try {
      if (editingProduct) {
        // Update existing product
        await productService.update(editingProduct.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          price: priceNum,
          images: formData.images,
          tags: formData.tags,
          active: formData.active,
        });
        Alert.alert('Éxito', 'Producto actualizado correctamente');
      } else {
        // Create new product
        await productService.create({
          storeId,
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          price: priceNum,
          currency: 'COP',
          images: formData.images,
          tags: formData.tags,
          active: formData.active,
        });
        Alert.alert('Éxito', 'Producto creado correctamente');
      }

      closeModal();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'No se pudo guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Eliminar Producto',
      `¿Estás seguro de eliminar "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Set product as inactive instead of deleting
              await productService.update(product.id, { active: false });
              Alert.alert('Éxito', 'Producto desactivado');
              loadProducts();
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'No se pudo desactivar el producto');
            }
          },
        },
      ]
    );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      {item.images.length > 0 && (
        <Image source={{ uri: item.images[0].url }} style={styles.productImage} />
      )}

      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{item.name}</Text>
          <View style={[styles.badge, item.active ? styles.badgeActive : styles.badgeInactive]}>
            <Text style={styles.badgeText}>{item.active ? 'Activo' : 'Inactivo'}</Text>
          </View>
        </View>

        {item.description && (
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <Text style={styles.productPrice}>
          ${item.price.toLocaleString('es-CO')} COP
        </Text>

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tags}>
            {item.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.productActions}>
          <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)}>
            <Text style={styles.editButtonText}>✏️ Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Category Filter */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, selectedCategory === null && styles.filterChipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === null && styles.filterChipTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          {availableCategories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.filterChip, selectedCategory === category && styles.filterChipActive]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === category && styles.filterChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : products.length > 0 ? (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>No hay productos</Text>
          <Text style={styles.emptyHint}>
            {selectedCategory
              ? `No hay productos en la categoría "${selectedCategory}"`
              : 'Crea tu primer producto para empezar a vender'}
          </Text>
        </View>
      )}

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Create/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Name */}
            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Ej: Pizza Margarita"
              placeholderTextColor="#999"
            />

            {/* Description */}
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Describe tu producto"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />

            {/* Price */}
            <Text style={styles.label}>Precio (COP) *</Text>
            <TextInput
              style={styles.input}
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              placeholder="25000"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />

            {/* Images */}
            <Text style={styles.label}>Imágenes * (1-5)</Text>
            <ScrollView horizontal style={styles.imagesContainer}>
              {formData.images.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image.url }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {formData.images.length < 5 && (
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={pickImages}
                  disabled={uploadingImages}
                >
                  {uploadingImages ? (
                    <ActivityIndicator color="#007AFF" />
                  ) : (
                    <Text style={styles.addImageText}>+</Text>
                  )}
                </TouchableOpacity>
              )}
            </ScrollView>

            {/* Categories */}
            <Text style={styles.label}>Categorías</Text>
            <View style={styles.tagsContainer}>
              {availableCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.tagOption,
                    formData.tags.includes(category) && styles.tagOptionActive,
                  ]}
                  onPress={() => toggleTag(category)}
                >
                  <Text
                    style={[
                      styles.tagOptionText,
                      formData.tags.includes(category) && styles.tagOptionTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Active Toggle */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Producto Activo</Text>
                <Text style={styles.toggleDesc}>
                  Los productos inactivos no aparecen para los clientes
                </Text>
              </View>
              <Switch
                value={formData.active}
                onValueChange={(value) => setFormData({ ...formData, active: value })}
                trackColor={{ false: '#ccc', true: '#34C759' }}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    padding: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: '#E8F5E9',
  },
  badgeInactive: {
    backgroundColor: '#FFEBEE',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeButton: {
    fontSize: 28,
    color: '#666',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageWrapper: {
    marginRight: 12,
    position: 'relative',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  addImageText: {
    fontSize: 32,
    color: '#007AFF',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tagOptionActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  tagOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  tagOptionTextActive: {
    color: '#007AFF',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  toggleDesc: {
    fontSize: 12,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
