import { useState, useEffect } from 'react';
import { useProducts, type ProductFormData } from '@/hooks/useProducts';
import { usePlans } from '@/hooks/usePlans';
import { getPaymentSettings, savePaymentSettings, type PaymentSettings } from '@/hooks/usePaymentSettings';

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
  
  const { products, loading: productsLoading, fetchProducts, createProduct, updateProduct, deleteProduct } = useProducts();
  const { plans, loading: plansLoading } = usePlans();

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
            <h2 style={{ margin: '0 0 2rem 0', color: '#333' }}>Plan Management</h2>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
              {plansLoading ? (
                <p>Loading plans...</p>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {plans.map((plan) => (
                    <div key={plan.id} style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '1rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <h3 style={{ margin: 0, color: '#333' }}>{plan.name}</h3>
                            {plan.recommended && (
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
                          </div>
                          <p style={{ margin: '0 0 1rem 0', color: '#666' }}>{plan.description}</p>
                          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 'bold' }}>
                              {plan.currency} ${plan.price.toLocaleString()}
                            </span>
                            <span style={{ color: '#666' }}>{plan.duration}</span>
                          </div>
                          <div>
                            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Features:</p>
                            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#666' }}>
                              {plan.features.map((feature, index) => (
                                <li key={index}>{feature}</li>
                              ))}
                            </ul>
                          </div>
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
            <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>💳 Payment Settings</h2>

            {/* Active Provider */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>Active Payment Provider</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {(['paypal', 'sumup'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPaymentSettings({ ...paymentSettings, active_provider: p })}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: '2px solid',
                      borderColor: paymentSettings.active_provider === p ? '#007bff' : '#ddd',
                      borderRadius: '8px',
                      background: paymentSettings.active_provider === p ? '#007bff' : 'white',
                      color: paymentSettings.active_provider === p ? 'white' : '#333',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.95rem',
                    }}
                  >
                    {p === 'paypal' ? '🅿️ PayPal' : '💳 SumUp'}
                  </button>
                ))}
              </div>
            </div>

            {/* PayPal Settings */}
            <div style={{ marginBottom: '1.5rem', padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', opacity: paymentSettings.active_provider === 'paypal' ? 1 : 0.6 }}>
              <h3 style={{ marginTop: 0, color: '#333' }}>🅿️ PayPal</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Client ID</label>
                <input
                  type="text"
                  value={paymentSettings.paypal_client_id}
                  onChange={e => setPaymentSettings({ ...paymentSettings, paypal_client_id: e.target.value })}
                  placeholder="AXxx..."
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                PayPal Developer Console → My Apps → Client ID
              </p>
            </div>

            {/* SumUp Settings */}
            <div style={{ marginBottom: '1.5rem', padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', opacity: paymentSettings.active_provider === 'sumup' ? 1 : 0.6 }}>
              <h3 style={{ marginTop: 0, color: '#333' }}>💳 SumUp</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Merchant Code</label>
                <input
                  type="text"
                  value={paymentSettings.sumup_merchant_code}
                  onChange={e => setPaymentSettings({ ...paymentSettings, sumup_merchant_code: e.target.value })}
                  placeholder="MXXXXXXXX"
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ padding: '1rem', background: '#fff3cd', borderRadius: '6px', fontSize: '0.85rem', color: '#856404' }}>
                <strong>API Key の設定が必要です（1回のみ）:</strong>
                <ol style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem' }}>
                  <li>SumUp Dashboard → Integrations → API Keys → Generate key</li>
                  <li>Supabase Dashboard → Edge Functions → Secrets に以下を追加:</li>
                  <li style={{ listStyle: 'none', fontFamily: 'monospace', background: '#fff', padding: '0.3rem 0.5rem', borderRadius: '3px', margin: '0.25rem 0' }}>
                    {'SUMUP_API_KEY = <生成したAPIキー>'}
                  </li>
                  <li>Merchant Code は上のフィールドで設定済み</li>
                </ol>
              </div>
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
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {paymentSaved ? '✓ 保存しました' : '設定を保存する'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}