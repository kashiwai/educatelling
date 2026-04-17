import { useState, useEffect } from 'react';
import { useProducts, type ProductFormData } from '@/hooks/useProducts';
import { usePlans } from '@/hooks/usePlans';
import { getPaymentSettings, savePaymentSettings, type PaymentSettings } from '@/hooks/usePaymentSettings';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_SECRET = 'opal-admin-2026';

interface PlanFormData {
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

export default function AdminProductManagement() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('yuna@metisbel.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'plans' | 'payment'>('products');
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(getPaymentSettings());
  const [paymentSaved, setPaymentSaved] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Plans state
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [planSaving, setPlanSaving] = useState(false);
  const [planFormData, setPlanFormData] = useState<PlanFormData>({
    name: '', name_ja: '', price_aud: 0, duration_months: 1,
    description: '', features: '', is_active: true, is_featured: false, display_order: 999,
  });

  const { products, loading: productsLoading, fetchProducts, createProduct, updateProduct, deleteProduct } = useProducts();
  const { plans, loading: plansLoading, refetch: refetchPlans } = usePlans();

  const [productForm, setProductForm] = useState<ProductFormData>({
    name: '',
    name_en: '',
    description: '',
    price_aud: 0,
    currency: 'AUD',
    category: '',
    image_url: '',
    is_active: true,
    is_featured: false,
    display_order: 999,
    stock_quantity: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsLoggedIn(true);
      fetchProducts(true); // Fetch all products including inactive ones
    }
  }, []);

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.fontFamily = '';
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'yuna@metisbel.com' && password === 'admin123') {
      localStorage.setItem('admin_token', 'simple_token');
      setIsLoggedIn(true);
      setError('');
      fetchProducts(true);
    } else {
      setError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let result;
    if (editingProduct) {
      result = await updateProduct(editingProduct.id, productForm);
    } else {
      result = await createProduct(productForm);
    }

    if (result.success) {
      setShowProductForm(false);
      setEditingProduct(null);
      resetProductForm();
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      name_en: '',
      description: '',
      price_aud: 0,
      currency: 'AUD',
      category: '',
      image_url: '',
      is_active: true,
      is_featured: false,
      display_order: 999,
      stock_quantity: 0
    });
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      name_en: product.name_en,
      description: product.description,
      price_aud: product.price_aud,
      currency: product.currency,
      category: product.category,
      image_url: product.image_url || '',
      is_active: product.is_active,
      is_featured: product.is_featured,
      display_order: product.display_order,
      stock_quantity: product.stock_quantity
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(productId);
    }
  };

  // Plan CRUD
  const resetPlanForm = () => {
    setPlanFormData({ name: '', name_ja: '', price_aud: 0, duration_months: 1, description: '', features: '', is_active: true, is_featured: false, display_order: 999 });
  };

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan);
    setPlanFormData({
      name: plan.name,
      name_ja: plan.nameEn ?? plan.name,
      price_aud: plan.price,
      duration_months: plan.duration === 'Monthly' ? 12 : 1,
      description: plan.description,
      features: Array.isArray(plan.features) ? plan.features.join('\n') : '',
      is_active: true,
      is_featured: plan.recommended ?? false,
      display_order: 999,
    });
    setShowPlanForm(true);
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlanSaving(true);
    const featuresArr = planFormData.features.split('\n').map(f => f.trim()).filter(Boolean);
    const payload = { ...planFormData, features: featuresArr };

    try {
      if (editingPlan) {
        await supabase.functions.invoke('plan-management', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${ADMIN_SECRET}` },
          body: { planId: editingPlan.id, ...payload },
        });
      } else {
        await supabase.functions.invoke('plan-management', {
          method: 'POST',
          headers: { Authorization: `Bearer ${ADMIN_SECRET}` },
          body: payload,
        });
      }
      await refetchPlans();
      setShowPlanForm(false);
      setEditingPlan(null);
      resetPlanForm();
    } catch (err) {
      alert('Failed to save plan.');
    } finally {
      setPlanSaving(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Delete this plan?')) return;
    await supabase.functions.invoke('plan-management', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${ADMIN_SECRET}` },
      body: { planId },
    });
    await refetchPlans();
  };

  if (!isLoggedIn) {
    return (
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        zIndex: 9999
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '400px'
        }}>
          <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333', fontSize: '1.5rem' }}>
            Admin Login
          </h1>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                Email:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                Password:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>
            {error && (
              <div style={{ 
                color: '#dc3545', 
                marginBottom: '1rem', 
                padding: '0.5rem',
                backgroundColor: '#f8d7da',
                borderRadius: '4px',
                border: '1px solid #f5c6cb'
              }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
          </form>
          <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#666' }}>
            <p>Demo credentials:</p>
            <p>Email: yuna@metisbel.com</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      zIndex: 9999,
      overflow: 'auto'
    }}>
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #ddd',
        padding: '1rem 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, color: '#333', fontSize: '1.5rem' }}>Admin Dashboard</h1>
              <p style={{ margin: 0, color: '#666' }}>Manage Opal Japanese Kids</p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Tab Navigation */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #ddd' }}>
            <button
              onClick={() => setActiveTab('products')}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: activeTab === 'products' ? '2px solid #007bff' : '2px solid transparent',
                color: activeTab === 'products' ? '#007bff' : '#666',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: activeTab === 'products' ? '600' : '400'
              }}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: activeTab === 'plans' ? '2px solid #007bff' : '2px solid transparent',
                color: activeTab === 'plans' ? '#007bff' : '#666',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: activeTab === 'plans' ? '600' : '400'
              }}
            >
              Plans ({plans.length})
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: activeTab === 'payment' ? '2px solid #007bff' : '2px solid transparent',
                color: activeTab === 'payment' ? '#007bff' : '#666',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: activeTab === 'payment' ? '600' : '400'
              }}
            >
              💳 Payment Settings
            </button>
          </div>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, color: '#333' }}>Product Management</h2>
              <button
                onClick={() => {
                  resetProductForm();
                  setEditingProduct(null);
                  setShowProductForm(true);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                + Add Product
              </button>
            </div>

            {/* Product Form Modal */}
            {showProductForm && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000
              }}>
                <div style={{
                  backgroundColor: 'white',
                  padding: '2rem',
                  borderRadius: '8px',
                  width: '90%',
                  maxWidth: '600px',
                  maxHeight: '90vh',
                  overflow: 'auto'
                }}>
                  <h3 style={{ margin: '0 0 1.5rem 0', color: '#333' }}>
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <form onSubmit={handleProductSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                          Product Name (Japanese):
                        </label>
                        <input
                          type="text"
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                          Product Name (English):
                        </label>
                        <input
                          type="text"
                          value={productForm.name_en}
                          onChange={(e) => setProductForm({ ...productForm, name_en: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        Description:
                      </label>
                      <textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          minHeight: '80px',
                          boxSizing: 'border-box'
                        }}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                          Price (AUD):
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={productForm.price_aud}
                          onChange={(e) => setProductForm({ ...productForm, price_aud: parseFloat(e.target.value) || 0 })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                          Category:
                        </label>
                        <input
                          type="text"
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                          Stock Quantity:
                        </label>
                        <input
                          type="number"
                          value={productForm.stock_quantity}
                          onChange={(e) => setProductForm({ ...productForm, stock_quantity: parseInt(e.target.value) || 0 })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                          Image URL:
                        </label>
                        <input
                          type="url"
                          value={productForm.image_url}
                          onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                          Display Order:
                        </label>
                        <input
                          type="number"
                          value={productForm.display_order}
                          onChange={(e) => setProductForm({ ...productForm, display_order: parseInt(e.target.value) || 999 })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={productForm.is_active}
                          onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
                        />
                        Active
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={productForm.is_featured}
                          onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                        />
                        Featured
                      </label>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowProductForm(false);
                          setEditingProduct(null);
                          resetProductForm();
                        }}
                        style={{
                          padding: '0.75rem 1.5rem',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          padding: '0.75rem 1.5rem',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {editingProduct ? 'Update Product' : 'Create Product'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Products List */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
              {productsLoading ? (
                <p>Loading products...</p>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {products.map((product) => (
                    <div key={product.id} style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '1rem',
                      backgroundColor: product.is_active ? 'white' : '#f8f9fa'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <h3 style={{ margin: 0, color: '#333' }}>{product.name_en}</h3>
                            {product.is_featured && (
                              <span style={{
                                backgroundColor: '#007bff',
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem'
                              }}>
                                Featured
                              </span>
                            )}
                            {!product.is_active && (
                              <span style={{
                                backgroundColor: '#dc3545',
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem'
                              }}>
                                Inactive
                              </span>
                            )}
                          </div>
                          <p style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '0.875rem' }}>{product.description}</p>
                          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                            <span style={{ fontWeight: 'bold' }}>
                              {product.currency} ${product.price_aud.toLocaleString()}
                            </span>
                            <span style={{ color: '#666' }}>Category: {product.category}</span>
                            <span style={{ color: '#666' }}>Stock: {product.stock_quantity}</span>
                            <span style={{ color: '#666' }}>Order: {product.display_order}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                          <button
                            onClick={() => handleEditProduct(product)}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#ffc107',
                              color: '#212529',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, color: '#333' }}>Plan Management</h2>
              <button
                onClick={() => { resetPlanForm(); setEditingPlan(null); setShowPlanForm(true); }}
                style={{ padding: '0.75rem 1.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}
              >
                + Add Plan
              </button>
            </div>

            {/* Plan Form Modal */}
            {showPlanForm && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
                  <h3 style={{ margin: '0 0 1.5rem 0', color: '#333' }}>{editingPlan ? 'Edit Plan' : 'Add New Plan'}</h3>
                  <form onSubmit={handlePlanSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Plan Name (English):</label>
                        <input type="text" value={planFormData.name} onChange={e => setPlanFormData({ ...planFormData, name: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Plan Name (Japanese):</label>
                        <input type="text" value={planFormData.name_ja} onChange={e => setPlanFormData({ ...planFormData, name_ja: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Price (AUD $):</label>
                        <input type="number" step="0.01" value={planFormData.price_aud} onChange={e => setPlanFormData({ ...planFormData, price_aud: parseFloat(e.target.value) || 0 })}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Duration (months):</label>
                        <input type="number" value={planFormData.duration_months} onChange={e => setPlanFormData({ ...planFormData, duration_months: parseInt(e.target.value) || 1 })}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Display Order:</label>
                        <input type="number" value={planFormData.display_order} onChange={e => setPlanFormData({ ...planFormData, display_order: parseInt(e.target.value) || 999 })}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Description:</label>
                      <textarea value={planFormData.description} onChange={e => setPlanFormData({ ...planFormData, description: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Features (one per line):</label>
                      <textarea value={planFormData.features} onChange={e => setPlanFormData({ ...planFormData, features: e.target.value })}
                        placeholder="5-star hotel stay&#10;All meals included&#10;..."
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" checked={planFormData.is_active} onChange={e => setPlanFormData({ ...planFormData, is_active: e.target.checked })} />
                        Active
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" checked={planFormData.is_featured} onChange={e => setPlanFormData({ ...planFormData, is_featured: e.target.checked })} />
                        Featured
                      </label>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => { setShowPlanForm(false); setEditingPlan(null); resetPlanForm(); }}
                        style={{ padding: '0.75rem 1.5rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Cancel
                      </button>
                      <button type="submit" disabled={planSaving}
                        style={{ padding: '0.75rem 1.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {planSaving ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
              {plansLoading ? (
                <p>Loading plans...</p>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {plans.map((plan) => (
                    <div key={plan.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <h3 style={{ margin: 0, color: '#333' }}>{plan.name}</h3>
                            {plan.recommended && (
                              <span style={{ backgroundColor: '#007bff', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>Featured</span>
                            )}
                          </div>
                          <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>{plan.description}</p>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <span style={{ fontWeight: 'bold' }}>{plan.currency} ${plan.price.toLocaleString()}</span>
                            <span style={{ color: '#666' }}>{plan.duration}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                          <button onClick={() => handleEditPlan(plan)}
                            style={{ padding: '0.5rem 1rem', backgroundColor: '#ffc107', color: '#212529', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}>
                            Edit
                          </button>
                          <button onClick={() => handleDeletePlan(plan.id)}
                            style={{ padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Settings Tab */}
        {activeTab === 'payment' && (
          <div style={{ maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '0.5rem', color: '#333' }}>💳 Payment Settings</h2>
            <p style={{ margin: '0 0 1.5rem 0', color: '#666', fontSize: '0.9rem' }}>
              Stripe is used for card payments. Update your Stripe publishable key here.
            </p>

            {/* Stripe Settings */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '2px solid #635bff', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0, color: '#635bff' }}>Stripe — Card Payments</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                  Publishable Key (pk_live_... or pk_test_...):
                </label>
                <input
                  type="text"
                  value={paymentSettings.stripe_publishable_key}
                  onChange={e => setPaymentSettings({ ...paymentSettings, stripe_publishable_key: e.target.value })}
                  placeholder="pk_live_..."
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem', boxSizing: 'border-box', fontFamily: 'monospace' }}
                />
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>
                Get your key from the{' '}
                <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" style={{ color: '#635bff' }}>
                  Stripe Dashboard → Developers → API Keys
                </a>
              </p>
            </div>

            {/* Save Button */}
            <button
              onClick={() => {
                savePaymentSettings(paymentSettings);
                setPaymentSaved(true);
                setTimeout(() => setPaymentSaved(false), 3000);
              }}
              style={{
                padding: '0.75rem 2rem',
                background: '#635bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {paymentSaved ? '✓ Saved!' : 'Save Settings'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}