import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Ticket, DollarSign, Calendar, Eye, EyeOff, Search, Filter, MoreVertical, CheckCircle, XCircle, AlertCircle, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SellerDetailPage from './SellerDetailPage';
import LoadingSpinner from '../components/LoadingSpinner';

const StatCard = ({ icon: Icon, label, value, subtext, color, trend }) => (
  <div className="rounded-xl p-4" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
    <div className="flex items-center justify-between mb-3">
      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
        <Icon size={20} style={{ color }} />
      </div>
      {trend && (
        <div className="flex items-center gap-1">
          <TrendingUp size={14} style={{ color: trend > 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)' }} />
          <span className="text-xs font-medium" style={{ color: trend > 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)' }}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        </div>
      )}
    </div>
    <p className="text-sm mb-1" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>{label}</p>
    <p className="text-2xl font-bold" style={{ color: 'white' }}>{value}</p>
    {subtext && <p className="text-xs mt-1" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>{subtext}</p>}
  </div>
);

const SellerRow = ({ seller, onToggleStatus, onUpdateQuota, onSellerClick }) => {
  const [showActions, setShowActions] = useState(false);
  const [editingQuota, setEditingQuota] = useState(false);
  const [newQuota, setNewQuota] = useState(seller.quota);

  const getStatusColor = () => {
    if (!seller.is_active) return 'rgb(239, 68, 68)';
    if (seller.quotaPercentage >= 100) return 'rgb(245, 158, 11)';
    return 'rgb(34, 197, 94)';
  };

  const handleQuotaUpdate = async () => {
    if (newQuota !== seller.quota) {
      await onUpdateQuota(seller.id, newQuota);
    }
    setEditingQuota(false);
  };

  return (
    <button 
      onClick={() => onSellerClick(seller)}
      className="w-full rounded-lg p-4 mb-3 text-left transition-all duration-200 active:scale-98" 
      style={{ backgroundColor: 'rgb(33, 42, 55)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: getStatusColor() + '20' }}>
            <span className="text-xs font-bold" style={{ color: getStatusColor() }}>
              {seller.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium" style={{ color: 'white' }}>{seller.name}</p>
            <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>{seller.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ 
            backgroundColor: getStatusColor() + '20', 
            color: getStatusColor() 
          }}>
            {seller.is_active ? 'Active' : 'Inactive'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
            style={{ backgroundColor: 'rgb(33, 33, 33)' }}
          >
            <MoreVertical size={16} style={{ color: 'rgb(248, 248, 255)' }} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: 'white' }}>{seller.tickets_sold || 0}</p>
          <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Sold</p>
        </div>
        <div className="text-center">
          {editingQuota ? (
            <input
              type="number"
              value={newQuota}
              onChange={(e) => setNewQuota(Number(e.target.value))}
              onBlur={handleQuotaUpdate}
              onKeyPress={(e) => e.key === 'Enter' && handleQuotaUpdate()}
              className="w-16 text-center bg-transparent border-b border-blue-500 text-white text-lg font-bold"
              min="0"
              autoFocus
            />
          ) : (
            <p 
              className="text-lg font-bold cursor-pointer hover:text-blue-400" 
              style={{ color: 'white' }}
              onClick={(e) => {
                e.stopPropagation();
                setEditingQuota(true);
              }}
            >
              {seller.quota}
            </p>
          )}
          <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Quota</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: 'rgb(34, 197, 94)' }}>{seller.quotaRemaining}</p>
          <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Remaining</p>
        </div>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
        <div 
          className="h-2 rounded-full transition-all duration-300" 
          style={{ 
            backgroundColor: seller.quotaPercentage >= 100 ? 'rgb(239, 68, 68)' : seller.quotaPercentage >= 80 ? 'rgb(245, 158, 11)' : 'rgb(34, 197, 94)', 
            width: `${Math.min(100, seller.quotaPercentage)}%` 
          }}
        />
      </div>

      {showActions && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(seller.id, !seller.is_active);
            }}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95"
            style={{ 
              backgroundColor: seller.is_active ? 'rgb(239, 68, 68)' : 'rgb(34, 197, 94)', 
              color: 'white' 
            }}
          >
            {seller.is_active ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingQuota(true);
            }}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95"
            style={{ backgroundColor: 'rgb(59, 130, 246)', color: 'white' }}
          >
            Edit Quota
          </button>
        </div>
      )}
    </button>
  );
};

