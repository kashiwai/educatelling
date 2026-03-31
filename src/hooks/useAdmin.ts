import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AdminPlan {
  id: string;
  name: string;
  name_ja: string;
  price_aud: number;
  duration_months: number;
  description: string;
  features: string;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
}

export function useAdmin() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('admin_auth_2026_03_11_21_20', {
        body: { email, password }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('Network error');
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Login failed');
      }

      const { token, admin: adminData } = data;
      localStorage.setItem('admin_token', token);
      setAdmin(adminData);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (token) {
        await supabase.functions.invoke('admin_auth_2026_03_11_21_20', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('admin_token');
      setAdmin(null);
    }
  };

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token');
    return !!token;
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      // In a real app, you'd verify the token with the server
      // For now, we'll assume it's valid if it exists
      setAdmin({
        id: 'admin',
        email: 'yuna@metisbel.com',
        name: 'Yuna Admin',
        role: 'super_admin'
      });
    }
  }, []);

  return { admin, loading, error, login, logout, checkAuth };
}

export function useAdminPlans() {
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      if (!token) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('admin_auth_2026_03_11_21_20', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setPlans(data.plans);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch plans';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (planData: Omit<AdminPlan, 'id'>) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      if (!token) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('admin_auth_2026_03_11_21_20', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: planData
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      await fetchPlans(); // Refresh plans
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create plan';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = async (planId: string, planData: Partial<AdminPlan>) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      if (!token) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke(`admin_auth_2026_03_11_21_20`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: { ...planData, planId }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      await fetchPlans(); // Refresh plans
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update plan';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      if (!token) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke(`admin_auth_2026_03_11_21_20`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        body: { planId }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      await fetchPlans(); // Refresh plans
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete plan';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { plans, loading, error, fetchPlans, createPlan, updatePlan, deletePlan };
}