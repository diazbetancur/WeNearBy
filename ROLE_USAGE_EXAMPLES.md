# Ejemplos de Uso del RoleContext

## Configuración Básica

El RoleContext ya está integrado en el `_layout.tsx` principal:

```tsx
import { RoleProvider } from '../src/shared/services';

export default function RootLayout() {
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RoleProvider>
          <CartProvider>
            <AppNavigator />
          </CartProvider>
        </RoleProvider>
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
```

## Uso del Hook useRole()

### En cualquier componente:

```tsx
import { useRole } from '../src/shared/services/RoleContext';

export default function MyComponent() {
  const { 
    currentRole, 
    isLoading, 
    switchToCustomer, 
    switchToBusiness, 
    switchRole 
  } = useRole();

  if (isLoading) {
    return <Text>Cargando rol...</Text>;
  }

  return (
    <View>
      <Text>Rol actual: {currentRole}</Text>
      <Button 
        title="Cambiar a Cliente" 
        onPress={switchToCustomer} 
      />
      <Button 
        title="Cambiar a Comercio" 
        onPress={switchToBusiness} 
      />
    </View>
  );
}
```

## Utilidades del Rol

```tsx
import { roleUtils } from '../src/shared/services/RoleContext';

// Verificar tipo de rol
const isCustomer = roleUtils.isCustomer(currentRole);
const isBusiness = roleUtils.isBusiness(currentRole);

// Obtener nombre para mostrar
const displayName = roleUtils.getRoleDisplayName(currentRole);

// Obtener rol opuesto
const oppositeRole = roleUtils.getOppositeRole(currentRole);
```

## Componente RoleSwitcher

```tsx
import { RoleSwitcher } from '../src/shared/components/RoleSwitcher';

export default function SettingsScreen() {
  return (
    <View>
      <Text>Configuración</Text>
      <RoleSwitcher />
    </View>
  );
}
```

## Navegación Condicional por Rol

```tsx
import { useRole } from '../src/shared/services/RoleContext';

export default function AppNavigator() {
  const { currentRole } = useRole();

  if (currentRole === 'customer') {
    return <CustomerNavigator />;
  }

  return <BusinessNavigator />;
}
```

## Funciones Avanzadas

### Cambio de rol programático:

```tsx
const { switchRole } = useRole();

// Cambiar a un rol específico
await switchRole('business');

// Manejar errores
try {
  await switchRole('customer');
  console.log('Rol cambiado exitosamente');
} catch (error) {
  console.error('Error al cambiar rol:', error);
}
```

### Limpiar rol (volver al por defecto):

```tsx
const { clearRole } = useRole();

await clearRole(); // Vuelve a 'customer' por defecto
```

## Características del Sistema

✅ **Persistencia**: El rol se guarda automáticamente en AsyncStorage
✅ **Estado global**: Todos los componentes se actualizan automáticamente
✅ **Separación**: Completamente independiente de AuthContext
✅ **Error handling**: Manejo de errores con rollback automático
✅ **TypeScript**: Tipado completo y seguro
✅ **Optimizado**: Uso de useMemo y useCallback para rendimiento
✅ **Logging**: Console logs para debugging

## Logs del Sistema

El sistema incluye logs detallados:

- 🔄 Role loaded from storage: customer
- 🆕 Default role set: customer  
- 💾 Role persisted to storage: business
- ✅ Role switched successfully to: business
- 🗑️ Role cleared, reset to default: customer
- ❌ Error messages para debugging