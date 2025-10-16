import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Crown, Shield, Mail } from 'lucide-react';

export default function EventAdminModal({ event, onClose, onUpdate }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEventAdmins();
  }, [event.id]);

  const fetchEventAdmins = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/admin/events/${event.id}/admins`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAdmins(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch event admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    
    try {
      setAdding(true);
      setError(null);
      
      console.log('Adding admin:', newAdminEmail.trim());
      
      const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/admin/events/${event.id}/admins`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminEmail: newAdminEmail.trim() })
      });
      
      const result = await response.json();
      console.log('Add admin response:', result);
      
      if (response.ok && result.success) {
        setNewAdminEmail('');
        fetchEventAdmins();
        onUpdate?.();
      } else {
        setError(result.error || 'Failed to add admin');
      }
    } catch (error) {
      console.error('Failed to add admin:', error);
      setError('Network error occurred');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveAdmin = async (adminId) => {
    if (!confirm('Remove this admin from the event?')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/admin/events/${event.id}/admins/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        fetchEventAdmins();
        onUpdate?.();
      }
    } catch (error) {
      console.error('Failed to remove admin:', error);
    }
  };

  const getRoleIcon = (role) => {
    return role === 'owner' ? <Crown size={16} style={{ color: 'rgb(245, 158, 11)' }} /> : <Shield size={16} style={{ color: 'rgb(59, 130, 246)' }} />;
  };

  const getRoleColor = (role) => {
    return role === 'owner' ? 'rgb(245, 158, 11)' : 'rgb(59, 130, 246)';
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgb(33, 33, 33)' }}>
          <h3 className="text-lg font-bold" style={{ color: 'white' }}>Event Admins</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgb(33, 33, 33)' }}>
            <X size={16} style={{ color: 'rgb(248, 248, 255)' }} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm mb-2" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>{event.name}</p>
            <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.5 }}>Manage up to 3 admins per event</p>
          </div>

          {/* Add Admin */}
          <div className="mb-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'rgb(248, 248, 255)', opacity: 0.5 }} />
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="Admin email"
                  className="w-full pl-10 pr-4 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'rgb(33, 33, 33)',
                    color: 'white',
                    border: '1px solid rgb(59, 130, 246, 0.3)'
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddAdmin()}
                />
              </div>
              <button
                onClick={handleAddAdmin}
                disabled={adding || !newAdminEmail.trim() || admins.length >= 3}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
                style={{ backgroundColor: 'rgb(34, 197, 94)', color: 'white' }}
              >
                {adding ? '...' : <Plus size={16} />}
              </button>
            </div>
            {admins.length >= 3 && (
              <p className="text-xs mt-1" style={{ color: 'rgb(239, 68, 68)' }}>Maximum 3 admins reached</p>
            )}
            {error && (
              <p className="text-xs mt-1" style={{ color: 'rgb(239, 68, 68)' }}>{error}</p>
            )}
          </div>

          {/* Admin List */}
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : admins.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>No admins found</p>
              </div>
            ) : (
              admins.map(admin => (
                <div key={admin.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgb(33, 33, 33)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: getRoleColor(admin.role) + '20' }}>
                      {getRoleIcon(admin.role)}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'white' }}>{admin.name}</p>
                      <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>{admin.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ 
                      backgroundColor: getRoleColor(admin.role) + '20', 
                      color: getRoleColor(admin.role) 
                    }}>
                      {admin.role}
                    </span>
                    {!admin.is_creator && (
                      <button
                        onClick={() => handleRemoveAdmin(admin.id)}
                        className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200"
                        style={{ backgroundColor: 'rgb(239, 68, 68, 0.2)' }}
                      >
                        <Trash2 size={12} style={{ color: 'rgb(239, 68, 68)' }} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}