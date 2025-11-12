# Products & Orders System

## Overview

Complete implementation of products catalog and WhatsApp-based ordering flow for WeNearBy marketplace. No payment processing - customers send orders via WhatsApp deep link with formatted message.

**Key Features:**
- Product management with 1-5 image uploads to Firebase Storage
- Category-based browsing (tag system)
- Shopping cart with delivery/pickup mode
- WhatsApp integration (wa.me deep links)
- Order intent audit trail in Firestore

---

## Architecture

### Data Models

#### Product
```typescript
interface Product {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  price: number;
  currency: 'COP';
  images: ProductImage[]; // 1-5 images required
  tags: string[]; // Used for categories
  active: boolean; // Only active products shown
  createdAt: number;
  updatedAt?: number;
}

interface ProductImage {
  url: string; // Firebase Storage download URL
  alt?: string;
}
```

#### OrderIntent
```typescript
interface OrderIntent {
  id: string;
  storeId: string;
  items: OrderItem[]; // Denormalized for history
  deliveryMode: 'delivery' | 'pickup';
  customerContact?: string;
  status: 'pending' | 'sent' | 'confirmed' | 'cancelled';
  total: number;
  currency: 'COP';
  createdAt: number;
}

interface OrderItem {
  productId: string;
  productName: string; // Denormalized
  price: number; // Denormalized
  quantity: number;
  subtotal: number; // price * quantity
}
```

**Why Denormalized?**
- WhatsApp message generation doesn't require product lookups
- Order history preserved even if product deleted/updated
- Total calculation without additional queries

---

## Services

### FirebaseProductService

**Location:** `src/services/products/firebase-product.service.ts`

#### Methods

##### `listByStore(storeId, options?)`
Retrieve products with filtering.

```typescript
const products = await productService.listByStore('store-123', {
  activeOnly: true, // Default: false
  categoryId: 'pizza', // Optional: filter by tag
});
```

**Firestore Query:**
```javascript
collection('products')
  .where('storeId', '==', storeId)
  .where('active', '==', true) // if activeOnly
  .where('tags', 'array-contains', categoryId) // if categoryId
```

##### `create(product)`
Create product with image validation.

```typescript
await productService.create({
  storeId: 'store-123',
  name: 'Pizza Margarita',
  price: 25000,
  currency: 'COP',
  images: [
    { url: 'https://...', alt: 'Pizza' }
  ],
  tags: ['pizza', 'vegetariana'],
  active: true,
});
```

**Validation:**
- `images.length` must be 1-5 (throws error if violated)
- Timestamps auto-generated (`createdAt`, `updatedAt`)

##### `update(id, updates)`
Update existing product.

```typescript
await productService.update('prod-123', {
  price: 28000,
  active: false,
});
```

**Validation:**
- If `images` provided, must be 1-5
- `updatedAt` auto-generated

##### `uploadProductImage(storeId, productId, imageBlob, imageId)`
Upload image to Firebase Storage.

```typescript
const downloadUrl = await uploadProductImage(
  'store-123',
  'prod-456',
  imageBlob, // Blob from file input
  'image-1'
);
```

**Storage Path:**
```
stores/{storeId}/products/{productId}/{imageId}
```

**Returns:** Download URL for image

---

### FirebaseOrderIntentService

**Location:** `src/services/orders/firebase-order-intent.service.ts`

#### Methods

##### `create(orderIntent)`
Record order intent (for audit trail).

```typescript
await orderIntentService.create({
  storeId: 'store-123',
  items: [
    {
      productId: 'prod-1',
      productName: 'Pizza Margarita',
      price: 25000,
      quantity: 2,
      subtotal: 50000,
    },
  ],
  deliveryMode: 'delivery',
  customerContact: '+57 310 123 4567',
  status: 'sent',
  total: 50000,
  currency: 'COP',
});
```

**Validation:**
- `items.length > 0` (throws if empty)
- `deliveryMode` must be 'delivery' or 'pickup'
- `createdAt` auto-generated with `serverTimestamp()`

---

## Components

### ProductCard

**Location:** `src/components/ProductCard.tsx`

Display product with image carousel.

#### Props
```typescript
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}
```

#### Features
- **Image Carousel:** Horizontal ScrollView with pagination indicators
- **Price Formatting:** `$25,000` (COP with toLocaleString)
- **Tags:** Category chips (first 3)
- **Add to Cart:** Button triggers `onAddToCart` callback

#### Example
```tsx
<ProductCard
  product={product}
  onAddToCart={(p) => cart.addItem(p, 1)}
/>
```

---

### CartProvider

**Location:** `src/context/CartProvider.tsx`

Global cart state management.