const TicketRow = ({ ticket, onClick }) => {
  const getStatusIcon = () => {
    switch (ticket.status) {
      case 'valid': return <CheckCircle size={16} style={{ color: 'rgb(34, 197, 94)' }} />;
      case 'used': return <CheckCircle size={16} style={{ color: 'rgb(59, 130, 246)' }} />;
      case 'revoked': return <XCircle size={16} style={{ color: 'rgb(239, 68, 68)' }} />;
      default: return <AlertCircle size={16} style={{ color: 'rgb(245, 158, 11)' }} />;
    }
  };

  const getStatusColor = () => {
    switch (ticket.status) {
      case 'valid': return 'rgb(34, 197, 94)';
      case 'used': return 'rgb(59, 130, 246)';
      case 'revoked': return 'rgb(239, 68, 68)';
      default: return 'rgb(245, 158, 11)';
    }
  };

  return (
    <button
      onClick={() => onClick(ticket)}
      className="w-full rounded-lg p-4 mb-3 transition-all duration-200 active:scale-98 text-left"
      style={{ backgroundColor: 'rgb(33, 42, 55)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-mono text-sm font-bold" style={{ color: 'white' }}>
            {ticket.ticket_number}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ 
            backgroundColor: getStatusColor() + '20', 
            color: getStatusColor() 
          }}>
            {ticket.status.toUpperCase()}
          </span>
          <span className="text-sm font-bold" style={{ color: 'rgb(34, 197, 94)' }}>
            {ticket.ticket_price} NSL
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-1">
        <p className="text-sm" style={{ color: 'rgb(248, 248, 255)' }}>{ticket.buyer_name}</p>
        <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>
          Seller: {ticket.sellers?.name} • {new Date(ticket.generated_at).toLocaleDateString()}
        </p>
      </div>
    </button>
  );
};

