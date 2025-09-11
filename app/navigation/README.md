# Arquitectura de Navegación

## Estructura de Navegadores

El sistema de navegación está dividido en tres navegadores principales basados en el estado del usuario y su rol:

### 1. AppNavigator (Principal)
- **Función**: Controlador maestro que decide qué navegador mostrar
- **Lógica**: 
  - Si no hay usuario autenticado → `AuthStackScreen`
  - Si hay usuario autenticado → `MainStackScreen` (que usa el rol)

### 2. AuthStackScreen
- **Propósito**: Pantallas de autenticación para usuarios no logueados
- **Pantallas**:
  - Login
  - Register

### 3. MainStackScreen
- **Propósito**: Navegador principal que cambia según el rol del usuario
- **Lógica de Rol**:
  - Si `currentRole === 'business'` → `BusinessNavigator`
  - Si `currentRole === 'customer'` → `CustomerNavigator`

## Navegadores por Rol

### CustomerNavigator
**Tema**: Azul (#007AFF)
**Pantallas principales**:
- BusinessList (Lista de Negocios)
- BusinessDetail (Detalles del Negocio)
- Cart (Carrito de Compras)

**Pantallas futuras**:
- UserProfile (Perfil del Cliente)
- OrderHistory (Historial de Pedidos)
- Favorites (Favoritos)
- Search (Búsqueda)
- Notifications (Notificaciones)

### BusinessNavigator
**Tema**: Verde (#28a745)
**Pantallas principales**:
- Dashboard (Panel de Control)
- BusinessProfile (Perfil del Negocio)

**Pantallas futuras**:
- ProductManagement (Gestión de Productos)
- OrderManagement (Gestión de Pedidos)
- Analytics (Análisis y Estadísticas)
- BusinessSettings (Configuración del Negocio)
- CustomerReviews (Reseñas de Clientes)
- Inventory (Inventario)
- Promotions (Promociones y Descuentos)

## Flujo de Navegación

```
AppNavigator
├── AuthStackScreen (no autenticado)
│   ├── Login
│   └── Register
└── MainStackScreen (autenticado)
    ├── CustomerNavigator (rol: customer)
    │   ├── BusinessList
    │   ├── BusinessDetail
    │   └── Cart
    └── BusinessNavigator (rol: business)
        ├── Dashboard
        └── BusinessProfile
```

## Cambio de Roles

Cuando el usuario cambia de rol usando el RoleContext:
1. `useRole()` detecta el cambio
2. `MainStackScreen` se re-renderiza
3. Se monta el navegador correspondiente al nuevo rol
4. El usuario ve una interfaz completamente diferente

## Beneficios de esta Arquitectura

✅ **Separación clara**: Cada rol tiene su propia navegación
✅ **Escalabilidad**: Fácil agregar nuevas pantallas por rol
✅ **Mantenibilidad**: Código organizado y fácil de mantener
✅ **UX diferenciada**: Cada rol tiene su propia experiencia
✅ **Temas personalizados**: Colores diferentes por rol
✅ **Flexibilidad**: Cambio de rol en tiempo real

## Uso de los Hooks

```tsx
// En cualquier pantalla dentro de los navegadores
import { useRole } from '../../src/shared/services/RoleContext';
import { useAuth } from '../../contexts/AuthContext';

const MyScreen = () => {
  const { currentRole } = useRole();
  const { currentUser } = useAuth();
  
  // Lógica específica basada en rol y autenticación
};
```