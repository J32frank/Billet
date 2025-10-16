import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Shield, Edit3, Save, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    if (user) {
      setAdminData({
        id: user.userId,
        name: user.name || user.email,
        email: user.email,
        role: user.role,
        created_at: user.created_at || new Date().toISOString()
      });
      setEditForm({
        name: user.name || user.email,
        email: user.email
      });
      fetchAdminStats();
    }
  }, [user]);

  const fetchAdminStats = async () => {
    try {
      // Fetch admin-specific statistics
      const [dashboardRes, sellersRes, eventsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/admin/dashboard`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/admin/sellers`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/admin/events`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const [dashboard, sellers, events] = await Promise.all([
        dashboardRes.json(),
        sellersRes.json(), 
        eventsRes.json()
      ]);

      if (dashboard.success) {
        setAdminStats({
          totalRevenue: dashboard.data.revenue?.total || 0,
          totalTickets: dashboard.data.tickets?.total || 0,
          activeSellers: dashboard.data.overview?.activeSellers || 0,
          totalSellers: dashboard.data.overview?.totalSellers || 0,
          activeEvents: dashboard.data.overview?.activeEvents || 0,
          totalEvents: dashboard.data.overview?.totalEvents || 0,
          sellersCreated: sellers.success ? sellers.data.filter(s => s.created_by === user.userId).length : 0,
          eventsCreated: events.success ? events.data.filter(e => e.created_by === user.userId).length : 0
        });
      }

      // Mock recent activity (in real app, fetch from backend)
      setRecentActivity([
        { type: 'seller_created', description: 'Created seller account', time: '2 hours ago' },
        { type: 'event_created', description: 'Created new event', time: '1 day ago' },
        { type: 'ticket_scanned', description: 'Scanned 15 tickets', time: '2 days ago' },
        { type: 'seller_updated', description: 'Updated seller quota', time: '3 days ago' }
      ]);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // In a real app, you'd update the user profile here
      setAdminData(prev => ({
        ...prev,
        name: editForm.name,
        email: editForm.email
      }));
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgb(33, 33, 33)' }}>
        <h1 className="text-xl font-bold" style={{ color: 'white' }}>Admin Profile</h1>
        <button
          onClick={() => setEditing(!editing)}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: editing ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)' }}
        >
          {editing ? <X size={20} style={{ color: 'white' }} /> : <Edit3 size={20} style={{ color: 'white' }} />}
        </button>
      </div>

      <div className="p-6">
        {/* Profile Card */}
        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgb(59, 130, 246, 0.2)' }}>
              <User size={40} style={{ color: 'rgb(59, 130, 246)' }} />
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full p-3 rounded-lg text-lg font-bold"
                    style={{ backgroundColor: 'rgb(33, 33, 33)', color: 'white', border: '1px solid rgb(59, 130, 246, 0.3)' }}
                    placeholder="Full Name"
                  />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full p-3 rounded-lg"
                    style={{ backgroundColor: 'rgb(33, 33, 33)', color: 'white', border: '1px solid rgb(59, 130, 246, 0.3)' }}
                    placeholder="Email Address"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-1" style={{ color: 'white' }}>{adminData?.name}</h2>
                  <p className="flex items-center gap-2" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>
                    <Mail size={16} />
                    {adminData?.email}
                  </p>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgb(34, 197, 94, 0.2)' }}>
              <Shield size={16} style={{ color: 'rgb(34, 197, 94)' }} />
              <span className="text-sm font-medium" style={{ color: 'rgb(34, 197, 94)' }}>
                {adminData?.role?.toUpperCase()}
              </span>
            </div>
          </div>

          {editing && (
            <button
              onClick={handleSave}
              className="w-full py-3 rounded-lg font-medium transition-all duration-200"
              style={{ backgroundColor: 'rgb(34, 197, 94)', color: 'white' }}
            >
              <Save size={16} className="inline mr-2" />
              Save Changes
            </button>
          )}
        </div>

        {/* Admin Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
            <p className="text-2xl font-bold" style={{ color: 'rgb(34, 197, 94)' }}>
              {adminStats?.totalRevenue?.toLocaleString() || 0} NSL
            </p>
            <p className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Total Revenue</p>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
            <p className="text-2xl font-bold" style={{ color: 'rgb(59, 130, 246)' }}>
              {adminStats?.totalTickets || 0}
            </p>
            <p className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Total Tickets</p>
          </div>
        </div>

        {/* Management Stats */}
        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'white' }}>Management Overview</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'rgb(33, 33, 33)' }}>
              <p className="text-xl font-bold" style={{ color: 'white' }}>{adminStats?.sellersCreated || 0}</p>
              <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Sellers Created</p>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'rgb(33, 33, 33)' }}>
              <p className="text-xl font-bold" style={{ color: 'white' }}>{adminStats?.eventsCreated || 0}</p>
              <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Events Created</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'rgb(168, 85, 247, 0.1)' }}>
              <p className="text-lg font-bold" style={{ color: 'rgb(168, 85, 247)' }}>
                {adminStats?.activeSellers || 0}/{adminStats?.totalSellers || 0}
              </p>
              <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Active Sellers</p>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'rgb(245, 158, 11, 0.1)' }}>
              <p className="text-lg font-bold" style={{ color: 'rgb(245, 158, 11)' }}>
                {adminStats?.activeEvents || 0}/{adminStats?.totalEvents || 0}
              </p>
              <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Active Events</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'white' }}>Recent Activity</h3>
          
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'rgb(33, 33, 33)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ 
                  backgroundColor: activity.type.includes('created') ? 'rgb(34, 197, 94, 0.2)' : 'rgb(59, 130, 246, 0.2)' 
                }}>
                  <div className="w-2 h-2 rounded-full" style={{ 
                    backgroundColor: activity.type.includes('created') ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)' 
                  }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'white' }}>{activity.description}</p>
                  <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Info */}
        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'white' }}>Account Information</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'rgb(33, 33, 33)' }}>
              <div className="flex items-center gap-3">
                <Calendar size={20} style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'white' }}>Account Created</p>
                  <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>Member since</p>
                </div>
              </div>
              <p className="text-sm" style={{ color: 'rgb(248, 248, 255)' }}>
                {new Date(adminData?.created_at).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>

            <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'rgb(33, 33, 33)' }}>
              <div className="flex items-center gap-3">
                <User size={20} style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'white' }}>User ID</p>
                  <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>Unique identifier</p>
                </div>
              </div>
              <p className="text-xs font-mono" style={{ color: 'rgb(248, 248, 255)', opacity: 0.8 }}>
                {adminData?.id?.slice(0, 8)}...
              </p>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Shield size={20} style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'white' }}>Account Type</p>
                  <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>Administrator privileges</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgb(34, 197, 94, 0.2)' }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(34, 197, 94)' }} />
                <span className="text-xs font-medium" style={{ color: 'rgb(34, 197, 94)' }}>ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-xl font-medium transition-all duration-200 active:scale-98 flex items-center justify-center gap-3"
            style={{ backgroundColor: 'rgb(239, 68, 68)', color: 'white' }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
      
      <style>{`
        /* Hide horizontal scrollbar */
        body {
          overflow-x: hidden;
        }
        
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}