#### Context API
```typescript
interface CartContextValue {
  items: CartItem[];
  itemCount: number; // Computed: sum of quantities
  total: number; // Computed: sum of subtotals
  deliveryMode: DeliveryMode;
  
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setDeliveryMode: (mode: DeliveryMode) => void;
  clearCart: () => void;
}
```

#### Usage
```tsx
// Wrap app with provider
<CartProvider>
  <App />
</CartProvider>

// Access cart in components
const cart = useCart();
cart.addItem(product, 2);
console.log(cart.total); // Computed value
```

#### CartItem
```typescript
interface CartItem {
  product: Product; // Full product object
  quantity: number;
}
```

---

### StoreScreen

**Location:** `src/screens/StoreScreen.tsx`

Store detail with product catalog and cart.

#### Props
```typescript
interface StoreScreenProps {
  store: Store;
}
```

#### Features
1. **Store Header:** Name, description, contact info
2. **Category Tabs:** Extracted from product tags
   - "Todos" tab shows all products
   - Categories auto-generated from unique tags
3. **Product List:** FlatList with ProductCard (activeOnly)
4. **Floating Cart Button:** 
   - Badge shows item count
   - Opens cart modal
   - Only visible if cart has items
5. **Cart Modal:** Full-height sheet with CartScreen

#### Example
```tsx
<StoreScreen store={store} />
```

**Category Extraction:**
```typescript
const categories = ['Todos', ...new Set(
  products.flatMap(p => p.tags)
)];
```

---

### CartScreen

**Location:** `src/screens/CartScreen.tsx`

Cart review and WhatsApp checkout.

#### Props
```typescript
interface CartScreenProps {
  store: Store;
  onClose: () => void;
}
```

#### Features
1. **Cart Items List:**
   - Product name, price, subtotal
   - Quantity controls (+/- buttons)
   - Remove item button
   
2. **Delivery Mode Selector:**
   - 🚚 Domicilio (delivery)
   - 🏪 Recoger en tienda (pickup)
   
3. **Customer Contact Input:**
   - Optional phone number
   - Used in WhatsApp message
   
4. **Total Calculation:**
   - Sum of all subtotals
   - Updates reactively
   
5. **WhatsApp Integration:**
   - Generates formatted message
   - Opens wa.me deep link
   - Creates OrderIntent audit record
   - Clears cart on success

#### WhatsApp Flow

**1. Generate Message**
```typescript
function generateWhatsAppMessage(
  store: Store,
  items: CartItem[],
  total: number,
  deliveryMode: DeliveryMode,
  customerContact?: string
): string {
  return `🛒 *Nuevo Pedido - ${store.name}*

📦 *Productos:*
${items.map((item, i) => 
  `${i + 1}. ${item.product.name} x${item.quantity} - ${formatPrice(item.product.price * item.quantity)}`
).join('\n')}

💰 *Total:* ${formatPrice(total)}

🚚 *Modo de entrega:* ${deliveryMode === 'delivery' ? 'Domicilio' : 'Recoger en tienda'}

${customerContact ? `📞 *Contacto:* ${customerContact}\n` : ''}
_Pedido generado desde WeNearBy_`;
}
```

**2. Send via WhatsApp**
```typescript
const handleSend = async () => {
  const message = generateWhatsAppMessage(/*...*/);
  const whatsapp = store.contact.whatsapp;
  
  if (whatsapp) {
    // Check if WhatsApp installed
    const canOpen = await Linking.canOpenURL(`whatsapp://send`);
    
    if (canOpen) {
      // Open wa.me deep link
      const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
      await Linking.openURL(url);
    }
  }
  
  // Create audit record
  await orderIntentService.create({
    storeId: store.id,
    items: cart.items.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    })),
    deliveryMode: cart.deliveryMode,
    customerContact,
    status: 'sent',
    total: cart.total,
    currency: 'COP',
  });
  
  // Clear cart
  cart.clearCart();
  onClose();
};
```

**3. WhatsApp URL Format**
```
https://wa.me/{phoneNumber}?text={encodedMessage}
```

Example:
```
https://wa.me/+573101234567?text=%F0%9F%9B%92%20*Nuevo%20Pedido...
```

**4. Fallback (No WhatsApp)**
If store has no WhatsApp or user can't open link:
- Create OrderIntent only
- Show confirmation: "Pedido registrado. Contacta a la tienda por otros medios."

---

## Usage Example

### Complete Flow

**1. Setup (App.tsx)**
```tsx
import { CartProvider } from './src/context/CartProvider';

