# Customer Module

Este módulo contiene toda la funcionalidad relacionada con la experiencia del **cliente/usuario final**.

## 📱 Responsabilidades

### 🖥️ Screens
- **HomeScreen**: Pantalla principal del cliente
- **BusinessListScreen**: Lista de comercios cercanos
- **BusinessProfileScreen**: Perfil detallado de un comercio
- **CartScreen**: Carrito de compras
- **OrderHistoryScreen**: Historial de pedidos
- **ProfileScreen**: Perfil del cliente
- **SearchScreen**: Búsqueda de comercios/productos

### 🧩 Components
- **BusinessCard**: Tarjeta de comercio en la lista
- **ProductCard**: Tarjeta de producto
- **CartItem**: Item del carrito
- **OrderCard**: Tarjeta de pedido
- **SearchBar**: Barra de búsqueda
- **FilterModal**: Modal de filtros
- **LocationPicker**: Selector de ubicación

### 🔧 Services
- **orderService**: Gestión de pedidos del cliente
- **favoritesService**: Comercios/productos favoritos
- **locationService**: Servicios de geolocalización
- **reviewService**: Sistema de reseñas
- **notificationService**: Notificaciones del cliente

## 🎯 Funcionalidades Principales

1. **Descubrimiento**: Encontrar comercios cercanos
2. **Navegación**: Explorar productos y servicios
3. **Pedidos**: Realizar y rastrear compras
4. **Perfil**: Gestionar información personal
5. **Favoritos**: Guardar comercios preferidos
6. **Reseñas**: Calificar y comentar

## 🔗 Dependencias

### Shared Components
- Button, Input, Modal (UI básicos)
- LoadingSpinner, ErrorBoundary

### Shared Services
- Firebase Auth, Firestore
- Translation service
- Storage service

### Shared Types
- User, Business, Product, Order interfaces

## 🚀 Preparación para Separación

Este módulo está diseñado para ser extraído fácilmente como **Customer App** independiente:

- ✅ Autocontenido en funcionalidades
- ✅ Dependencias claras con shared
- ✅ Sin dependencias directas con business module
- ✅ Preparado para navegación independiente