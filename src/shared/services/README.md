# Shared Services

Servicios centralizados que son utilizados por ambos módulos (customer y business).

## 🔧 Servicios Disponibles

### 🔐 Authentication Services
- **authService**: Autenticación con Firebase
- **permissionService**: Gestión de permisos y roles
- **sessionService**: Manejo de sesiones

### 🗄️ Database Services
- **firestoreService**: Operaciones con Firestore
- **realtimeService**: Datos en tiempo real
- **cacheService**: Cache local de datos

### 📱 Platform Services
- **storageService**: Almacenamiento local/nube
- **locationService**: Geolocalización
- **notificationService**: Push notifications
- **analyticsService**: Tracking de eventos

### 🌐 Network Services
- **apiService**: Cliente HTTP base
- **uploadService**: Subida de archivos
- **syncService**: Sincronización offline

### 🛠️ Utility Services
- **translationService**: Internacionalización
- **validationService**: Validaciones comunes
- **formatService**: Formateo de datos
- **errorService**: Manejo de errores

## 📚 Documentación por Servicio

### 🔐 Auth Service

```typescript
interface AuthService {
  signIn(email: string, password: string): Promise<User>;
  signUp(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): User | null;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}
```

### 🗄️ Firestore Service

```typescript
interface FirestoreService {
  create<T>(collection: string, data: T): Promise<string>;
  read<T>(collection: string, id: string): Promise<T | null>;
  update<T>(collection: string, id: string, data: Partial<T>): Promise<void>;
  delete(collection: string, id: string): Promise<void>;
  query<T>(collection: string, filters: QueryFilter[]): Promise<T[]>;
}
```

### 📍 Location Service

```typescript
interface LocationService {
  getCurrentPosition(): Promise<Coordinates>;
  watchPosition(callback: (position: Coordinates) => void): () => void;
  calculateDistance(from: Coordinates, to: Coordinates): number;
  reverseGeocode(coordinates: Coordinates): Promise<Address>;
}
```

## 🎯 Principios de Diseño

### 🔄 Single Responsibility
- Cada servicio tiene una responsabilidad específica
- Interfaces claras y bien definidas
- Mínimo acoplamiento entre servicios

### 🔧 Dependency Injection
- Servicios configurables e inyectables
- Fácil testing con mocks
- Flexibilidad en implementaciones

### 📱 Platform Agnostic
- Abstracciones para funcionalidades de plataforma
- Implementaciones específicas por plataforma
- Fallbacks para funcionalidades no disponibles

## 📦 Export Pattern

```typescript
// services/index.ts
export { authService } from './authService';
export { firestoreService } from './firestoreService';
export { locationService } from './locationService';
// ... otros servicios

// Tipos
export type { AuthService, FirestoreService, LocationService };
```

## 🔄 Uso en Módulos

```typescript
// En customer module
import { authService, locationService } from '@/shared/services';

// En business module  
import { authService, firestoreService } from '@/shared/services';
```

## ⚡ Performance

- Lazy loading de servicios
- Cache inteligente
- Debouncing en operaciones frecuentes
- Batch operations para Firestore