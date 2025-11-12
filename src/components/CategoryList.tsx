/**
 * CategoryList
 *
 * Component for managing product categories (tags).
 * CRUD operations: create, edit, delete categories.
 */

import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Category {
  id: string;
  name: string;
}

interface CategoryListProps {
  categories: string[]; // Array of category names (tags)
  onUpdate: (categories: string[]) => void;
}

export default function CategoryList({ categories, onUpdate }: CategoryListProps) {
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // Convert string array to Category objects for easier handling
  const categoryObjects: Category[] = categories.map((name) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name
  }));

  const handleAdd = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Ingresa el nombre de la categoría');
      return;
    }

    // Check for duplicates (case-insensitive)
    if (categories.some((cat) => cat.toLowerCase() === trimmed.toLowerCase())) {
      Alert.alert('Error', 'Esta categoría ya existe');
      return;
    }

    onUpdate([...categories, trimmed]);
    setNewCategory('');
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingValue(category.name);
  };

  const handleSaveEdit = () => {
    const trimmed = editingValue.trim();
    if (!trimmed) {
      Alert.alert('Error', 'El nombre de la categoría no puede estar vacío');
      return;
    }

    // Check for duplicates (excluding current)
    if (
      categories.some((cat) => cat.toLowerCase() === trimmed.toLowerCase() && cat !== editingValue)
    ) {
      Alert.alert('Error', 'Esta categoría ya existe');
      return;
    }

    const updated = categories.map((cat) =>
      cat === categoryObjects.find((c) => c.id === editingId)?.name ? trimmed : cat
    );
    onUpdate(updated);
    setEditingId(null);
    setEditingValue('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingValue('');
  };

  const handleDelete = (category: Category) => {
    Alert.alert('Eliminar Categoría', `¿Estás seguro de eliminar "${category.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          const updated = categories.filter((cat) => cat !== category.name);
          onUpdate(updated);
        }
      }
    ]);
  };

  const renderCategory = ({ item }: { item: Category }) => {
    const isEditing = editingId === item.id;

    return (
      <View style={styles.categoryItem}>
        {isEditing ? (
          <>
            <TextInput
              style={styles.editInput}
              value={editingValue}
              onChangeText={setEditingValue}
              autoFocus
              placeholder="Nombre de categoría"
              placeholderTextColor="#999"
            />
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.editButton} onPress={handleSaveEdit}>
                <Text style={styles.editButtonText}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                <Text style={styles.cancelButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.categoryName}>{item.name}</Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)}>
                <Text style={styles.actionButtonText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item)}>
                <Text style={styles.actionButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categorías del Catálogo</Text>
      <Text style={styles.description}>
        Define categorías para organizar tus productos. Los clientes podrán filtrar por categoría.
      </Text>

      {/* Add new category */}
      <View style={styles.addSection}>
        <TextInput
          style={styles.input}
          value={newCategory}
          onChangeText={setNewCategory}
          placeholder="Nueva categoría (ej: Pizza, Bebidas)"
          placeholderTextColor="#999"
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      {/* Categories list */}
      {categoryObjects.length > 0 ? (
        <FlatList
          data={categoryObjects}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyText}>No hay categorías aún</Text>
          <Text style={styles.emptyHint}>Agrega categorías para organizar tus productos</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20
  },
  addSection: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a'
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center'
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a'
  },
  actions: {
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    padding: 8
  },
  actionButtonText: {
    fontSize: 18
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    color: '#1a1a1a',
    marginRight: 8
  },
  editActions: {
    flexDirection: 'row',
    gap: 4
  },
  editButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center'
  },
  editButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700'
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center'
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700'
  },
  emptyState: {
    alignItems: 'center',
    padding: 32
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center'
  }
});
