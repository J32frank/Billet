import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Ticket, DollarSign, Calendar, Edit3, Save, X, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';

export default function SellerDetailPage({ seller, onBack, onUpdate }) {
  const [sellerData, setSellerData] = useState(seller);
  const [tickets, setTickets] = useState([]);
  const [ticketStats, setTicketStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  const [editForm, setEditForm] = useState({
    name: seller?.name || '',
    email: seller?.email || '',
    quota: seller?.quota || 0
  });

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
        <div className="text-center">
          <p className="text-white">Seller not found</p>
          <button onClick={onBack} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Go Back</button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (seller?.id) {
      fetchSellerTickets();
    }
  }, [seller?.id]);

  const fetchSellerTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/admin/sellers/${seller.id}/tickets`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTickets(result.data || []);
          setTicketStats(result.stats || {
            totalTickets: 0,
            validTickets: 0,
            usedTickets: 0,
            revokedTickets: 0,
            totalRevenue: 0,
            averagePrice: 0
          });
          // Update seller data with real ticket count
          setSellerData(prev => ({
            ...prev,
            tickets_sold: result.stats?.totalTickets || 0,
            quotaRemaining: Math.max(0, (prev?.quota || 0) - (result.stats?.totalTickets || 0)),
            quotaPercentage: (prev?.quota || 0) > 0 ? ((result.stats?.totalTickets || 0) / (prev?.quota || 0)) * 100 : 0,
            totalRevenue: result.stats?.totalRevenue || 0
          }));
        } else {
          setError(result.error || 'Failed to load tickets');
        }
      } else {
        setError('Failed to fetch seller data');
      }
    } catch (error) {
      console.error('Failed to fetch seller tickets:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/admin/sellers/${seller.id}`, {
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
          setSellerData(result.data);
          setEditing(false);
          onUpdate(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to update seller:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setLoading(true);
      const endpoint = sellerData.is_active ? 'revoke' : 'restore';
      const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/admin/sellers/${seller.id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSellerData(result.data);
          onUpdate(result.data);
          fetchSellerTickets(); // Refresh tickets
        }
      }
    } catch (error) {
      console.error('Failed to toggle seller status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeTicket = async (ticketId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/admin/tickets/${ticketId}/revoke`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        fetchSellerTickets(); // Refresh tickets
      }
    } catch (error) {
      console.error('Failed to revoke ticket:', error);
    }
  };

  const handleRestoreTicket = async (ticketId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/admin/tickets/${ticketId}/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        fetchSellerTickets(); // Refresh tickets
      }
    } catch (error) {
      console.error('Failed to restore ticket:', error);
    }
  };

  const handleDeleteSeller = async () => {
    if (!confirm('Are you sure you want to delete this seller? This action cannot be undone.')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/admin/sellers/${seller.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        onBack(); // Go back to main page
      }
    } catch (error) {
      console.error('Failed to delete seller:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!sellerData.is_active) return 'rgb(239, 68, 68)';
    if (sellerData.quotaPercentage >= 100) return 'rgb(245, 158, 11)';
    return 'rgb(34, 197, 94)';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
        <div className="text-center p-6">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={onBack} className="px-4 py-2 bg-blue-600 text-white rounded">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgb(33, 33, 33)' }}>
        <button onClick={onBack} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
          <ArrowLeft size={20} style={{ color: 'white' }} />
        </button>
        <h1 className="text-xl font-bold" style={{ color: 'white' }}>Seller Details</h1>
        <button
          onClick={() => setEditing(!editing)}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: editing ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)' }}
        >
          {editing ? <X size={20} style={{ color: 'white' }} /> : <Edit3 size={20} style={{ color: 'white' }} />}
        </button>
      </div>

      {/* Seller Info */}
      <div className="p-6">
        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: getStatusColor() + '20' }}>
              <User size={32} style={{ color: getStatusColor() }} />
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full p-2 rounded-lg bg-gray-700 text-white"
                    placeholder="Name"
                  />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full p-2 rounded-lg bg-gray-700 text-white"
                    placeholder="Email"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold" style={{ color: 'white' }}>{sellerData.name}</h2>
                  <p style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>{sellerData.email}</p>
                </>
              )}
            </div>
            <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ 
              backgroundColor: getStatusColor() + '20', 
              color: getStatusColor() 
            }}>
              {sellerData.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'white' }}>{sellerData.tickets_sold || 0}</p>
              <p className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Sold</p>
            </div>
            <div className="text-center">
              {editing ? (
                <input
                  type="number"
                  value={editForm.quota}
                  onChange={(e) => setEditForm({...editForm, quota: Number(e.target.value)})}
                  className="w-16 text-center bg-gray-700 text-white text-xl font-bold rounded"
                  min="0"
                />
              ) : (
                <p className="text-2xl font-bold" style={{ color: 'white' }}>{sellerData.quota}</p>
              )}
              <p className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Quota</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'rgb(34, 197, 94)' }}>{sellerData.quotaRemaining || 0}</p>
              <p className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Remaining</p>
            </div>
          </div>

          {/* Revenue & Additional Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'rgb(59, 130, 246, 0.1)' }}>
              <p className="text-xl font-bold" style={{ color: 'rgb(59, 130, 246)' }}>
                {(sellerData.totalRevenue || ticketStats?.totalRevenue || 0).toLocaleString()} NSL
              </p>
              <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Total Revenue</p>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'rgb(34, 197, 94, 0.1)' }}>
              <p className="text-xl font-bold" style={{ color: 'rgb(34, 197, 94)' }}>
                {ticketStats?.averagePrice?.toFixed(0) || 0} NSL
              </p>
              <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Avg. Price</p>
            </div>
          </div>

          {/* Ticket Status Breakdown */}
          {ticketStats && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 rounded" style={{ backgroundColor: 'rgb(34, 197, 94, 0.1)' }}>
                <p className="font-bold" style={{ color: 'rgb(34, 197, 94)' }}>{ticketStats.validTickets}</p>
                <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Valid</p>
              </div>
              <div className="text-center p-2 rounded" style={{ backgroundColor: 'rgb(59, 130, 246, 0.1)' }}>
                <p className="font-bold" style={{ color: 'rgb(59, 130, 246)' }}>{ticketStats.usedTickets}</p>
                <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Used</p>
              </div>
              <div className="text-center p-2 rounded" style={{ backgroundColor: 'rgb(239, 68, 68, 0.1)' }}>
                <p className="font-bold" style={{ color: 'rgb(239, 68, 68)' }}>{ticketStats.revokedTickets}</p>
                <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Revoked</p>
              </div>
            </div>
          )}

          {/* Account Details */}
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgb(33, 33, 33)' }}>
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <p style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Created</p>
                <p style={{ color: 'white' }}>{new Date(sellerData.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Event</p>
                <p style={{ color: 'white' }}>{sellerData.events?.name || 'No Event'}</p>
              </div>
            </div>
            <div>
              <p style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Created by Admin</p>
              <p style={{ color: 'rgb(59, 130, 246)' }}>
                {sellerData.createdByAdmin?.name || 'Unknown Admin'}
              </p>
              {sellerData.createdByAdmin?.email && (
                <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.5 }}>
                  {sellerData.createdByAdmin.email}
                </p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
            <div 
              className="h-3 rounded-full transition-all duration-300" 
              style={{ 
                backgroundColor: (sellerData.quotaPercentage || 0) >= 100 ? 'rgb(239, 68, 68)' : (sellerData.quotaPercentage || 0) >= 80 ? 'rgb(245, 158, 11)' : 'rgb(34, 197, 94)', 
                width: `${Math.min(100, sellerData.quotaPercentage || 0)}%` 
              }}
            />
          </div>
          <p className="text-center text-xs mb-4" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>
            {(sellerData.quotaPercentage || 0).toFixed(1)}% of quota used
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {editing ? (
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-3 rounded-lg font-medium transition-all duration-200"
                style={{ backgroundColor: 'rgb(34, 197, 94)', color: 'white' }}
              >
                <Save size={16} className="inline mr-2" />
                Save Changes
              </button>
            ) : (
              <>
                <button
                  onClick={handleToggleStatus}
                  disabled={loading}
                  className="flex-1 py-3 rounded-lg font-medium transition-all duration-200"
                  style={{ 
                    backgroundColor: sellerData.is_active ? 'rgb(239, 68, 68)' : 'rgb(34, 197, 94)', 
                    color: 'white' 
                  }}
                >
                  {sellerData.is_active ? (
                    <>
                      <AlertTriangle size={16} className="inline mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <RotateCcw size={16} className="inline mr-2" />
                      Activate
                    </>
                  )}
                </button>
                <button
                  onClick={handleDeleteSeller}
                  disabled={loading}
                  className="px-4 py-3 rounded-lg font-medium transition-all duration-200"
                  style={{ backgroundColor: 'rgb(127, 29, 29)', color: 'white' }}
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tickets Section */}
        <div className="pb-8">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'white' }}>Seller Tickets ({tickets.length})</h3>
          
          {tickets.length === 0 ? (
            <div className="text-center py-8 rounded-xl" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
              <Ticket size={48} style={{ color: 'rgb(248, 248, 255)', opacity: 0.3 }} className="mx-auto mb-4" />
              <p style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>No tickets generated yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map(ticket => (
                <div key={ticket.id} className="rounded-lg p-4" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold" style={{ color: 'white' }}>{ticket.ticket_number}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm px-2 py-1 rounded-full" style={{ 
                        backgroundColor: ticket.status === 'valid' ? 'rgb(34, 197, 94, 0.2)' : ticket.status === 'used' ? 'rgb(59, 130, 246, 0.2)' : 'rgb(239, 68, 68, 0.2)',
                        color: ticket.status === 'valid' ? 'rgb(34, 197, 94)' : ticket.status === 'used' ? 'rgb(59, 130, 246)' : 'rgb(239, 68, 68)'
                      }}>
                        {ticket.status.toUpperCase()}
                      </span>
                      {ticket.status === 'valid' && (
                        <button
                          onClick={() => handleRevokeTicket(ticket.id)}
                          className="px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: 'rgb(239, 68, 68)', color: 'white' }}
                        >
                          Revoke
                        </button>
                      )}
                      {ticket.status === 'revoked' && (
                        <button
                          onClick={() => handleRestoreTicket(ticket.id)}
                          className="px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: 'rgb(34, 197, 94)', color: 'white' }}
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm" style={{ color: 'white' }}>{ticket.buyer_name}</p>
                      <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>
                        {new Date(ticket.generated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-bold" style={{ color: 'rgb(34, 197, 94)' }}>{ticket.ticket_price} NSL</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}