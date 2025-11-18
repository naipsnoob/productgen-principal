
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface Subscription {
  planId: string;
  planName: string;
  status: 'active' | 'canceled';
  credits: number;
  periodEnd: string;
}

export interface ProductSpecification {
  weight_kg: number;
  dimensions_cm: string;
  ncm: string;
  ean: string;
  sku: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  sku: string;
  category?: string;
  specifications?: ProductSpecification;
  price?: number;
}

export interface ProductGroup {
  id: string;
  name: string;
  baseImageUrl: string;
  products: Product[]; // The variations
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
}