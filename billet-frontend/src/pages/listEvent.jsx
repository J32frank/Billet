import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Plus, ChevronRight, Users, Ticket, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import EventAdminModal from '../components/EventAdminModal';
import LoadingSpinner from '../components/LoadingSpinner';

// Event Card Component
const EventCard = ({ event, onClick, onManageAdmins, onDetail }) => {
  const eventDate = new Date(event.event_date || event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const maxCapacity = event.max_capacity || event.attendees || 0;
  const ticketsSold = event.tickets_sold || event.ticketsSold || event.sold_tickets || 0;
  const ticketPercentage = maxCapacity > 0 ? (ticketsSold / maxCapacity) * 100 : 0;

  return (
    <div
      onClick={onClick}
      className="rounded-xl p-5 mb-4 transition-all duration-200 active:scale-98 cursor-pointer"
      style={{ 
        backgroundColor: 'rgb(33, 42, 55)',
        border: '1px solid rgb(33, 33, 33)'
      }}
    >
      {/* Event Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 
            className="text-lg font-bold mb-1 line-clamp-1"
            style={{ color: 'white' }}
          >
            {event.name}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={14} style={{ color: 'rgb(59, 130, 246)' }} />
            <span 
              className="text-sm"
              style={{ color: 'rgb(248, 248, 255)', opacity: 0.8 }}
            >
              {formattedDate}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} style={{ color: 'rgb(59, 130, 246)' }} />
            <span 
              className="text-sm line-clamp-1"
              style={{ color: 'rgb(248, 248, 255)', opacity: 0.8 }}
            >
              {event.location}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDetail(event.id);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
            style={{ backgroundColor: 'rgb(34, 197, 94, 0.2)' }}
            title="View Details"
          >
            <ChevronRight size={14} style={{ color: 'rgb(34, 197, 94)' }} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onManageAdmins(event);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
            style={{ backgroundColor: 'rgb(59, 130, 246, 0.2)' }}
            title="Manage Admins"
          >
            <Shield size={14} style={{ color: 'rgb(59, 130, 246)' }} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <Users size={16} style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }} />
          <span 
            className="text-sm font-medium"
            style={{ color: 'rgb(248, 248, 255)' }}
          >
            {maxCapacity}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Ticket size={16} style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }} />
          <span 
            className="text-sm font-medium"
            style={{ color: 'rgb(248, 248, 255)' }}
          >
            {ticketsSold} sold
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div 
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: 'rgb(33, 33, 33)' }}
        >
          <div 
            className="h-full transition-all duration-300 rounded-full"
            style={{ 
              width: `${ticketPercentage}%`,
              backgroundColor: 'rgb(59, 130, 246)'
            }}
          />
        </div>
        <p 
          className="text-xs mt-1 text-right"
          style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}
        >
          {ticketPercentage.toFixed(0)}% sold
        </p>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ onCreateClick }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div 
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: 'rgb(33, 42, 55)' }}
      >
        <Calendar size={40} style={{ color: 'rgb(248, 248, 255)', opacity: 0.4 }} />
      </div>
      <h3 
        className="text-xl font-bold mb-2"
        style={{ color: 'white' }}
      >
        No Events Yet
      </h3>
      <p 
        className="text-base mb-6"
        style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}
      >
        Create your first event to get started
      </p>
      <button
        onClick={onCreateClick}
        className="px-6 py-3 rounded-lg font-semibold text-base transition-all duration-200 active:scale-95 flex items-center gap-2"
        style={{
          backgroundColor: 'rgb(59, 130, 246)',
          color: 'white',
        }}
      >
        <Plus size={20} />
        Create Event
      </button>
    </div>
  );
};

// Main Events List Page
export default function EventsListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { setCurrentEvent } = useAuth();
  const navigate = useNavigate();

  // Fetch admin's events
  React.useEffect(() => {
    fetchAdminEvents();
  }, []);

  const fetchAdminEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setEvents([]);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setEvents(result.data || []);
        } else {
          console.error('API returned error:', result.error);
          setEvents([]);
        }
      } else {
        console.error('HTTP error:', response.status, response.statusText);
        if (response.status === 401) {
          localStorage.clear();
          window.location.href = '/login';
        }
        setEvents([]);
      }
    } catch (error) {
      console.error('Network error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    navigate('/admin/create-event');
  };

  const handleEventClick = (eventId) => {
    const selectedEvent = events.find(event => event.id === eventId);
    if (selectedEvent) {
      setCurrentEvent(selectedEvent);
    }
    navigate('/menu');
  };

  const handleEventDetail = (eventId) => {
    navigate(`/admin/events/${eventId}`);
  };

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: 'rgb(12, 12, 12)' }}
    >
      {/* Toast */}
      {showToast && (
        <div 
          className="fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-lg shadow-2xl z-50 max-w-md w-full mx-4 animate-slide-down"
          style={{ backgroundColor: 'rgb(34, 197, 94)' }}
        >
          <div className="flex items-center justify-between">
            <p className="text-white font-medium">Navigating to create event...</p>
            <button 
              onClick={() => setShowToast(false)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div 
        className="sticky top-0 z-10 px-6 py-4"
        style={{ 
          backgroundColor: 'rgb(33, 42, 55)',
          borderBottom: '1px solid rgb(33, 33, 33)'
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-2xl font-bold"
              style={{ color: 'white' }}
            >
              My Events
            </h1>
            <p 
              className="text-sm mt-1"
              style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}
            >
              {loading ? 'Loading...' : `${events.length} ${events.length === 1 ? 'event' : 'events'}`}
            </p>
          </div>
          {events.length > 0 && (
            <button
              onClick={handleCreateEvent}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
              style={{ backgroundColor: 'rgb(59, 130, 246)' }}
            >
              <Plus size={24} style={{ color: 'white' }} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {loading ? (
          <LoadingSpinner message="Loading events..." />
        ) : events.length === 0 ? (
          <EmptyState onCreateClick={handleCreateEvent} />
        ) : (
          <div>
            {events.map((event) => (
              <EventCard 
                key={event.id} 
                event={event}
                onClick={() => handleEventClick(event.id)}
                onManageAdmins={setSelectedEvent}
                onDetail={handleEventDetail}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button (alternative placement) */}
      {events.length > 0 && (
        <button
          onClick={handleCreateEvent}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 active:scale-95 z-20"
          style={{ 
            backgroundColor: 'rgb(59, 130, 246)',
          }}
        >
          <Plus size={28} style={{ color: 'white' }} strokeWidth={2.5} />
        </button>
      )}

      {/* Event Admin Modal */}
      {selectedEvent && (
        <EventAdminModal 
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdate={() => {
            onRefresh?.();
            setSelectedEvent(null);
          }}
        />
      )}

      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translate(-50%, -100%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .active\\:scale-98:active {
          transform: scale(0.98);
        }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Hide scrollbar but keep functionality */
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
      `}</style>
    </div>
  );
}