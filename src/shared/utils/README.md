# Shared Utils

Funciones de utilidad y helpers que son utilizados por todos los módulos.

## 🛠️ Utilidades Disponibles

### 📅 Date Utils

```typescript
export const dateUtils = {
  // Formateo de fechas
  formatDate: (date: Date, locale?: string) => string;
  formatTime: (date: Date, locale?: string) => string;
  formatRelative: (date: Date, locale?: string) => string;
  
  // Cálculos
  addDays: (date: Date, days: number) => Date;
  subtractDays: (date: Date, days: number) => Date;
  diffInDays: (date1: Date, date2: Date) => number;
  
  // Validaciones
  isToday: (date: Date) => boolean;
  isTomorrow: (date: Date) => boolean;
  isWeekend: (date: Date) => boolean;
};
```

### 💰 Currency Utils

```typescript
export const currencyUtils = {
  // Formateo
  format: (amount: number, currency?: string, locale?: string) => string;
  formatCompact: (amount: number) => string; // 1K, 1M, etc.
  
  // Cálculos
  calculateTax: (amount: number, taxRate: number) => number;
  calculateDiscount: (amount: number, discountPercent: number) => number;
  roundToDecimal: (amount: number, decimals?: number) => number;
};
```

### 📏 Validation Utils

```typescript
export const validationUtils = {
  // Email
  isValidEmail: (email: string) => boolean;
  normalizeEmail: (email: string) => string;
  
  // Phone
  isValidPhone: (phone: string, country?: string) => boolean;
  formatPhone: (phone: string, country?: string) => string;
  
  // Text
  isRequired: (value: any) => boolean;
  minLength: (value: string, min: number) => boolean;
  maxLength: (value: string, max: number) => boolean;
  
  // Numbers
  isValidNumber: (value: any) => boolean;
  isInRange: (value: number, min: number, max: number) => boolean;
  
  // URLs
  isValidUrl: (url: string) => boolean;
  normalizeUrl: (url: string) => string;
};
```

### 📍 Location Utils

```typescript
export const locationUtils = {
  // Distancia
  calculateDistance: (
    from: { lat: number; lng: number }, 
    to: { lat: number; lng: number }
  ) => number;
  
  // Formateo
  formatDistance: (distance: number, unit?: 'km' | 'mi') => string;
  formatAddress: (address: Address) => string;
  
  // Validaciones
  isValidCoordinates: (lat: number, lng: number) => boolean;
  isWithinRadius: (
    center: { lat: number; lng: number },
    point: { lat: number; lng: number },
    radius: number
  ) => boolean;
};
```

### 🎨 Color Utils

```typescript
export const colorUtils = {
  // Conversiones
  hexToRgb: (hex: string) => { r: number; g: number; b: number } | null;
  rgbToHex: (r: number, g: number, b: number) => string;
  
  // Manipulación
  lighten: (color: string, amount: number) => string;
  darken: (color: string, amount: number) => string;
  adjustOpacity: (color: string, opacity: number) => string;
  
  // Validaciones
  isValidHex: (color: string) => boolean;
  getContrastColor: (backgroundColor: string) => string;
};
```

### 📱 Device Utils

```typescript
export const deviceUtils = {
  // Información del dispositivo
  getDeviceInfo: () => DeviceInfo;
  isTablet: () => boolean;
  isAndroid: () => boolean;
  isIOS: () => boolean;
  
  // Dimensiones
  getScreenDimensions: () => { width: number; height: number };
  isLandscape: () => boolean;
  isPortrait: () => boolean;
  
  // Capacidades
  hasCameraAccess: () => Promise<boolean>;
  hasLocationAccess: () => Promise<boolean>;
  hasNotificationPermission: () => Promise<boolean>;
};
```

### 🔧 Array Utils

```typescript
export const arrayUtils = {
  // Manipulación
  unique: <T>(array: T[]) => T[];
  groupBy: <T, K extends keyof T>(array: T[], key: K) => Record<string, T[]>;
  sortBy: <T>(array: T[], key: keyof T, direction?: 'asc' | 'desc') => T[];
  
  // Búsqueda
  findByProperty: <T>(array: T[], property: keyof T, value: any) => T | undefined;
  filterBy: <T>(array: T[], filters: Partial<T>) => T[];
  
  // Paginación
  paginate: <T>(array: T[], page: number, size: number) => T[];
  chunk: <T>(array: T[], size: number) => T[][];
};
```

### 🔗 URL Utils

```typescript
export const urlUtils = {
  // Construcción
  buildUrl: (base: string, params: Record<string, any>) => string;
  addQueryParams: (url: string, params: Record<string, any>) => string;
  
  // Parsing
  parseQueryParams: (url: string) => Record<string, string>;
  extractDomain: (url: string) => string;
  
  // Validación
  isAbsoluteUrl: (url: string) => boolean;
  isSameOrigin: (url1: string, url2: string) => boolean;
};
```

### 🔤 String Utils

```typescript
export const stringUtils = {
  // Formateo
  capitalize: (str: string) => string;
  camelCase: (str: string) => string;
  kebabCase: (str: string) => string;
  titleCase: (str: string) => string;
  
  // Limpieza
  removeAccents: (str: string) => string;
  removeSpecialChars: (str: string) => string;
  sanitizeHtml: (str: string) => string;
  
  // Búsqueda
  fuzzySearch: (query: string, text: string) => boolean;
  highlight: (text: string, query: string) => string;
  
  // Truncado
  truncate: (str: string, length: number, suffix?: string) => string;
  truncateWords: (str: string, wordCount: number, suffix?: string) => string;
};
```

## 📦 Export Pattern

```typescript
// utils/index.ts
export { dateUtils } from './dateUtils';
export { currencyUtils } from './currencyUtils';
export { validationUtils } from './validationUtils';
export { locationUtils } from './locationUtils';
export { colorUtils } from './colorUtils';
export { deviceUtils } from './deviceUtils';
export { arrayUtils } from './arrayUtils';
export { urlUtils } from './urlUtils';
export { stringUtils } from './stringUtils';

// También exportar helpers comunes
export * from './constants';
export * from './formatters';
export * from './validators';
```

## 🎯 Principios de Diseño

### 🔧 Pure Functions
- Funciones sin efectos secundarios
- Misma entrada = misma salida
- Fácil testing y debugging

### 📱 Platform Agnostic
- Funciones que funcionan en cualquier plataforma
- Abstracciones cuando sea necesario
- Fallbacks para funcionalidades específicas

### ⚡ Performance
- Funciones optimizadas
- Memoización cuando corresponde
- Lazy evaluation