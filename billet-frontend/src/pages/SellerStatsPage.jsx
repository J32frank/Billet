import React, { useState, useEffect } from 'react';
import { TrendingUp, Ticket, DollarSign, Calendar, User, Phone, Mail, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

const TicketRow = ({ ticket }) => {
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
    <div className="rounded-lg p-4 mb-3" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
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
      
      <div className="grid grid-cols-1 gap-2">
        <div className="flex items-center gap-2">
          <User size={14} style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }} />
          <span className="text-sm" style={{ color: 'rgb(248, 248, 255)' }}>{ticket.buyer_name}</span>
        </div>
        {ticket.buyer_phone && (
          <div className="flex items-center gap-2">
            <Phone size={14} style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }} />
            <span className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.8 }}>{ticket.buyer_phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Calendar size={14} style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }} />
          <span className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>
            {new Date(ticket.generated_at).toLocaleDateString('en-US', { 
              month: 'short', day: 'numeric', year: 'numeric', 
              hour: '2-digit', minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    </div>
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
            <div className="flex items-center gap-3">
              <User size={16} style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'white' }}>{ticket.buyer_name}</p>
                <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>Buyer Name</p>
              </div>
            </div>
            
            {ticket.buyer_phone && (
              <div className="flex items-center gap-3">
                <Phone size={16} style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'white' }}>{ticket.buyer_phone}</p>
                  <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>Phone Number</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <DollarSign size={16} style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'rgb(34, 197, 94)' }}>{ticket.ticket_price} NSL</p>
                <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>Ticket Price</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar size={16} style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'white' }}>
                  {new Date(ticket.generated_at).toLocaleDateString('en-US', { 
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
                <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>Generated At</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SellerStatsPage() {
  const { user, currentEvent } = useAuth();
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
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

      const ticketsResponse = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/tickets/seller`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (ticketsResponse.ok) {
        const ticketsResult = await ticketsResponse.json();
        if (ticketsResult.success) {
          const ticketsWithPrice = (ticketsResult.data || []).map(ticket => ({
            ...ticket,
            ticket_price: ticket.ticket_price || 50
          }));
          setTickets(ticketsWithPrice);
        }
      }
      
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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

  const totalSales = stats?.totals?.all || tickets.length || 0;
  const totalRevenue = stats?.revenue?.total || tickets.reduce((sum, t) => sum + (parseFloat(t.ticket_price) || 0), 0) || 0;
  const validTickets = stats?.totals?.valid || tickets.filter(t => t.status === 'valid').length || 0;
  const usedTickets = stats?.totals?.used || tickets.filter(t => t.status === 'used').length || 0;

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'white' }}>My Statistics</h1>
        <p style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Your sales performance overview</p>
      </div>

      {/* Main Stats */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl p-5 text-center" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: 'rgb(34, 197, 94, 0.2)' }}>
              <Ticket size={24} style={{ color: 'rgb(34, 197, 94)' }} />
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: 'white' }}>{totalSales}</p>
            <p className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Total Sales</p>
          </div>
          
          <div className="rounded-xl p-5 text-center" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: 'rgb(59, 130, 246, 0.2)' }}>
              <DollarSign size={24} style={{ color: 'rgb(59, 130, 246)' }} />
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: 'white' }}>{totalRevenue}</p>
            <p className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>NSL Earned</p>
          </div>
        </div>
      </div>

      {/* Quota Status */}
      {stats?.quota && (
        <div className="px-6 mb-6">
          <h3 className="text-lg font-bold mb-3" style={{ color: 'white' }}>Ticket Quota</h3>
          <div className="rounded-xl p-4" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Remaining Tickets</span>
              <span className="text-2xl font-bold" style={{ color: stats.quota.remaining > 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)' }}>
                {stats.quota.remaining}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>Used: {stats.quota.used}</span>
              <span className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>Total: {stats.quota.total}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300" 
                style={{ 
                  backgroundColor: stats.quota.percentageUsed >= 100 ? 'rgb(239, 68, 68)' : stats.quota.percentageUsed >= 80 ? 'rgb(245, 158, 11)' : 'rgb(34, 197, 94)', 
                  width: `${Math.min(100, stats.quota.percentageUsed)}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Status Breakdown */}
      <div className="px-6 mb-6">
        <h3 className="text-lg font-bold mb-3" style={{ color: 'white' }}>Ticket Status</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg p-4 flex items-center gap-3" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
            <CheckCircle size={20} style={{ color: 'rgb(34, 197, 94)' }} />
            <div>
              <p className="text-lg font-bold" style={{ color: 'white' }}>{validTickets}</p>
              <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Valid</p>
            </div>
          </div>
          
          <div className="rounded-lg p-4 flex items-center gap-3" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
            <CheckCircle size={20} style={{ color: 'rgb(59, 130, 246)' }} />
            <div>
              <p className="text-lg font-bold" style={{ color: 'white' }}>{usedTickets}</p>
              <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Used</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Event */}
      {currentEvent && (
        <div className="px-6 mb-6">
          <h3 className="text-lg font-bold mb-3" style={{ color: 'white' }}>Current Event</h3>
          <div className="rounded-xl p-4" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
            <p className="text-lg font-bold mb-1" style={{ color: 'rgb(34, 197, 94)' }}>{currentEvent.name}</p>
            <p className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>
              {new Date(currentEvent.event_date || currentEvent.date).toLocaleDateString()} • {currentEvent.location}
            </p>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold" style={{ color: 'white' }}>Recent Tickets</h3>
          {tickets.length > 5 && (
            <button
              onClick={() => window.location.href = '/seller/all-tickets'}
              className="px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95"
              style={{
                backgroundColor: 'rgb(59, 130, 246)',
                color: 'white'
              }}
            >
              See All
            </button>
          )}
        </div>
        {tickets.length === 0 ? (
          <div className="text-center py-8">
            <Ticket size={40} style={{ color: 'rgb(248, 248, 255)', opacity: 0.3 }} className="mx-auto mb-3" />
            <p style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>No tickets generated yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.slice(0, 5).map(ticket => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="w-full rounded-lg p-4 flex items-center justify-between transition-all duration-200 active:scale-98"
                style={{ backgroundColor: 'rgb(33, 42, 55)' }}
              >
                <div className="text-left">
                  <p className="font-mono text-sm font-bold" style={{ color: 'white' }}>{ticket.ticket_number}</p>
                  <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>{ticket.buyer_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: 'rgb(34, 197, 94)' }}>{ticket.ticket_price} NSL</p>
                  <p className="text-xs" style={{ color: ticket.status === 'valid' ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)' }}>
                    {ticket.status.toUpperCase()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal 
          ticket={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
        />
      )}
    </div>
  );
}