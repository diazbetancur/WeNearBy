// Base User Types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer extends User {
  type: 'customer';
  phone?: string;
  address?: Address;
}

export interface BusinessOwner extends User {
  type: 'business';
  businessId: string;
}

// Location Types
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
