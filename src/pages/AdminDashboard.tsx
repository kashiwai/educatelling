import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdmin, useAdminPlans } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  LogOut, 
  DollarSign, 
  Users, 
  Package,
  Star,
  Loader2
} from 'lucide-react';

interface PlanFormData {
  name: string;
  nameEn: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
  is_featured: boolean;
  display_order: number;
}

function PlanForm({ 
  plan, 
  onSubmit, 
  onCancel, 
  loading 
}: { 
  plan?: any; 
  onSubmit: (data: PlanFormData) => void; 
  onCancel: () => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState<PlanFormData>({
    name: plan?.name || '',
    nameEn: plan?.name_ja || '',
    price: plan?.price_aud || 0,
    duration: plan?.duration_months === 12 ? 'Monthly' : 'One-time',
    description: plan?.description || '',
    features: plan?.features ? JSON.parse(plan.features) : [''],
    is_featured: plan?.is_featured || false,
    display_order: plan?.display_order || 0
  });

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Plan Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nameEn">English Name</Label>
          <Input
            id="nameEn"
            value={formData.nameEn}
            onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (AUD)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Select
            value={formData.duration}
            onValueChange={(value) => setFormData({ ...formData, duration: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Monthly">Monthly</SelectItem>
              <SelectItem value="One-time">One-time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="display_order">Display Order</Label>
          <Input
            id="display_order"
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Features</Label>
        {formData.features.map((feature, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={feature}
              onChange={(e) => handleFeatureChange(index, e.target.value)}
              placeholder="Enter feature"
              required
            />
            {formData.features.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeFeature(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addFeature}>
          <Plus className="w-4 h-4 mr-2" />
          Add Feature
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_featured"
          checked={formData.is_featured}
          onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
        />
        <Label htmlFor="is_featured">Featured Plan</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            plan ? 'Update Plan' : 'Create Plan'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function AdminDashboard() {
  const { admin, logout, checkAuth } = useAdmin();
  const { plans, loading, error, fetchPlans, createPlan, updatePlan, deletePlan } = useAdminPlans();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!admin && !checkAuth()) {
      navigate('/admin');
      return;
    }
    fetchPlans();
  }, [admin, navigate]);

  const handleCreatePlan = async (data: PlanFormData) => {
    setFormLoading(true);
    const result = await createPlan({
      name: data.name,
      name_ja: data.nameEn,
      price_aud: data.price,
      duration_months: data.duration === 'Monthly' ? 12 : 1,
      description: data.description,
      features: JSON.stringify(data.features),
      is_active: true,
      is_featured: data.is_featured,
      display_order: data.display_order
    });
    
    if (result.success) {
      setIsDialogOpen(false);
      setSelectedPlan(null);
    }
    setFormLoading(false);
  };

  const handleUpdatePlan = async (data: PlanFormData) => {
    if (!selectedPlan) return;
    
    setFormLoading(true);
    const result = await updatePlan(selectedPlan.id, {
      name: data.name,
      name_ja: data.nameEn,
      price_aud: data.price,
      duration_months: data.duration === 'Monthly' ? 12 : 1,
      description: data.description,
      features: JSON.stringify(data.features),
      is_featured: data.is_featured,
      display_order: data.display_order
    });
    
    if (result.success) {
      setIsDialogOpen(false);
      setSelectedPlan(null);
    }
    setFormLoading(false);
  };

  const handleDeletePlan = async (planId: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      await deletePlan(planId);
    }
  };

  if (!admin && !checkAuth()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage Opal Japanese Kids</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {admin?.name || 'Admin'}
              </span>
              <Button variant="outline" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{plans.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured Plans</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {plans.filter(plan => plan.is_featured).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Price Range</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {plans.length > 0 && (
                  `$${Math.min(...plans.map(p => p.price_aud))} - $${Math.max(...plans.map(p => p.price_aud))}`
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Plans Management</CardTitle>
                <CardDescription>Create and manage pricing plans</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedPlan(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedPlan ? 'Edit Plan' : 'Create New Plan'}
                    </DialogTitle>
                  </DialogHeader>
                  <PlanForm
                    plan={selectedPlan}
                    onSubmit={selectedPlan ? handleUpdatePlan : handleCreatePlan}
                    onCancel={() => {
                      setIsDialogOpen(false);
                      setSelectedPlan(null);
                    }}
                    loading={formLoading}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {plans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{plan.name}</h3>
                          {plan.is_featured && (
                            <Badge variant="default">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {plan.name_ja}
                        </p>
                        <p className="text-muted-foreground mb-3">
                          {plan.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-semibold">
                            AUD ${plan.price_aud.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">
                            {plan.duration_months === 12 ? 'Monthly' : 'One-time'}
                          </span>
                          <span className="text-muted-foreground">
                            Order: {plan.display_order}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPlan(plan);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePlan(plan.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}