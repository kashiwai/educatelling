import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Plan } from '@/lib/index';

interface DatabasePlan {
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

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plans_2026_03_11_21_20')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        throw error;
      }

      const formattedPlans: Plan[] = (data as DatabasePlan[]).map(plan => ({
        id: plan.id,
        name: plan.name,
        nameEn: plan.name_ja,
        price: plan.price_aud,
        currency: 'AUD',
        duration: plan.duration_months === 12 ? 'Monthly' : 'One-time payment',
        description: plan.description,
        features: JSON.parse(plan.features),
        recommended: plan.is_featured,
        color: getColorForPlan(plan.name)
      }));

      setPlans(formattedPlans);
      setError(null);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return { plans, loading, error, refetch: fetchPlans };
}

function getColorForPlan(planName: string): string {
  const colorMap: Record<string, string> = {
    'Starter Program': 'from-primary/20 to-primary/10',
    'Standard Program': 'from-accent/20 to-accent/10',
    'Premium Japan Immersion': 'from-primary/30 to-accent/20',
    'Japan Study Tour (2 Weeks)': 'from-primary/15 to-accent/15',
    'Japan Study Tour (1 Month)': 'from-primary/15 to-accent/15',
    'JLPT + Japan Program': 'from-primary/20 to-accent/20'
  };
  
  return colorMap[planName] || 'from-primary/20 to-primary/10';
}