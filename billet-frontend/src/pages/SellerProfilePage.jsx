import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Ticket, DollarSign, Edit3, LogOut, Shield, Award, X, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function SellerProfilePage() {
  const { user, logout, currentEvent } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch profile
      const profileResponse = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/seller/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (profileResponse.ok) {
        const profileResult = await profileResponse.json();
        if (profileResult.success) {
          setProfile(profileResult.data);
          setEditForm({
            name: profileResult.data?.name || user?.name || '',
            email: profileResult.data?.email || user?.email || ''
          });
        }
      }

      // Fetch stats
      const statsResponse = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/seller/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (statsResponse.ok) {
        const statsResult = await statsResponse.json();
        if (statsResult.success && statsResult.data) {
          setStats(statsResult.data.myStats);
        }
      }
      
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const displayName = profile?.name || user?.name || user?.email?.split('@')[0] || 'Seller';
  const totalSales = stats?.totals?.all || 0;
  const totalRevenue = stats?.revenue?.total || 0;
  const memberSince = profile?.created_at ? new Date(profile.created_at).getFullYear() : new Date().getFullYear();

  const handleEditProfile = () => {
    setEditForm({
      name: profile?.name || user?.name || '',
      email: profile?.email || user?.email || ''
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/seller/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setProfile(prev => ({ ...prev, ...editForm }));
          setShowEditModal(false);
        }
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'white' }}>My Profile</h1>
        <p style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Manage your account and view your performance</p>
      </div>

      {/* Profile Card */}
      <div className="px-6 mb-6">
        <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgb(34, 197, 94)' }}>
              <span className="text-2xl font-bold" style={{ color: 'white' }}>
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1" style={{ color: 'white' }}>{displayName}</h2>
              <p className="text-sm mb-1" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>
                {profile?.email || user?.email}
              </p>
              <div className="flex items-center gap-2">
                <Shield size={14} style={{ color: 'rgb(34, 197, 94)' }} />
                <span className="text-xs font-medium" style={{ color: 'rgb(34, 197, 94)' }}>Verified Seller</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold mb-1" style={{ color: 'white' }}>{totalSales}</p>
              <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Total Sales</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold mb-1" style={{ color: 'rgb(34, 197, 94)' }}>{totalRevenue}</p>
              <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>NSL Earned</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold mb-1" style={{ color: 'white' }}>{memberSince}</p>
              <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Member Since</p>
            </div>
          </div>

          {/* Achievement Badge */}
          {totalSales >= 10 && (
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg mb-4" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
              <Award size={16} style={{ color: 'rgb(34, 197, 94)' }} />
              <span className="text-sm font-medium" style={{ color: 'rgb(34, 197, 94)' }}>
                {totalSales >= 50 ? 'Top Seller' : totalSales >= 25 ? 'Star Seller' : 'Active Seller'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Current Event */}
      {currentEvent && (
        <div className="px-6 mb-6">
          <h3 className="text-lg font-bold mb-3" style={{ color: 'white' }}>Current Assignment</h3>
          <div className="rounded-xl p-4" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgb(59, 130, 246, 0.2)' }}>
                <Calendar size={20} style={{ color: 'rgb(59, 130, 246)' }} />
              </div>
              <div>
                <p className="font-bold" style={{ color: 'white' }}>{currentEvent.name}</p>
                <p className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>
                  {new Date(currentEvent.event_date || currentEvent.date).toLocaleDateString()} • {currentEvent.location}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                <p className="text-lg font-bold" style={{ color: 'white' }}>{profile?.quota || 100}</p>
                <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Ticket Quota</p>
              </div>
              <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                <p className="text-lg font-bold" style={{ color: 'white' }}>{profile?.tickets_sold || totalSales}</p>
                <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Tickets Sold</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Details */}
      <div className="px-6 mb-6">
        <h3 className="text-lg font-bold mb-3" style={{ color: 'white' }}>Account Details</h3>
        <div className="space-y-3">
          <div className="rounded-lg p-4 flex items-center gap-3" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
            <User size={20} style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }} />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'white' }}>Full Name</p>
              <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>{displayName}</p>
            </div>
          </div>
          
          <div className="rounded-lg p-4 flex items-center gap-3" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
            <Mail size={20} style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }} />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'white' }}>Email Address</p>
              <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>{profile?.email || user?.email}</p>
            </div>
          </div>
          
          <div className="rounded-lg p-4 flex items-center gap-3" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
            <Calendar size={20} style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }} />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'white' }}>Member Since</p>
              <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { 
                  month: 'long', year: 'numeric' 
                }) : 'Recently joined'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="px-6 mb-6">
        <h3 className="text-lg font-bold mb-3" style={{ color: 'white' }}>Performance Summary</h3>
        <div className="rounded-xl p-4" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: 'rgb(34, 197, 94, 0.2)' }}>
                <Ticket size={20} style={{ color: 'rgb(34, 197, 94)' }} />
              </div>
              <p className="text-lg font-bold" style={{ color: 'white' }}>{stats?.totals?.valid || 0}</p>
              <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Valid Tickets</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: 'rgb(59, 130, 246, 0.2)' }}>
                <DollarSign size={20} style={{ color: 'rgb(59, 130, 246)' }} />
              </div>
              <p className="text-lg font-bold" style={{ color: 'white' }}>
                {stats?.revenue?.average ? stats.revenue.average.toFixed(0) : '0'}
              </p>
              <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Avg. NSL/Ticket</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6">
        <div className="space-y-3">
          <button 
            onClick={handleEditProfile}
            className="w-full rounded-lg p-4 flex items-center gap-3 transition-all duration-200 hover:bg-opacity-80 active:scale-98" 
            style={{ backgroundColor: 'rgb(59, 130, 246, 0.1)' }}
          >
            <Edit3 size={20} style={{ color: 'rgb(59, 130, 246)' }} />
            <span className="text-sm font-medium" style={{ color: 'rgb(59, 130, 246)' }}>Edit Profile</span>
          </button>
          
          <button 
            onClick={logout}
            className="w-full rounded-lg p-4 flex items-center gap-3 transition-all duration-200 active:scale-98" 
            style={{ backgroundColor: 'rgb(239, 68, 68, 0.1)' }}
          >
            <LogOut size={20} style={{ color: 'rgb(239, 68, 68)' }} />
            <span className="text-sm font-medium" style={{ color: 'rgb(239, 68, 68)' }}>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-2xl p-6" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: 'white' }}>Edit Profile</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-lg transition-colors" 
                style={{ backgroundColor: 'rgba(248, 248, 255, 0.1)' }}
              >
                <X size={20} style={{ color: 'rgb(248, 248, 255)' }} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'white' }}>Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 outline-none"
                  style={{ backgroundColor: 'rgb(12, 12, 12)', color: 'white' }}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'white' }}>Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 outline-none"
                  style={{ backgroundColor: 'rgb(12, 12, 12)', color: 'white' }}
                  placeholder="Enter your email address"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 p-3 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: 'rgba(248, 248, 255, 0.1)', color: 'rgb(248, 248, 255)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 p-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'rgb(34, 197, 94)', color: 'white' }}
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}