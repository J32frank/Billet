import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Ticket, Edit3, Save, X, Trash2, Shield } from 'lucide-react';
import EventAdminModal from '../components/EventAdminModal';

export default function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    location: '',
    event_date: '',
    max_capacity: 0,
    ticket_price: 0
  });

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const [eventRes, sellersRes, ticketsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/events/${eventId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/admin/sellers?eventId=${eventId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/admin/all-tickets?eventId=${eventId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const [eventData, sellersData, ticketsData] = await Promise.all([
        eventRes.json(),
        sellersRes.json(),
        ticketsRes.json()
      ]);

      if (eventData.success) {
        setEvent(eventData.data);
        setEditForm({
          name: eventData.data.name || '',
          description: eventData.data.description || '',
          location: eventData.data.location || '',
          event_date: eventData.data.event_date?.split('T')[0] || '',
          max_capacity: eventData.data.max_capacity || 0,
          ticket_price: eventData.data.ticket_price || 0
        });
      }

      if (sellersData.success) setSellers(sellersData.data || []);
      if (ticketsData.success) setTickets(ticketsData.data || []);
    } catch (error) {
      console.error('Failed to fetch event details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/events/${eventId}`, {
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
          setEvent(result.data);
          setEditing(false);
        }
      }
    } catch (error) {
      console.error('Failed to update event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        navigate('/admin/events');
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
        <div className="text-center">
          <p className="text-white mb-4">Event not found</p>
          <button onClick={() => navigate('/admin/events')} className="px-4 py-2 bg-blue-600 text-white rounded">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const ticketsSold = tickets.filter(t => t.status === 'used').length;
  const ticketPercentage = event.max_capacity > 0 ? (ticketsSold / event.max_capacity) * 100 : 0;

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgb(33, 33, 33)' }}>
        <button onClick={() => navigate('/admin/events')} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
          <ArrowLeft size={20} style={{ color: 'white' }} />
        </button>
        <h1 className="text-xl font-bold" style={{ color: 'white' }}>Event Details</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowAdminModal(true)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgb(59, 130, 246, 0.2)' }}>
            <Shield size={20} style={{ color: 'rgb(59, 130, 246)' }} />
          </button>
          <button onClick={() => setEditing(!editing)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: editing ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)' }}>
            {editing ? <X size={20} style={{ color: 'white' }} /> : <Edit3 size={20} style={{ color: 'white' }} />}
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Event Info Card */}
        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
          {editing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                className="w-full p-3 rounded-lg text-xl font-bold"
                style={{ backgroundColor: 'rgb(33, 33, 33)', color: 'white' }}
                placeholder="Event Name"
              />
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                className="w-full p-3 rounded-lg"
                style={{ backgroundColor: 'rgb(33, 33, 33)', color: 'white' }}
                placeholder="Description"
                rows="3"
              />
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                className="w-full p-3 rounded-lg"
                style={{ backgroundColor: 'rgb(33, 33, 33)', color: 'white' }}
                placeholder="Location"
              />
              <input
                type="date"
                value={editForm.event_date}
                onChange={(e) => setEditForm({...editForm, event_date: e.target.value})}
                className="w-full p-3 rounded-lg"
                style={{ backgroundColor: 'rgb(33, 33, 33)', color: 'white' }}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  value={editForm.max_capacity}
                  onChange={(e) => setEditForm({...editForm, max_capacity: Number(e.target.value)})}
                  className="w-full p-3 rounded-lg"
                  style={{ backgroundColor: 'rgb(33, 33, 33)', color: 'white' }}
                  placeholder="Max Capacity"
                />
                <input
                  type="number"
                  value={editForm.ticket_price}
                  onChange={(e) => setEditForm({...editForm, ticket_price: Number(e.target.value)})}
                  className="w-full p-3 rounded-lg"
                  style={{ backgroundColor: 'rgb(33, 33, 33)', color: 'white' }}
                  placeholder="Ticket Price"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} className="flex-1 py-3 rounded-lg font-medium" style={{ backgroundColor: 'rgb(34, 197, 94)', color: 'white' }}>
                  <Save size={16} className="inline mr-2" />
                  Save Changes
                </button>
                <button onClick={handleDelete} className="px-4 py-3 rounded-lg font-medium" style={{ backgroundColor: 'rgb(127, 29, 29)', color: 'white' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'white' }}>{event.name}</h2>
              <p className="mb-4" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>{event.description}</p>
              
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} style={{ color: 'rgb(59, 130, 246)' }} />
                <span style={{ color: 'white' }}>{new Date(event.event_date).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} style={{ color: 'rgb(59, 130, 246)' }} />
                <span style={{ color: 'white' }}>{event.location}</span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: 'white' }}>{ticketsSold}</p>
                  <p className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Sold</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: 'white' }}>{event.max_capacity}</p>
                  <p className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Capacity</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: 'rgb(34, 197, 94)' }}>{event.ticket_price} NSL</p>
                  <p className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Price</p>
                </div>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div className="h-3 rounded-full transition-all duration-300" style={{ backgroundColor: 'rgb(59, 130, 246)', width: `${ticketPercentage}%` }} />
              </div>
              <p className="text-center text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>
                {ticketPercentage.toFixed(1)}% sold
              </p>
            </>
          )}
        </div>

        {/* Sellers */}
        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'white' }}>Sellers ({sellers.length})</h3>
          {sellers.length === 0 ? (
            <p style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>No sellers assigned</p>
          ) : (
            <div className="space-y-3">
              {sellers.slice(0, 5).map(seller => (
                <div key={seller.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgb(33, 33, 33)' }}>
                  <div>
                    <p className="font-medium" style={{ color: 'white' }}>{seller.name}</p>
                    <p className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>{seller.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: 'white' }}>{seller.tickets_sold}/{seller.quota}</p>
                    <p className="text-xs" style={{ color: seller.is_active ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)' }}>
                      {seller.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tickets */}
        <div className="rounded-xl p-6" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'white' }}>Recent Tickets ({tickets.length})</h3>
          {tickets.length === 0 ? (
            <p style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>No tickets generated</p>
          ) : (
            <div className="space-y-3">
              {tickets.slice(0, 10).map(ticket => (
                <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgb(33, 33, 33)' }}>
                  <div>
                    <p className="font-mono font-bold" style={{ color: 'white' }}>{ticket.ticket_number}</p>
                    <p className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>{ticket.buyer_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm px-2 py-1 rounded-full" style={{ 
                      backgroundColor: ticket.status === 'valid' ? 'rgb(34, 197, 94, 0.2)' : ticket.status === 'used' ? 'rgb(59, 130, 246, 0.2)' : 'rgb(239, 68, 68, 0.2)',
                      color: ticket.status === 'valid' ? 'rgb(34, 197, 94)' : ticket.status === 'used' ? 'rgb(59, 130, 246)' : 'rgb(239, 68, 68)'
                    }}>
                      {ticket.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event Admin Modal */}
      {showAdminModal && (
        <EventAdminModal 
          event={event}
          onClose={() => setShowAdminModal(false)}
          onUpdate={fetchEventDetails}
        />
      )}
    </div>
  );
}