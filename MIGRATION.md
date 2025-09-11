# Migration Guide - Modular Architecture

Este archivo documenta cómo migrar el código existente a la nueva estructura modular.

## 📋 Plan de Migración

### Fase 1: Shared Components 🧩

#### Mover componentes UI existentes:
```
components/ui/Input.tsx           → src/shared/components/Input.tsx
components/ui/icon-symbol.tsx     → src/shared/components/IconSymbol.tsx  
components/themed-text.tsx        → src/shared/components/ThemedText.tsx
components/themed-view.tsx        → src/shared/components/ThemedView.tsx
components/parallax-scroll-view.tsx → src/shared/components/ParallaxScrollView.tsx
components/haptic-tab.tsx         → src/shared/components/HapticTab.tsx
components/hello-wave.tsx         → src/shared/components/HelloWave.tsx
components/external-link.tsx      → src/shared/components/ExternalLink.tsx
components/collapsible.tsx        → src/shared/components/Collapsible.tsx
```

#### Actualizar exports en `src/shared/components/index.ts`:
```typescript
export { Input } from './Input';
export { IconSymbol } from './IconSymbol';
export { ThemedText } from './ThemedText';
export { ThemedView } from './ThemedView';
export { ParallaxScrollView } from './ParallaxScrollView';
export { HapticTab } from './HapticTab';
export { HelloWave } from './HelloWave';
export { ExternalLink } from './ExternalLink';
export { Collapsible } from './Collapsible';
```

### Fase 2: Shared Services 🔧

#### Mover servicios existentes:
```
services/firebase.ts              → src/shared/services/firebase.ts
services/firebaseConfig.ts        → src/shared/services/firebaseConfig.ts
services/firestore.js             → src/shared/services/firestore.ts
services/authService.ts           → src/shared/services/authService.ts
contexts/AuthContext.tsx          → src/shared/services/AuthContext.tsx
contexts/CartContext.tsx          → src/shared/services/CartContext.tsx
hooks/useTranslation.ts           → src/shared/services/translationService.ts
```

#### Actualizar exports en `src/shared/services/index.ts`:
```typescript
export * from './firebase';
export * from './firestore';
export * from './authService';
export * from './AuthContext';
export * from './CartContext';
export * from './translationService';
```

### Fase 3: Shared Utils 🛠️

#### Mover utilidades existentes:
```
hooks/use-color-scheme.ts         → src/shared/utils/colorScheme.ts
hooks/use-theme-color.ts          → src/shared/utils/themeColor.ts
constants/theme.ts                → src/shared/utils/theme.ts
```

#### Crear nuevas utilidades:
```typescript
// src/shared/utils/validation.ts
export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// src/shared/utils/formatters.ts
export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};
```

### Fase 4: Customer Module 👥

#### Mover pantallas de cliente:
```
app/screens/LoginScreen.tsx       → src/modules/customer/screens/LoginScreen.tsx
app/screens/RegisterScreen.tsx    → src/modules/customer/screens/RegisterScreen.tsx
app/screens/BusinessListScreen.tsx → src/modules/customer/screens/BusinessListScreen.tsx
app/screens/BusinessProfileScreen.tsx → src/modules/customer/screens/BusinessProfileScreen.tsx
app/screens/CartScreen.tsx        → src/modules/customer/screens/CartScreen.tsx
app/screens/Cart.js               → src/modules/customer/screens/Cart.tsx
app/(tabs)/index.tsx              → src/modules/customer/screens/HomeScreen.tsx
app/(tabs)/explore.tsx            → src/modules/customer/screens/ExploreScreen.tsx
```

#### Actualizar imports en pantallas movidas:
```typescript
// Antes
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';

// Después  
import { Input } from '@/shared/components';
import { useAuth } from '@/shared/services';
```

### Fase 5: Business Module 🏪

#### Crear pantallas de comercio:
```
src/modules/business/screens/BusinessDashboardScreen.tsx
src/modules/business/screens/ProductManagementScreen.tsx
src/modules/business/screens/OrderManagementScreen.tsx
src/modules/business/screens/BusinessProfileSetupScreen.tsx
```

#### Crear componentes específicos:
```
src/modules/business/components/DashboardCard.tsx
src/modules/business/components/ProductForm.tsx
src/modules/business/components/OrderCard.tsx
```

### Fase 6: Actualizar Navegación 🧭

#### Modificar AppNavigator:
```typescript
// app/navigation/AppNavigator.tsx
import { LoginScreen, RegisterScreen } from '@/modules/customer/screens';
import { BusinessDashboardScreen } from '@/modules/business/screens';

// Configurar rutas por módulo
const CustomerStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="BusinessList" component={BusinessListScreen} />
    <Stack.Screen name="BusinessProfile" component={BusinessProfileScreen} />
    <Stack.Screen name="Cart" component={CartScreen} />
  </Stack.Navigator>
);

const BusinessStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Dashboard" component={BusinessDashboardScreen} />
    <Stack.Screen name="Products" component={ProductManagementScreen} />
    <Stack.Screen name="Orders" component={OrderManagementScreen} />
  </Stack.Navigator>
);
```

### Fase 7: Configurar Path Mapping 📍

#### Actualizar `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/customer/*": ["./src/modules/customer/*"],
      "@/business/*": ["./src/modules/business/*"]
    }
  }
}
```

#### Actualizar `babel.config.js`:
```javascript
module.exports = {
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@/shared': './src/shared',
          '@/customer': './src/modules/customer',
          '@/business': './src/modules/business',
        },
      },
    ],
  ],
};
```

## 🔄 Pasos de Migración

### 1. Crear estructura base ✅
- [x] Carpetas creadas
- [x] READMEs documentados
- [x] Archivos de índice básicos

### 2. Mover componentes shared
```bash
# Ejecutar estos comandos:
mv components/ui/* src/shared/components/
mv components/themed-* src/shared/components/
mv components/parallax-scroll-view.tsx src/shared/components/
```

### 3. Mover servicios shared
```bash
mv services/* src/shared/services/
mv contexts/* src/shared/services/
```

### 4. Mover pantallas customer
```bash
mv app/screens/* src/modules/customer/screens/
mv app/\(tabs\)/* src/modules/customer/screens/
```

### 5. Actualizar imports
- Buscar y reemplazar imports en todos los archivos
- Usar VSCode "Find and Replace" global

### 6. Probar migración
- Verificar que la app compile
- Probar funcionalidades principales
- Ajustar imports faltantes

## 🎯 Beneficios Post-Migración

1. **Código organizado** por dominio de negocio
2. **Reutilización** de componentes y servicios
3. **Escalabilidad** para agregar nuevos módulos
4. **Separación futura** en apps independientes
5. **Desarrollo en equipo** más eficiente
6. **Testing** más granular por módulos

## ⚠️ Consideraciones

- Migrar gradualmente para minimizar errores
- Probar cada fase antes de continuar
- Mantener backup del código original
- Actualizar documentación durante el proceso