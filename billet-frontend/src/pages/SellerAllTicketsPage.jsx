import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Ticket, User, Phone, Calendar, DollarSign, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
      className="w-full rounded-lg p-4 mb-3 transition-all duration-200 active:scale-98"
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
      
      <div className="grid grid-cols-1 gap-2 text-left">
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

export default function SellerAllTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchTerm, statusFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/tickets/seller`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const ticketsWithPrice = (result.data || []).map(ticket => ({
            ...ticket,
            ticket_price: ticket.ticket_price || 50
          }));
          setTickets(ticketsWithPrice);
        }
      }
      
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(ticket => 
        ticket.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.buyer_phone && ticket.buyer_phone.includes(searchTerm))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    setFilteredTickets(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => window.history.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
            style={{ backgroundColor: 'rgb(33, 42, 55)' }}
          >
            <ArrowLeft size={20} style={{ color: 'white' }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'white' }}>All Tickets</h1>
            <p style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>
              {filteredTickets.length} of {tickets.length} tickets
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'rgb(248, 248, 255)', opacity: 0.5 }} />
            <input
              type="text"
              placeholder="Search by name, ticket number, or phone..."
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
      </div>

      {/* Tickets List */}
      <div className="px-6">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <Ticket size={48} style={{ color: 'rgb(248, 248, 255)', opacity: 0.3 }} className="mx-auto mb-4" />
            <p className="text-lg font-medium mb-2" style={{ color: 'white' }}>
              {searchTerm || statusFilter !== 'all' ? 'No matching tickets' : 'No tickets found'}
            </p>
            <p style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start generating tickets to see them here'
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