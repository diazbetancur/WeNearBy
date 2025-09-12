# 🚀 Servicios Abstractos para Migración Fácil

## ✅ Implementación Completa

Se ha creado una arquitectura de servicios abstractos que permite migrar fácilmente entre diferentes proveedores de backend sin cambiar el código de la aplicación.

## 📁 Estructura de Archivos

```
src/shared/services/
├── ApiService.ts           # Clase abstracta base
├── FirebaseService.ts      # Implementación con Firebase
├── NodeJSService.ts        # Implementación con Node.js (ejemplo futuro)
├── ServiceFactory.ts       # Factory para crear servicios
├── RoleContext.tsx         # Context de roles (existente)
└── index.ts               # Exports centralizados
```

## 🏗️ Arquitectura

### 1. ApiService (Clase Base Abstracta)

```typescript
export abstract class ApiService {
  // Métodos abstractos que deben implementar las clases hijas
  abstract signIn(email: string, password: string): Promise<ApiResponse<AuthUser>>;
  abstract getBusinesses(options?: QueryOptions): Promise<ApiResponse<Business[]>>;
  // ... más métodos
}
```

**Características:**
- ✅ Define interfaz común para todos los servicios
- ✅ Métodos helper para manejo de errores
- ✅ Mapeo de códigos de error
- ✅ Respuestas consistentes (`ApiResponse<T>`)

### 2. FirebaseService (Implementación Actual)

```typescript
export class FirebaseService extends ApiService {
  // Implementa todos los métodos usando Firebase
  async signIn(email: string, password: string): Promise<ApiResponse<AuthUser>> {
    // Implementación con Firebase Auth
  }
  
  async getBusinesses(options?: QueryOptions): Promise<ApiResponse<Business[]>> {
    // Implementación con Firestore
  }
}
```

**Características:**
- ✅ Implementación completa con Firebase Auth + Firestore
- ✅ Manejo de errores específicos de Firebase
- ✅ Mapping de usuarios de Firebase a `AuthUser`
- ✅ Soporte para queries complejas con filtros

### 3. NodeJSService (Ejemplo Futuro)

```typescript
export class NodeJSService extends ApiService {
  // Implementa todos los métodos usando REST API
  async signIn(email: string, password: string): Promise<ApiResponse<AuthUser>> {
    return this.makeRequest<AuthUser>('/auth/login', 'POST', { email, password });
  }
}
```

**Características:**
- ✅ Implementación con fetch() para REST API
- ✅ Manejo de tokens JWT
- ✅ Headers de autorización automáticos
- ✅ Persistencia de tokens en AsyncStorage

### 4. ServiceFactory (Patrón Factory)

```typescript
export class ServiceFactory {
  static getInstance(): ApiService {
    // Devuelve la instancia del servicio actual
  }
  
  static switchService(type: ServiceType, config?: any): ApiService {
    // Cambia entre Firebase y Node.js dinámicamente
  }
}
```

**Características:**
- ✅ Patrón Singleton para instancia global
- ✅ Cambio dinámico entre servicios
- ✅ Hook React `useApiService()`
- ✅ Configuración específica por servicio

## 🎯 Beneficios de esta Arquitectura

### ✅ **Migración Sin Dolor**
```typescript
// Cambiar de Firebase a Node.js es una línea
ServiceFactory.switchService('nodejs', { baseUrl: 'https://api.wenearby.com' });

// Todo el código de la app sigue funcionando igual
const response = await apiService.getBusinesses();
```

### ✅ **Código Consistente**
```typescript
// Misma API independiente del backend
const { success, data, error } = await apiService.signIn(email, password);

if (success && data) {
  console.log('Usuario logueado:', data.email);
} else {
  console.error('Error:', error);
}
```

### ✅ **Testing Simplificado**
```typescript
// Crear un MockService para testing
class MockService extends ApiService {
  async signIn() {
    return this.createSuccessResponse({ id: 'test', email: 'test@example.com' });
  }
}

// Usar en tests
ServiceFactory.switchService('mock');
```

### ✅ **Tipos TypeScript Completos**
```typescript
// Todos los métodos están tipados
const businesses: Business[] = response.data; // ✅ Type-safe
const orders: Order[] = await apiService.getOrders(); // ✅ Autocomplete
```

## 🔄 Flujo de Migración

