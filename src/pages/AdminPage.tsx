import { useState, useEffect } from 'react';
import { usePlans } from '@/hooks/usePlans';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('yuna@metisbel.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const { plans, loading } = usePlans();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'yuna@metisbel.com' && password === 'admin123') {
      localStorage.setItem('admin_token', 'simple_token');
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '400px'
        }}>
          <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333' }}>
            Admin Login
          </h1>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Email:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Password:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                required
              />
            </div>
            {error && (
              <div style={{ 
                color: 'red', 
                marginBottom: '1rem', 
                padding: '0.5rem',
                backgroundColor: '#fee',
                borderRadius: '4px'
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif' }}>
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #ddd',
        padding: '1rem 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, color: '#333' }}>Admin Dashboard</h1>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Total Plans</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#007bff' }}>{plans.length}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Featured Plans</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#28a745' }}>
              {plans.filter(plan => plan.recommended).length}
            </p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Price Range</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#ffc107' }}>
              {plans.length > 0 && (
                `$${Math.min(...plans.map(p => p.price))} - $${Math.max(...plans.map(p => p.price))}`
              )}
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1rem 0', color: '#333' }}>Current Plans</h2>
          {loading ? (
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

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          border: '1px solid #bbdefb'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#1976d2' }}>Note:</h3>
          <p style={{ margin: 0, color: '#1565c0' }}>
            This is a simplified admin dashboard. The plans are loaded from the database and displayed here.
            Full CRUD operations can be implemented with the Edge Functions that are already deployed.
          </p>
        </div>
      </main>
    </div>
  );
}