import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Ticket, TrendingUp, DollarSign, Plus, UserPlus, QrCode, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CreateSellerModal from '../components/CreateSellerModal';
import EventAdminModal from '../components/EventAdminModal';
import LoadingSpinner from '../components/LoadingSpinner';


// Quick Stats Card Component
const StatCard = ({ icon: Icon, label, value, subtext, color }) => {
  return (
    <div
      className="rounded-xl p-4 flex-1 min-w-[140px]"
      style={{ backgroundColor: 'rgb(33, 42, 55)' }}
    >
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
        style={{ backgroundColor: color + '20' }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <p 
        className="text-sm mb-1"
        style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}
      >
        {label}
      </p>
      <p 
        className="text-2xl font-bold"
        style={{ color: 'white' }}
      >
        {value}
      </p>
      {subtext && (
        <p 
          className="text-xs mt-1"
          style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}
        >
          {subtext}
        </p>
      )}
    </div>
  );
};

// Quick Action Button Component
const QuickActionButton = ({ icon: Icon, label, color, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 active:scale-95"
      style={{ backgroundColor: 'rgb(33, 42, 55)' }}
    >
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: color }}
      >
        <Icon size={24} style={{ color: 'white' }} />
      </div>
      <span 
        className="text-sm font-medium"
        style={{ color: 'rgb(248, 248, 255)' }}
      >
        {label}
      </span>
    </button>
  );
};

