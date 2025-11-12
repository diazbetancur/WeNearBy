// Core domain models for WeNearBy MVP

// ---------- Geo / Location ----------
export interface LatLng {
  lat: number;
  lng: number;
}

// ---------- User & Authentication ----------
export interface User {
  id: string;
  email: string;
  displayName?: string;
  roles: string[];
  currentRole: string;
  createdAt: number;
  photoURL?: string;
}

// ---------- Vendor Profile ----------
export type VendorProfileStatus = 'pending' | 'approved' | 'rejected';

export interface VendorProfile {
  id: string;
  userId: string;
  legalName: string;
  contactEmail: string;
  phone?: string;
  approved: boolean; // Kept for backward compatibility
  status: VendorProfileStatus;
  createdAt: number;
  updatedAt: number;
}

// ---------- Store / Category ----------
export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
}

export interface StoreContact {
  phone?: string;
  whatsapp?: string;
  email?: string;
}

export interface Store {
  id: string;
  vendorUserId: string;
  name: string;
  description?: string;
  address: string;
  geo: LatLng;
  coverageKm: number;
  isOpen: boolean;
  hasDelivery: boolean;
  contact: StoreContact;
  categoryIds?: string[];
  featured?: boolean;
  createdAt: number;
  updatedAt: number;
  // Optional extended fields
  operatingHours?: {
    open: string;
    close: string;
  };
}

// ---------- Products ----------
export interface ProductImage {
  url: string;
  alt?: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  images: ProductImage[];
  tags?: string[];
  active: boolean;
  createdAt: number;
}

// ---------- Order Intent ----------
export interface OrderItem {
  productId: string;
  productName: string; // Denormalized for WhatsApp message
  quantity: number;
  price: number; // Denormalized for total calculation
}

export type DeliveryMode = 'delivery' | 'pickup';

export interface OrderIntent {
  id: string;
  userId: string;
  storeId: string;
  items: OrderItem[];
  deliveryMode: DeliveryMode;
  message?: string;
  customerContact?: string; // Phone/email for vendor to contact
  createdAt: number;
  status: 'draft' | 'sent' | 'cancelled';
}