const TicketDetailModal = ({ ticket, onClose }) => {
  if (!ticket) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgb(33, 33, 33)' }}>
          <h3 className="text-lg font-bold" style={{ color: 'white' }}>Ticket Details</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgb(33, 33, 33)' }}>
            <X size={16} style={{ color: 'rgb(248, 248, 255)' }} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="text-center">
            <p className="font-mono text-xl font-bold mb-2" style={{ color: 'white' }}>{ticket.ticket_number}</p>
            <div className="inline-flex px-3 py-1 rounded-full text-sm font-medium" style={{ 
              backgroundColor: ticket.status === 'valid' ? 'rgb(34, 197, 94, 0.2)' : 'rgb(59, 130, 246, 0.2)',
              color: ticket.status === 'valid' ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)'
            }}>
              {ticket.status.toUpperCase()}
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium" style={{ color: 'white' }}>{ticket.buyer_name}</p>
              <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>Buyer</p>
            </div>
            
            <div>
              <p className="text-sm font-medium" style={{ color: 'white' }}>{ticket.sellers?.name}</p>
              <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>Seller</p>
            </div>
            
            <div>
              <p className="text-sm font-medium" style={{ color: 'rgb(34, 197, 94)' }}>{ticket.ticket_price} NSL</p>
              <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>Price</p>
            </div>
            
            <div>
              <p className="text-sm font-medium" style={{ color: 'white' }}>
                {new Date(ticket.generated_at).toLocaleDateString('en-US', { 
                  month: 'short', day: 'numeric', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </p>
              <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>Generated</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminStatsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (statsResponse.ok) {
        const statsResult = await statsResponse.json();
        if (statsResult.success) {
          setStats(statsResult.data);
        }
      }

      // Fetch sellers
      const sellersResponse = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/admin/sellers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (sellersResponse.ok) {
        const sellersResult = await sellersResponse.json();
        if (sellersResult.success) {
          setSellers(sellersResult.data);
        }
      }

      // Fetch all tickets
      const ticketsResponse = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/admin/all-tickets?limit=50`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (ticketsResponse.ok) {
        const ticketsResult = await ticketsResponse.json();
        if (ticketsResult.success) {
          setTickets(ticketsResult.data);
        }
      }
      
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSellerStatus = async (sellerId, newStatus) => {
    try {
      const endpoint = newStatus ? 'restore' : 'revoke';
      const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/admin/sellers/${sellerId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to toggle seller status:', error);
    }
  };

  const handleUpdateQuota = async (sellerId, newQuota) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/admin/sellers/${sellerId}/quota`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quota: newQuota })
      });
      
      if (response.ok) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to update quota:', error);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = !searchTerm || 
      ticket.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.sellers?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner fullScreen={true} message="Loading statistics..." />;
  }

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/admin/events')}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgb(33, 42, 55)' }}
          >
            <ArrowLeft size={20} style={{ color: 'white' }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'white' }}>Admin Statistics</h1>
            <p style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>System overview and management</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {['overview', 'sellers', 'tickets'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200"
              style={{
                backgroundColor: activeTab === tab ? 'rgb(59, 130, 246)' : 'rgb(33, 42, 55)',
                color: activeTab === tab ? 'white' : 'rgb(248, 248, 255)',
                opacity: activeTab === tab ? 1 : 0.7
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="px-6">
          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl p-5 text-center" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: 'rgb(59, 130, 246, 0.2)' }}>
                <Ticket size={24} style={{ color: 'rgb(59, 130, 246)' }} />
              </div>
              <p className="text-3xl font-bold mb-1" style={{ color: 'white' }}>{stats?.tickets?.total || 0}</p>
              <p className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Total Tickets</p>
            </div>
            
            <div className="rounded-xl p-5 text-center" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: 'rgb(34, 197, 94, 0.2)' }}>
                <DollarSign size={24} style={{ color: 'rgb(34, 197, 94)' }} />
              </div>
              <p className="text-3xl font-bold mb-1" style={{ color: 'white' }}>{stats?.revenue?.total?.toLocaleString() || 0}</p>
              <p className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>NSL Revenue</p>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatCard
              icon={Users}
              label="Active Sellers"
              value={stats?.overview?.activeSellers?.toString() || '0'}
              subtext={`Total: ${stats?.overview?.totalSellers || 0}`}
              color="rgb(168, 85, 247)"
            />
            <StatCard
              icon={CheckCircle}
              label="Valid Tickets"
              value={stats?.tickets?.valid?.toString() || '0'}
              subtext={`Used: ${stats?.tickets?.used || 0}`}
              color="rgb(34, 197, 94)"
            />
          </div>

          {/* Quota Overview */}
          {stats?.quota && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3" style={{ color: 'white' }}>System Quota</h3>
              <div className="rounded-xl p-4" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Total Quota Usage</span>
                  <span className="text-2xl font-bold" style={{ color: 'rgb(59, 130, 246)' }}>
                    {stats.quota.used}/{stats.quota.total}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      backgroundColor: stats.quota.percentage >= 90 ? 'rgb(239, 68, 68)' : stats.quota.percentage >= 70 ? 'rgb(245, 158, 11)' : 'rgb(34, 197, 94)', 
                      width: `${Math.min(100, stats.quota.percentage)}%` 
                    }}
                  />
                </div>
                <p className="text-xs mt-2" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>
                  {stats.quota.remaining} tickets remaining
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sellers Tab */}
      {activeTab === 'sellers' && (
        <div className="px-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold" style={{ color: 'white' }}>Sellers Management</h3>
            <span className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>
              {sellers.length} sellers
            </span>
          </div>
          
          {sellers.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} style={{ color: 'rgb(248, 248, 255)', opacity: 0.3 }} className="mx-auto mb-4" />
              <p className="text-lg font-medium mb-2" style={{ color: 'white' }}>No Sellers Found</p>
              <p style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Create sellers to start managing tickets</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sellers.map(seller => (
                <SellerRow
                  key={seller.id}
                  seller={seller}
                  onToggleStatus={handleToggleSellerStatus}
                  onUpdateQuota={handleUpdateQuota}
                  onSellerClick={setSelectedSeller}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="px-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold" style={{ color: 'white' }}>All Tickets</h3>
            <span className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>
              {filteredTickets.length} of {tickets.length}
            </span>
          </div>

          {/* Search and Filter */}
          <div className="space-y-3 mb-6">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'rgb(248, 248, 255)', opacity: 0.5 }} />
              <input
                type="text"
                placeholder="Search tickets, buyers, or sellers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm"
                style={{
                  backgroundColor: 'rgb(33, 42, 55)',
                  color: 'white',
                  border: '1px solid rgb(59, 130, 246, 0.3)'
                }}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {['all', 'valid', 'used', 'revoked'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200"
                  style={{
                    backgroundColor: statusFilter === status ? 'rgb(59, 130, 246)' : 'rgb(33, 42, 55)',
                    color: statusFilter === status ? 'white' : 'rgb(248, 248, 255)',
                    opacity: statusFilter === status ? 1 : 0.7
                  }}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <Ticket size={48} style={{ color: 'rgb(248, 248, 255)', opacity: 0.3 }} className="mx-auto mb-4" />
              <p className="text-lg font-medium mb-2" style={{ color: 'white' }}>
                {searchTerm || statusFilter !== 'all' ? 'No matching tickets' : 'No tickets found'}
              </p>
              <p style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Tickets will appear here once sellers start generating them'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map(ticket => (
                <TicketRow
                  key={ticket.id}
                  ticket={ticket}
                  onClick={setSelectedTicket}
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal 
          ticket={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
        />
      )}
      
      {/* Seller Detail Page */}
      {selectedSeller && (
        <div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
          <SellerDetailPage 
            seller={selectedSeller}
            onBack={() => setSelectedSeller(null)}
            onUpdate={(updatedSeller) => {
              setSellers(prev => prev.map(s => s.id === updatedSeller.id ? updatedSeller : s));
              setSelectedSeller(updatedSeller);
            }}
          />
        </div>
      )}
    </div>
  );
}