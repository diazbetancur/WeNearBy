# Shared Components

Componentes reutilizables que pueden ser utilizados por ambos módulos (customer y business).

## 🧩 Componentes Disponibles

### 📝 Form Components
- **Button**: Botón principal con variants
- **Input**: Input con validación y estados
- **TextArea**: Área de texto multilínea
- **Select**: Selector dropdown
- **Checkbox**: Checkbox con label
- **RadioButton**: Botón de radio
- **Switch**: Interruptor on/off

### 📱 UI Components
- **Modal**: Modal reutilizable
- **Alert**: Alertas y notificaciones
- **LoadingSpinner**: Indicador de carga
- **ErrorBoundary**: Manejo de errores
- **Card**: Tarjeta base
- **Badge**: Insignias y etiquetas
- **Avatar**: Avatar de usuario
- **Divider**: Separador visual

### 📋 Layout Components
- **Container**: Contenedor principal
- **Row/Column**: Layout flexbox
- **Spacer**: Espaciador
- **SafeArea**: Área segura
- **KeyboardAware**: Componente keyboard-aware

### 🎨 Themed Components
- **ThemedText**: Texto con tema
- **ThemedView**: Vista con tema
- **ThemedButton**: Botón con tema
- **ThemedInput**: Input con tema

## 📐 Principios de Diseño

### ✨ Consistency
- Misma API para componentes similares
- Estilo consistente en toda la app
- Comportamiento predecible

### 🎯 Reusability
- Props flexibles y configurables
- Componentes atómicos combinables
- Mínima lógica de negocio

### 🔧 Maintainability
- Documentación clara
- TypeScript interfaces
- Testing unitario

## 📚 Uso

```typescript
import { Button, Input, Modal } from '@/shared/components';

// Uso básico
<Button title="Guardar" onPress={handleSave} />

// Con variants
<Button 
  title="Eliminar" 
  variant="danger" 
  size="small"
  onPress={handleDelete} 
/>

// Input con validación
<Input
  placeholder="Email"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  keyboardType="email-address"
/>
```

## 🔄 Export Pattern

```typescript
// index.ts
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';
// ... otros componentes
```

## 🎨 Theming

Todos los componentes shared soportan el sistema de temas:

```typescript
// Uso del theme
const { colors, fonts, spacing } = useTheme();

// Componente themed
<ThemedButton 
  title="Acción" 
  colorScheme="primary"
/>
```