### Paso 1: Desarrollo Actual (Firebase)
```typescript
// Usar Firebase durante desarrollo
const apiService = ServiceFactory.getFirebaseService();
await apiService.getBusinesses();
```

### Paso 2: Migración Gradual
```typescript
// Cambiar a Node.js para ciertas funciones
if (feature === 'analytics') {
  ServiceFactory.switchService('nodejs', { baseUrl: process.env.ANALYTICS_API });
} else {
  ServiceFactory.switchService('firebase');
}
```

### Paso 3: Migración Completa
```typescript
// Cambiar completamente a Node.js
ServiceFactory.switchService('nodejs', { 
  baseUrl: process.env.REACT_APP_API_URL 
});
```

## 📋 Métodos Implementados

### 🔐 **Autenticación**
- `signIn(email, password)` - Iniciar sesión
- `signUp(email, password)` - Registrarse
- `signOut()` - Cerrar sesión
- `getCurrentUser()` - Usuario actual
- `resetPassword(email)` - Recuperar contraseña
- `updateProfile(userData)` - Actualizar perfil

### 🏪 **Negocios**
- `getBusinesses(options?)` - Lista de negocios
- `getBusinessById(id)` - Negocio específico
- `createBusiness(data)` - Crear negocio
- `updateBusiness(id, data)` - Actualizar negocio
- `deleteBusiness(id)` - Eliminar negocio
- `searchBusinesses(query, options?)` - Buscar negocios

### 🛍️ **Productos**
- `getProducts(businessId?, options?)` - Lista de productos
- `getProductById(id)` - Producto específico
- `createProduct(data)` - Crear producto
- `updateProduct(id, data)` - Actualizar producto
- `deleteProduct(id)` - Eliminar producto
- `getProductsByCategory(category, options?)` - Productos por categoría

### 📦 **Pedidos**
- `getOrders(customerId?, businessId?, options?)` - Lista de pedidos
- `getOrderById(id)` - Pedido específico
- `createOrder(data)` - Crear pedido
- `updateOrder(id, data)` - Actualizar pedido
- `deleteOrder(id)` - Eliminar pedido
- `getOrdersByStatus(status, options?)` - Pedidos por estado

### 🛠️ **Utilidades**
- `uploadImage(file, path)` - Subir imagen
- `deleteImage(path)` - Eliminar imagen
- `sendNotification(userId, title, body, data?)` - Enviar notificación

## 🎮 Uso en la Aplicación

### Hook useApiService
```typescript
import { useApiService } from '@shared/services';

const MyComponent = () => {
  const apiService = useApiService();
  
  const loadData = async () => {
    const { success, data } = await apiService.getBusinesses();
    if (success) setBusinesses(data);
  };
};
```

### Instancia Global
```typescript
import { apiService } from '@shared/services';

// Usar directamente sin hook
const response = await apiService.signIn(email, password);
```

### Cambio de Servicio
```typescript
import { ServiceFactory } from '@shared/services';

// Cambiar a Node.js
ServiceFactory.switchService('nodejs', { 
  baseUrl: 'https://api.wenearby.com' 
});
```

## 🧪 Testing y Debugging

### Pantalla de Ejemplo
Se ha creado `ApiServiceExampleScreen` que demuestra:
- ✅ Cambio entre Firebase y Node.js
- ✅ Pruebas de autenticación
- ✅ CRUD de negocios
- ✅ Manejo de errores
- ✅ Estados de carga

### Logs del Sistema
```
🔥 Usando Firebase como backend
🚀 Usando Node.js backend: https://api.wenearby.com
```

## 📈 Próximos Pasos

### 1. **Completar Node.js Backend**
- Implementar endpoints REST
- Configurar base de datos
- Deploy en servidor

### 2. **Agregar Más Servicios**
```typescript
// Futuras implementaciones
class SupabaseService extends ApiService { }
class AWSService extends ApiService { }
class GraphQLService extends ApiService { }
```

### 3. **Optimizaciones**
- Cache de respuestas
- Offline support
- Retry automático
- Rate limiting

## 🎯 Resultado Final

✅ **Arquitectura lista para migración**
✅ **Firebase funcionando completamente**
✅ **Node.js preparado para implementación**
✅ **Cambio dinámico entre servicios**
✅ **Código limpio y mantenible**
✅ **TypeScript completo**
✅ **Testing simplificado**

La aplicación ahora puede migrar fácilmente de Firebase a cualquier otro backend sin cambiar una sola línea de código en los componentes! 🚀