export default function App() {
  return (
    <CartProvider>
      <Router />
    </CartProvider>
  );
}
```

**2. Store Screen (Vendor creates products)**
```tsx
// Create product with images
await productService.create({
  storeId: store.id,
  name: 'Pizza Margarita',
  description: 'Salsa de tomate, mozzarella, albahaca',
  price: 25000,
  currency: 'COP',
  images: [
    { url: downloadUrl, alt: 'Pizza' }
  ],
  tags: ['pizza', 'vegetariana'],
  active: true,
});
```

**3. Customer browses (StoreScreen)**
```tsx
<StoreScreen store={store} />
```
- Customer sees categories: "Todos", "pizza", "pasta", "postre"
- Customer filters by "pizza"
- Customer sees ProductCard with carousel
- Customer taps "Agregar" → cart badge updates

**4. Customer reviews cart (CartScreen)**
```tsx
// Cart opens in modal
const cart = useCart();
console.log(cart.items); // [{ product: {...}, quantity: 2 }]
console.log(cart.total); // 50000
```
- Customer adjusts quantities (+/-)
- Customer selects "Domicilio"
- Customer enters contact: "+57 310 123 4567"

**5. Customer sends order (WhatsApp)**
```tsx
// Taps "Enviar por WhatsApp"
// → generateWhatsAppMessage creates formatted text
// → Opens wa.me link
// → Creates OrderIntent audit record
// → Clears cart
```

**6. Vendor receives WhatsApp**
Vendor sees formatted message in WhatsApp:
```
🛒 *Nuevo Pedido - Pizzería Test*

📦 *Productos:*
1. Pizza Margarita x2 - $50,000

💰 *Total:* $50,000

🚚 *Modo de entrega:* Domicilio

📞 *Contacto:* +57 310 123 4567

_Pedido generado desde WeNearBy_
```

Vendor replies to customer via WhatsApp to:
- Confirm order
- Arrange payment (bank transfer, cash on delivery, etc.)
- Coordinate delivery/pickup

---

## Testing

### Test Screen

**Location:** `app/__tests__/products-test.tsx`

Interactive test with:
- Mock store (Pizzería Test)
- 5 mock products (4 active, 1 inactive)
- WhatsApp contact for testing

#### Test Steps
1. **Create Products:** Seeds Firebase with test data
2. **Open Store:** Navigate to StoreScreen
3. **Add to Cart:** Test ProductCard interactions
4. **Review Cart:** Test CartScreen UI
5. **Send Order:** Test WhatsApp integration

#### Validation Checklist
- [ ] Inactive products hidden (activeOnly filter)
- [ ] Category tabs show correct products
- [ ] Image carousel works (Pizza Pepperoni has 2 images)
- [ ] Cart badge updates on add
- [ ] Quantity controls work (+/-)
- [ ] Delivery/pickup toggle works
- [ ] WhatsApp opens with correct message
- [ ] Total calculated correctly

#### Test Data
```typescript
const TEST_STORE: Store = {
  id: 'store-test',
  name: 'Pizzería Test',
  contact: {
    whatsapp: '+57 310 123 4567',
  },
  // ...
};

const TEST_PRODUCTS: Product[] = [
  {
    name: 'Pizza Margarita',
    price: 25000,
    tags: ['pizza', 'vegetariana'],
    active: true,
  },
  // 3 more active products
  {
    name: 'Producto Inactivo',
    active: false, // Should NOT appear
  },
];
```

---

## Configuration

### Firebase Setup

**1. Storage Rules**
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /stores/{storeId}/products/{productId}/{imageId} {
      allow read: if true; // Public images
      allow write: if request.auth != null 
        && request.auth.uid == get(/databases/(default)/documents/stores/$(storeId)).data.vendorUserId;
    }
  }
}
```

**2. Firestore Rules**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true; // Public read
      allow create, update: if request.auth != null
        && request.auth.uid == get(/databases/(default)/documents/stores/$(resource.data.storeId)).data.vendorUserId;
    }
    
    match /order_intents/{orderId} {
      allow create: if request.auth != null; // Customers can create
      allow read, update: if request.auth != null
        && (request.auth.uid == resource.data.customerId
          || request.auth.uid == get(/databases/(default)/documents/stores/$(resource.data.storeId)).data.vendorUserId);
    }
  }
}
```

### Service Registry

**Location:** `src/services/registry.ts`

```typescript
export const USE_FIREBASE = true; // Toggle Firebase vs Mock

export function getProductService(): ProductService {
  return USE_FIREBASE 
    ? new FirebaseProductService() 
    : new MockProductService();
}

