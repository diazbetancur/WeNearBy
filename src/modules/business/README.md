# Business Module

Este módulo contiene toda la funcionalidad relacionada con la **gestión de comercios** y administración de negocios.

## 📱 Responsabilidades

### 🖥️ Screens
- **BusinessDashboardScreen**: Panel principal del comercio
- **ProductManagementScreen**: Gestión de productos
- **OrderManagementScreen**: Gestión de pedidos recibidos
- **BusinessProfileSetupScreen**: Configuración del perfil del comercio
- **AnalyticsScreen**: Estadísticas y reportes
- **InventoryScreen**: Control de inventario
- **CustomerManagementScreen**: Gestión de clientes

### 🧩 Components
- **DashboardCard**: Tarjetas del dashboard
- **ProductForm**: Formulario de productos
- **OrderCard**: Tarjeta de pedido recibido
- **StatsChart**: Gráficos de estadísticas
- **InventoryItem**: Item de inventario
- **BusinessForm**: Formulario del comercio
- **NotificationCard**: Tarjeta de notificación

### 🔧 Services
- **businessService**: Gestión del perfil de comercio
- **productService**: CRUD de productos
- **orderManagementService**: Gestión de pedidos recibidos
- **inventoryService**: Control de stock
- **analyticsService**: Estadísticas del negocio
- **businessNotificationService**: Notificaciones para comercios

## 🎯 Funcionalidades Principales

1. **Dashboard**: Vista general del negocio
2. **Productos**: Crear, editar, eliminar productos
3. **Pedidos**: Recibir y gestionar pedidos de clientes
4. **Inventario**: Control de stock y productos
5. **Perfil**: Configurar información del comercio
6. **Analíticas**: Ver estadísticas y reportes
7. **Clientes**: Gestionar base de clientes

## 🔗 Dependencias

### Shared Components
- Button, Input, Modal, Form components
- Charts, Tables, LoadingSpinner

### Shared Services
- Firebase Auth, Firestore
- Translation service
- Storage service (para imágenes de productos)

### Shared Types
- Business, Product, Order, User interfaces
- Analytics, Inventory types

## 🚀 Preparación para Separación

Este módulo está diseñado para ser extraído fácilmente como **Business App** independiente:

- ✅ Autocontenido en funcionalidades
- ✅ Dependencias claras con shared
- ✅ Sin dependencias directas con customer module
- ✅ Preparado para dashboard independiente
- ✅ Sistema de permisos y roles separado

## 🔐 Consideraciones de Seguridad

- Validación de permisos de comercio
- Acceso solo a datos propios del negocio
- Autenticación específica para comercios
- Logs de auditoría para acciones críticas