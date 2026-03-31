import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  name_en: string;
  description: string;
  price_aud: number;
  currency: string;
  category: string;
  image_url?: string;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  name: string;
  name_en: string;
  description: string;
  price_aud: number;
  currency: string;
  category: string;
  image_url?: string;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  stock_quantity: number;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (includeInactive = false) => {
    try {
      setLoading(true);
      setError(null);

      const headers: Record<string, string> = {};
      
      // If we want to include inactive products, we need admin auth
      if (includeInactive) {
        const token = localStorage.getItem('admin_token');
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }

      const { data, error } = await supabase.functions.invoke('product_management_2026_03_11_22_20', {
        method: 'GET',
        headers
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('Network error');
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      setProducts(data.products || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: ProductFormData) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      if (!token) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('product_management_2026_03_11_22_20', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: productData
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('Network error');
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create product');
      }

      await fetchProducts(true); // Refresh products list
      return { success: true, product: data.product };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (productId: string, productData: Partial<ProductFormData>) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      if (!token) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('product_management_2026_03_11_22_20', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: { ...productData, productId }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('Network error');
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update product');
      }

      await fetchProducts(true); // Refresh products list
      return { success: true, product: data.product };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      if (!token) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('product_management_2026_03_11_22_20', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        body: { productId }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('Network error');
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete product');
      }

      await fetchProducts(true); // Refresh products list
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
}