export function getOrderIntentService(): OrderIntentService {
  return USE_FIREBASE
    ? new FirebaseOrderIntentService()
    : new MockOrderIntentService();
}
```

---

## Performance Considerations

### Image Upload
- **Max size:** Consider adding validation (e.g., 5MB per image)
- **Compression:** Use react-native-image-picker with quality: 0.8
- **Progress:** Show upload progress for better UX

### Product Listing
- **Pagination:** Current implementation loads all products
  - Consider pagination if store has >50 products
  - Use Firestore `limit()` and `startAfter()`

### Cart Performance
- **Computed values:** `itemCount` and `total` use `useMemo`
- **Actions:** `addItem`, `updateQuantity`, etc. use `useCallback`
- **Re-renders:** Cart updates only trigger subscribed components

---

## Troubleshooting

### WhatsApp Not Opening

**Symptom:** wa.me link doesn't open

**Solutions:**
1. Check phone number format: `+57 310 123 4567` (with country code)
2. Test on physical device (WhatsApp not available in simulator)
3. Verify `expo-linking` installed: `npx expo install expo-linking`
4. Check `Linking.canOpenURL('whatsapp://send')` returns true

### Images Not Uploading

**Symptom:** `uploadProductImage` fails

**Solutions:**
1. Check Firebase Storage rules (allow write for vendor)
2. Verify blob format (use `react-native-image-picker`)
3. Check internet connection
4. Verify Storage bucket initialized in Firebase config

### Inactive Products Showing

**Symptom:** Products with `active: false` appear

**Solutions:**
1. Verify `activeOnly: true` passed to `listByStore`
2. Check Firestore index created for `storeId` + `active` compound query
3. Confirm product's `active` field is boolean (not string)

### Cart Not Persisting

**Symptom:** Cart clears on navigation

**Solutions:**
1. Verify `CartProvider` wraps entire app (not individual screens)
2. Check navigation doesn't remount CartProvider
3. Consider adding AsyncStorage persistence for cart state

---

## Future Enhancements

### Planned Features
- [ ] MockProductService for dev without Firebase
- [ ] Product inventory tracking (stock count)
- [ ] Product variants (size, color)
- [ ] Order status updates (vendor confirms)
- [ ] Customer order history screen
- [ ] Product search (Algolia integration)
- [ ] Product reviews/ratings
- [ ] Cart persistence (AsyncStorage)
- [ ] Push notifications for order updates

### Architecture Improvements
- [ ] Product image optimization (CDN, thumbnails)
- [ ] Pagination for product list (>50 items)
- [ ] GraphQL API (replace REST)
- [ ] Server-side order processing (Cloud Functions)
- [ ] Payment integration (Stripe, PayU)

---

## API Reference

### ProductService Interface
```typescript
interface ProductService {
  listByStore(
    storeId: string, 
    options?: { activeOnly?: boolean; categoryId?: string }
  ): Promise<Product[]>;
  
  getById(id: string): Promise<Product | null>;
  
  create(product: Omit<Product, 'id' | 'createdAt'>): Promise<string>;
  
  update(id: string, updates: Partial<Product>): Promise<void>;
  
  delete(id: string): Promise<void>;
}
```

### OrderIntentService Interface
```typescript
interface OrderIntentService {
  create(orderIntent: Omit<OrderIntent, 'id' | 'createdAt'>): Promise<string>;
  
  getById(id: string): Promise<OrderIntent | null>;
  
  listByStore(storeId: string): Promise<OrderIntent[]>;
  
  updateStatus(id: string, status: OrderStatus): Promise<void>;
}
```

---

## Summary

**What was built:**
- ✅ FirebaseProductService (CRUD + Storage upload)
- ✅ FirebaseOrderIntentService (audit trail)
- ✅ ProductCard (carousel, tags, price)
- ✅ CartProvider (global cart state)
- ✅ CartScreen (review, WhatsApp send)
- ✅ StoreScreen (catalog, categories, cart button)
- ✅ Test screen (interactive demo)

**How it works:**
1. Vendor creates products with images → Firebase Storage
2. Customer browses StoreScreen → filters by category
3. Customer adds to cart → CartProvider tracks state
4. Customer reviews CartScreen → adjusts quantities, selects delivery mode
5. Customer sends order → WhatsApp opens with formatted message + OrderIntent audit record
6. Vendor receives WhatsApp → arranges payment/delivery via chat

**Why this approach:**
- **No payment processing:** Many Latin American small businesses prefer WhatsApp for payment arrangement (bank transfer, cash on delivery)
- **Audit trail:** OrderIntent in Firestore provides history even when using WhatsApp
- **Flexible categories:** Tag-based system allows products in multiple categories without rigid schema
- **Denormalized data:** OrderItem includes product name/price for message generation without lookups

**Next steps:**
1. Run test screen to validate flow
2. Add MockProductService for dev without Firebase
3. Consider inventory tracking if needed
4. Add order status updates (vendor confirmation)