// Event Card Component (Current Event)
const CurrentEventCard = ({ event }) => {
  if (!event || !event.name) {
    return (
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ 
          background: 'linear-gradient(135deg, rgb(75, 85, 99) 0%, rgb(55, 65, 81) 100%)',
        }}
      >
        <div className="text-center">
          <h2 
            className="text-xl font-bold mb-2"
            style={{ color: 'white' }}
          >
            No Active Event
          </h2>
          <p 
            className="text-sm"
            style={{ color: 'white', opacity: 0.8 }}
          >
            Create an event to get started
          </p>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const ticketPercentage = event.totalTickets > 0 ? (event.ticketsSold / event.totalTickets) * 100 : 0;
  const daysUntil = Math.ceil((eventDate - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div
      className="rounded-2xl p-6 mb-6"
      style={{ 
        background: 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(37, 99, 235) 100%)',
      }}
    >
      {/* Event Info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
          >
            {daysUntil > 0 ? `${daysUntil} days to go` : daysUntil === 0 ? 'Today' : 'Past Event'}
          </div>
        </div>
        <h2 
          className="text-2xl font-bold mb-2 break-words"
          style={{ color: 'white' }}
        >
          {event.name}
        </h2>
        <div className="flex items-center gap-2 mb-1">
          <Calendar size={16} style={{ color: 'white', opacity: 0.9 }} />
          <span 
            className="text-sm"
            style={{ color: 'white', opacity: 0.9 }}
          >
            {formattedDate}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={16} style={{ color: 'white', opacity: 0.9 }} />
          <span 
            className="text-sm"
            style={{ color: 'white', opacity: 0.9 }}
          >
            {event.location}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div 
          className="rounded-lg p-3 text-center"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
        >
          <p className="text-2xl font-bold" style={{ color: 'white' }}>
            {event.ticketsSold}
          </p>
          <p className="text-xs" style={{ color: 'white', opacity: 0.8 }}>
            Sold
          </p>
        </div>
        <div 
          className="rounded-lg p-3 text-center"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
        >
          <p className="text-2xl font-bold" style={{ color: 'white' }}>
            {event.sellers}
          </p>
          <p className="text-xs" style={{ color: 'white', opacity: 0.8 }}>
            Sellers
          </p>
        </div>
        <div 
          className="rounded-lg p-3 text-center"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
        >
          <p className="text-2xl font-bold" style={{ color: 'white' }}>
            {event.revenue.toLocaleString()} NSL
          </p>
          <p className="text-xs" style={{ color: 'white', opacity: 0.8 }}>
            Revenue
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm" style={{ color: 'white', opacity: 0.9 }}>
            Ticket Sales
          </span>
          <span className="text-sm font-semibold" style={{ color: 'white' }}>
            {ticketPercentage.toFixed(0)}%
          </span>
        </div>
        <div 
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          <div 
            className="h-full transition-all duration-300 rounded-full"
            style={{ 
              width: `${ticketPercentage}%`,
              backgroundColor: 'white'
            }}
          />
        </div>
        <p 
          className="text-xs mt-1"
          style={{ color: 'white', opacity: 0.8 }}
        >
          {event.ticketsSold} of {event.totalTickets} tickets sold
        </p>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function AdminHomeDashboard({ onScanTicket }) {
  const { user, currentEvent } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateSeller, setShowCreateSeller] = useState(false);
  const [showEventAdmins, setShowEventAdmins] = useState(false);

  // Fetch dashboard data from backend
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickAction = async (action) => {
    switch (action) {
      case 'add-seller':
      case 'create-seller':
        setShowCreateSeller(true);
        break;
      case 'scan-ticket':
        if (onScanTicket) {
          onScanTicket();
        }
        break;
      case 'new-event':
        // Dispatch event to switch to create event or navigate
        window.dispatchEvent(new CustomEvent('navigateToCreateEvent'));
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleSellerCreated = () => {
    // Refresh dashboard data after seller creation
    fetchDashboardData();
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        const backendData = result.data;
        setDashboardData({
          overview: backendData.overview,
          tickets: backendData.tickets,
          revenue: backendData.revenue,
          quota: backendData.quota,
          currentEvent: backendData.currentEvent
        });
      } else {
        throw new Error(result.error || 'Invalid response format');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message);
      // Fallback to mock data
      setDashboardData({
        overview: {
          totalSellers: 0,
          activeSellers: 0,
          totalEvents: 0,
          activeEvents: 0
        },
        tickets: {
          total: 0,
          valid: 0,
          used: 0,
          revoked: 0
        },
        revenue: {
          total: 0,
          average: 0
        },
        quota: {
          total: 0,
          used: 0,
          remaining: 0,
          percentage: 0
        },
        currentEvent: null
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen={true} message="Loading dashboard..." />;
  }

  const overview = dashboardData?.overview || {};
  const tickets = dashboardData?.tickets || {};
  const revenue = dashboardData?.revenue || {};
  const quota = dashboardData?.quota || {};
  const backendCurrentEvent = dashboardData?.currentEvent;
  
  // Use stored event data first, then backend data
  const displayEvent = currentEvent ? {
    name: currentEvent.name,
    date: currentEvent.event_date || currentEvent.date,
    location: currentEvent.location,
    ticketsSold: Math.max(currentEvent.tickets_sold || 0, tickets.used || 0),
    totalTickets: currentEvent.max_capacity || 0,
    sellers: overview.activeSellers || 0,
    revenue: revenue.total || 0
  } : (backendCurrentEvent ? {
    name: backendCurrentEvent.name || 'Unnamed Event',
    date: backendCurrentEvent.event_date || new Date().toISOString().split('T')[0],
    location: backendCurrentEvent.location || 'No Location Set',
    ticketsSold: Math.max(backendCurrentEvent.tickets_sold || 0, tickets.used || 0),
    totalTickets: backendCurrentEvent.max_capacity || 0,
    sellers: overview.activeSellers || 0,
    revenue: revenue.total || 0
  } : null);



  return (
    <div 
      className="min-h-screen pb-24"
      style={{ backgroundColor: 'rgb(12, 12, 12)' }}
    >
      {/* Header */}
      <div 
        className="px-6 pt-6 pb-4"
        style={{ backgroundColor: 'rgb(12, 12, 12)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgb(59, 130, 246)' }}
            >
              <span className="text-xl font-bold" style={{ color: 'white' }}>
                A
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p 
                className="text-sm"
                style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}
              >
                Good morning,
              </p>
              <h1 
                className="text-xl font-bold truncate"
                style={{ color: 'white' }}
              >
                {user?.name || user?.email || 'Admin'}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Date Button */}
            <button
              onClick={() => console.log('Date clicked')}
              className="w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all duration-200 active:scale-95"
              style={{ backgroundColor: 'rgb(33, 42, 55)' }}
            >
              <span 
                className="text-xs font-medium"
                style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}
              >
                {new Date().toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
              </span>
              <span 
                className="text-lg font-bold leading-none"
                style={{ color: 'white' }}
              >
                {new Date().getDate()}
              </span>
            </button>
            
            {/* Refresh Button */}
            <button
              onClick={() => {
                setLoading(true);
                fetchDashboardData();
              }}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95"
              style={{ backgroundColor: 'rgb(33, 42, 55)' }}
              disabled={loading}
            >
              <div className={loading ? 'animate-spin' : ''}>
                <span style={{ color: 'rgb(248, 248, 255)', fontSize: '18px' }}>↻</span>
              </div>
            </button>
            
            {/* Create Seller Button */}
            <button
              onClick={() => handleQuickAction('create-seller')}
              className="px-4 h-12 rounded-xl flex items-center gap-2 transition-all duration-200 active:scale-95 font-semibold text-sm"
              style={{ backgroundColor: 'rgb(59, 130, 246)', color: 'white' }}
            >
              <UserPlus size={18} />
              <span>Seller</span>
            </button>
          </div>
        </div>

        {/* Calendar - Event Week */}
        <div className="mb-6">
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: 'rgb(33, 42, 55)' }}
          >
            {/* Week Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 
                className="text-base font-bold"
                style={{ color: 'white' }}
              >
                {displayEvent ? new Date(displayEvent.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h4>
              <div className="flex gap-2">
                <button 
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95"
                  style={{ backgroundColor: 'rgb(33, 33, 33)' }}
                >
                  <span style={{ color: 'rgb(248, 248, 255)', fontSize: '14px' }}>←</span>
                </button>
                <button 
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95"
                  style={{ backgroundColor: 'rgb(33, 33, 33)' }}
                >
                  <span style={{ color: 'rgb(248, 248, 255)', fontSize: '14px' }}>→</span>
                </button>
              </div>
            </div>

            {/* Week Days - Single Row */}
            <div className="flex gap-2 justify-between">
              {(() => {
                const eventDate = displayEvent ? new Date(displayEvent.date) : new Date();
                const eventDay = eventDate.getDate();
                const startOfWeek = eventDay - 3; // Show 3 days before event day
                
                return Array.from({ length: 7 }, (_, i) => {
                  const dayNum = startOfWeek + i;
                  const isEventDay = dayNum === eventDay;
                  const isToday = dayNum === new Date().getDate();
                  const date = new Date(eventDate);
                  date.setDate(dayNum);
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);

                  return (
                    <button
                      key={i}
                      className="flex-1 rounded-xl py-3 px-2 flex flex-col items-center gap-1 transition-all duration-200 active:scale-95"
                      style={{
                        backgroundColor: isEventDay 
                          ? 'rgb(59, 130, 246)' 
                          : isToday
                          ? 'rgb(33, 33, 33)'
                          : 'transparent',
                        border: isEventDay ? 'none' : '1px solid rgb(33, 33, 33)'
                      }}
                    >
                      <span 
                        className="text-xs font-medium"
                        style={{ 
                          color: isEventDay ? 'white' : 'rgb(248, 248, 255)', 
                          opacity: isEventDay ? 1 : 0.6 
                        }}
                      >
                        {dayName}
                      </span>
                      <span 
                        className="text-lg font-bold relative"
                        style={{ color: isEventDay ? 'white' : 'rgb(248, 248, 255)' }}
                      >
                        {dayNum}
                        {isEventDay && (
                          <div 
                            className="absolute -top-1 -right-2 w-2 h-2 rounded-full"
                            style={{ backgroundColor: 'rgb(34, 197, 94)' }}
                          />
                        )}
                      </span>
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* Current Event Display */}
        <CurrentEventCard event={displayEvent} />
        
        {/* Event Management - Show shield button if there's a current event */}
        {displayEvent && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold" style={{ color: 'white' }}>Event Management</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/admin/events')}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
                  style={{ backgroundColor: 'rgb(33, 42, 55)' }}
                  title="Back to Events"
                >
                  <span style={{ color: 'white', fontSize: '16px' }}>←</span>
                </button>
                <button
                  onClick={() => setShowEventAdmins(currentEvent)}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
                  style={{ backgroundColor: 'rgb(59, 130, 246, 0.2)' }}
                  title="Manage Admins"
                >
                  <Shield size={20} style={{ color: 'rgb(59, 130, 246)' }} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mb-6">
          <h3 
            className="text-sm font-semibold mb-3"
            style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}
          >
            TODAY'S OVERVIEW
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            <StatCard
              icon={Ticket}
              label="Total Tickets"
              value={tickets.total?.toString() || '0'}
              subtext={`${tickets.valid || 0} valid, ${tickets.used || 0} used`}
              color="rgb(59, 130, 246)"
            />
            <StatCard
              icon={DollarSign}
              label="Total Revenue"
              value={`${revenue.total?.toLocaleString() || '0'} NSL`}
              subtext={`Avg: ${revenue.average?.toFixed(2) || '0'} NSL`}
              color="rgb(34, 197, 94)"
            />
            <StatCard
              icon={TrendingUp}
              label="Active Sellers"
              value={overview.activeSellers?.toString() || '0'}
              subtext={`Total: ${overview.totalSellers || 0}`}
              color="rgb(168, 85, 247)"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 
            className="text-sm font-semibold mb-3"
            style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}
          >
            QUICK ACTIONS
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <QuickActionButton
              icon={UserPlus}
              label="Add Seller"
              color="rgb(59, 130, 246)"
              onClick={() => handleQuickAction('add-seller')}
            />
            <QuickActionButton
              icon={QrCode}
              label="Scan Ticket"
              color="rgb(34, 197, 94)"
              onClick={() => handleQuickAction('scan-ticket')}
            />
           
            <QuickActionButton
              icon={Plus}
              label="New Event"
              color="rgb(168, 85, 247)"
              onClick={() => handleQuickAction('new-event')}
            />
          </div>
        </div>

      </div>

      {/* Create Seller Modal */}
      <CreateSellerModal 
        isOpen={showCreateSeller}
        onClose={() => setShowCreateSeller(false)}
        onSuccess={handleSellerCreated}
      />
      
      {/* Event Admin Modal */}
      {showEventAdmins && (
        <EventAdminModal 
          event={showEventAdmins}
          onClose={() => setShowEventAdmins(false)}
          onUpdate={() => {
            fetchDashboardData();
            setShowEventAdmins(false);
          }}
        />
      )}

      <style>{`
        /* Custom scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgb(33, 42, 55);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgb(59, 130, 246);
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgb(37, 99, 235);
        }
        
        /* Firefox scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgb(59, 130, 246) rgb(33, 42, 55);
        }
        
        /* Keep horizontal scroll hidden for stats cards */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 150px;
        }
      `}</style>
    </div>
  );
}