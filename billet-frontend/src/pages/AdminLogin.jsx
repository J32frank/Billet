import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user } = useAuth();

  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password, 'admin');
    
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: '#0C0C0C' }}>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Admin Login
          </h2>
          <div className="w-12 h-1 mx-auto" style={{ backgroundColor: '#212A37' }}></div>
        </div>
        
        <div className="rounded-lg p-6 space-y-5" style={{ backgroundColor: '#222428' }}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  backgroundColor: '#0C0C0C',
                  borderColor: '#212A37',
                  focusRingColor: '#212A37'
                }}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg border text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  backgroundColor: '#0C0C0C',
                  borderColor: '#212A37',
                  focusRingColor: '#212A37'
                }}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#212A37',
                ':hover': { backgroundColor: '#2a3441' }
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2a3441'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#212A37'}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}