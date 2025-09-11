# Shared Types

Interfaces y tipos TypeScript compartidos entre todos los módulos.

## 📋 Tipos Principales

### 👤 User Types

```typescript
// Base user interface
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Customer specific
export interface Customer extends User {
  type: 'customer';
  preferences: CustomerPreferences;
  address?: Address;
  phone?: string;
  favoriteBusinesses: string[];
}

// Business owner specific  
export interface BusinessOwner extends User {
  type: 'business';
  businessId: string;
  permissions: Permission[];
}

export interface CustomerPreferences {
  language: 'es' | 'en';
  notifications: NotificationSettings;
  theme: 'light' | 'dark' | 'auto';
}
```

### 🏪 Business Types

```typescript
export interface Business {
  id: string;
  name: string;
  description: string;
  category: BusinessCategory;
  address: Address;
  location: GeoPoint;
  phone: string;
  email: string;
  website?: string;
  hours: BusinessHours;
  images: string[];
  rating: number;
  reviewCount: number;
  ownerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  openTime?: string; // "09:00"
  closeTime?: string; // "18:00"
}

export type BusinessCategory = 
  | 'restaurant'
  | 'retail'
  | 'services'
  | 'health'
  | 'beauty'
  | 'automotive'
  | 'other';
```

### 🛍️ Product Types

```typescript
export interface Product {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: ProductCategory;
  isAvailable: boolean;
  stock?: number;
  variants?: ProductVariant[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock?: number;
}

export type ProductCategory =
  | 'food'
  | 'clothing'
  | 'electronics'
  | 'books'
  | 'home'
  | 'other';
```

### 📦 Order Types

```typescript
export interface Order {
  id: string;
  customerId: string;
  businessId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  paymentMethod: PaymentMethod;
  deliveryAddress?: Address;
  notes?: string;
  estimatedDeliveryTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'digital_wallet';
```

### 📍 Location Types

```typescript
export interface Address {
  street: string;
  number: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  complement?: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Coordinates extends GeoPoint {
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}
```

### 🔔 Notification Types

```typescript
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

export type NotificationType =
  | 'order_status'
  | 'promotion'
  | 'reminder'
  | 'system';

export interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  reminders: boolean;
  system: boolean;
}
```

## 🛠️ Utility Types

### 📊 API Types

```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface QueryFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: any;
}
```

### 🎨 UI Types

```typescript
export type ColorScheme = 'light' | 'dark';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'ghost';

export type ButtonSize = 'small' | 'medium' | 'large';

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  fonts: {
    regular: string;
    medium: string;
    bold: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}
```

## 📦 Export Pattern

```typescript
// types/index.ts
export type * from './user.types';
export type * from './business.types';
export type * from './product.types';
export type * from './order.types';
export type * from './location.types';
export type * from './notification.types';
export type * from './api.types';
export type * from './ui.types';
```