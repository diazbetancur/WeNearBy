# RoleContext - Sistema de Gestión de Roles

El `RoleContext` es un sistema completamente independiente que gestiona el rol actual del usuario (customer/business) en la aplicación WeNearBy.

## 🎯 Características

### ✅ **Gestión de Roles**
- Soporte para roles `customer` y `business`
- Cambio dinámico entre roles sin restart
- Validación de roles válidos

### ✅ **Persistencia** 
- Almacenamiento automático en AsyncStorage
- Carga automática al iniciar la app
- Clave de storage: `@wenearby:user_role`

### ✅ **Estado Global**
- Context API para estado compartido
- Hook `useRole()` para acceso fácil
- Notificación automática a toda la app

### ✅ **Separación de Responsabilidades**
- Completamente independiente de `AuthContext`
- No interfiere con autenticación
- Lógica específica de roles aislada

## 📚 API Reference

### RoleProvider

```typescript
interface RoleProviderProps {
  children: ReactNode;
  defaultRole?: UserRole; // 'customer' | 'business'
}

// Uso
<RoleProvider defaultRole="customer">
  <App />
</RoleProvider>
```

### useRole Hook

```typescript
interface RoleContextType {
  currentRole: UserRole;           // Rol actual
  isLoading: boolean;              // Estado de carga
  switchToCustomer: () => Promise<void>;  // Cambiar a cliente
  switchToBusiness: () => Promise<void>;  // Cambiar a comercio
  switchRole: (role: UserRole) => Promise<void>; // Cambiar a rol específico
  clearRole: () => Promise<void>;         // Limpiar rol (reset a default)
}

// Uso
const { currentRole, switchToCustomer, isLoading } = useRole();
```

### roleUtils

```typescript
const roleUtils = {
  isCustomer: (role: UserRole) => boolean;
  isBusiness: (role: UserRole) => boolean;
  getRoleDisplayName: (role: UserRole) => string;
  getOppositeRole: (role: UserRole) => UserRole;
};

// Uso
if (roleUtils.isCustomer(currentRole)) {
  // Lógica de cliente
}
```

## 🔧 Implementación

### 1. Configurar Provider

```typescript
// app/_layout.tsx o tu archivo principal
import { RoleProvider } from '@shared/services';

export default function RootLayout() {
  return (
    <RoleProvider defaultRole="customer">
      {/* Otros providers */}
      <AuthProvider>
        <YourApp />
      </AuthProvider>
    </RoleProvider>
  );
}
```

### 2. Usar en Componentes

```typescript
import { useRole, roleUtils } from '@shared/services';

const MyComponent = () => {
  const { currentRole, switchToBusiness, isLoading } = useRole();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <View>
      <Text>Rol actual: {roleUtils.getRoleDisplayName(currentRole)}</Text>
      
      {roleUtils.isCustomer(currentRole) && (
        <CustomerFeatures />
      )}
      
      {roleUtils.isBusiness(currentRole) && (
        <BusinessFeatures />
      )}
      
      <Button 
        title="Cambiar a Comercio"
        onPress={switchToBusiness}
      />
    </View>
  );
};
```

### 3. Navegación Condicional

```typescript
import { useRole } from '@shared/services';

const AppNavigator = () => {
  const { currentRole } = useRole();
  
  return (
    <NavigationContainer>
      {currentRole === 'customer' && <CustomerStack />}
      {currentRole === 'business' && <BusinessStack />}
    </NavigationContainer>
  );
};
```

## 🎨 Componente RoleSwitcher

Incluye un componente pre-built para cambio de roles:

```typescript
import { RoleSwitcher } from '@shared/components';

const SettingsScreen = () => (
  <View>
    <RoleSwitcher />
  </View>
);
```

## 🔒 Seguridad y Validación

### Validación de Roles
```typescript
// El context valida que solo se usen roles válidos
const validRoles = ['customer', 'business'];
if (savedRole && validRoles.includes(savedRole)) {
  setCurrentRole(savedRole as UserRole);
}
```

### Error Handling
```typescript
// Manejo automático de errores con rollback
try {
  setCurrentRole(newRole);
  await persistRole(newRole);
} catch (error) {
  setCurrentRole(previousRole); // Rollback
}
```

## 📱 Casos de Uso

### 1. Apps Separadas Futuras
```typescript
// Fácil separación en apps independientes
if (currentRole === 'customer') {
  return <CustomerApp />;
} else {
  return <BusinessApp />;
}
```

### 2. Features Condicionales
```typescript
// Mostrar features según rol
{roleUtils.isBusiness(currentRole) && (
  <BusinessDashboard />
)}

{roleUtils.isCustomer(currentRole) && (
  <ProductCatalog />
)}
```

### 3. Temas Dinámicos
```typescript
const getThemeByRole = (role: UserRole) => {
  return role === 'customer' ? customerTheme : businessTheme;
};
```

### 4. Analytics por Rol
```typescript
useEffect(() => {
  analytics.setUserProperty('user_role', currentRole);
}, [currentRole]);
```

## 🔄 Flujo de Datos

```
1. App Start → Load from AsyncStorage → Set currentRole
2. User Switch → Update currentRole → Persist to AsyncStorage
3. Role Change → Notify all consumers → Re-render components
4. Error → Rollback → Maintain previous state
```

## ⚡ Performance

- **Lazy Loading**: Solo carga cuando se necesita
- **Memoization**: Context value optimizado con useMemo
- **Minimal Re-renders**: Solo re-renderiza cuando cambia el rol
- **Async Operations**: Todas las operaciones de storage son async

## 🧪 Testing

```typescript
// Mock para testing
const mockRoleContext = {
  currentRole: 'customer' as UserRole,
  isLoading: false,
  switchToCustomer: jest.fn(),
  switchToBusiness: jest.fn(),
  switchRole: jest.fn(),
  clearRole: jest.fn(),
};

// Wrapper para tests
const TestWrapper = ({ children }) => (
  <RoleProvider defaultRole="customer">
    {children}
  </RoleProvider>
);
```

## 🎉 Beneficios

1. **🔄 Flexibilidad**: Cambio dinámico de roles
2. **💾 Persistencia**: Mantiene estado entre sesiones  
3. **🎯 Separación**: Independiente de autenticación
4. **📱 Escalabilidad**: Preparado para apps separadas
5. **🛡️ Robustez**: Manejo de errores y rollback
6. **🧹 Limpieza**: API simple y consistente

¡El RoleContext está listo para usar! 🚀