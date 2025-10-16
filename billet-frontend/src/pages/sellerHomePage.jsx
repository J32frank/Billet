import React, { useState, useEffect } from 'react';
import { Ticket, TrendingUp, DollarSign, QrCode, Users, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

// Event Card Component (Assigned Event)
const AssignedEventCard = ({ event }) => {
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
            No Assigned Event
          </h2>
          <p 
            className="text-sm"
            style={{ color: 'white', opacity: 0.8 }}
          >
            Contact admin to get assigned to an event
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

  const daysUntil = Math.ceil((eventDate - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div
      className="rounded-2xl p-6 mb-6"
      style={{ 
        background: 'linear-gradient(135deg, rgb(34, 197, 94) 0%, rgb(22, 163, 74) 100%)',
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

      {/* Seller Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div 
          className="rounded-lg p-3 text-center"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
        >
          <p className="text-2xl font-bold" style={{ color: 'white' }}>
            {event.myTicketsSold || 0}
          </p>
          <p className="text-xs" style={{ color: 'white', opacity: 0.8 }}>
            My Sales
          </p>
        </div>
        <div 
          className="rounded-lg p-3 text-center"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
        >
          <p className="text-2xl font-bold" style={{ color: 'white' }}>
            {event.myRevenue || 0} NSL
          </p>
          <p className="text-xs" style={{ color: 'white', opacity: 0.8 }}>
            My Revenue
          </p>
        </div>
      </div>
    </div>
  );
};

// Main Seller Dashboard Component
export default function SellerHomeDashboard() {
  const { user, currentEvent } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up polling every 10 seconds for more responsive updates
    const interval = setInterval(fetchDashboardData, 10000);
    
    // Refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDashboardData();
      }
    };
    
    // Refresh when ticket is generated
    const handleTicketGenerated = () => {
      fetchDashboardData();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('ticketGenerated', handleTicketGenerated);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('ticketGenerated', handleTicketGenerated);
    };
  }, []);

  const fetchDashboardData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      console.log('🔄 Fetching seller dashboard data...');
      const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/seller/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Seller dashboard data received:', result);
      
      if (result.success && result.data) {
        const backendData = result.data;
        const stats = backendData.myStats;
        
        // Map backend data to frontend format
        const mappedData = {
          myStats: {
            totalTicketsSold: stats?.totals?.all || 0,
            totalRevenue: stats?.revenue?.total || 0,
            todaysSales: stats?.totals?.valid || 0,
            thisWeekSales: stats?.totals?.used || 0
          },
          assignedEvent: backendData.assignedEvent ? {
            ...backendData.assignedEvent,
            myTicketsSold: stats?.totals?.all || 0,
            myRevenue: stats?.revenue?.total || 0
          } : null
        };
        
        setDashboardData(mappedData);
      } else {
        throw new Error(result.error || 'Invalid response format');
      }
    } catch (err) {
      console.error('❌ Seller dashboard fetch error:', err);
      // Fallback to mock data
      setDashboardData({
        myStats: {
          totalTicketsSold: 0,
          totalRevenue: 0,
          todaysSales: 0,
          thisWeekSales: 0
        },
        assignedEvent: currentEvent ? {
          name: currentEvent.name,
          date: currentEvent.event_date || currentEvent.date,
          location: currentEvent.location,
          myTicketsSold: 0,
          myRevenue: 0
        } : null
      });
      
      // If no event assigned, show appropriate message
      if (!currentEvent) {
        console.log('⚠️ Seller has no assigned event');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const myStats = dashboardData?.myStats || {};
  const assignedEvent = dashboardData?.assignedEvent;

  return (
    <div 
      className="min-h-screen pb-32"
      style={{ backgroundColor: 'rgb(12, 12, 12)' }}
    >
      {/* Header */}
      <div 
        className="px-6 pt-6 pb-4"
        style={{ backgroundColor: 'rgb(12, 12, 12)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgb(34, 197, 94)' }}
            >
              <span className="text-xl font-bold" style={{ color: 'white' }}>
                S
              </span>
            </div>
            <div>
              <p 
                className="text-sm"
                style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}
              >
                Good morning,
              </p>
              <h1 
                className="text-xl font-bold"
                style={{ color: 'white' }}
              >
                {user?.name || user?.email?.split('@')[0] || 'Seller'}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <button
              onClick={() => fetchDashboardData(true)}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95"
              style={{ backgroundColor: 'rgb(33, 42, 55)' }}
              title="Refresh Dashboard"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ color: 'rgb(248, 248, 255)' }}
                className={refreshing ? 'animate-spin' : ''}
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
            </button>
            
            {/* Date Button */}
            <button
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
          </div>
        </div>

        {/* Assigned Event Card */}
        <AssignedEventCard event={assignedEvent} />

        {/* Quota Status */}
        {dashboardData?.myStats?.quota && (
          <div className="mb-6">
            <h3 
              className="text-sm font-semibold mb-3"
              style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}
            >
              TICKET QUOTA
            </h3>
            <div className="rounded-xl p-4" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Remaining Tickets</span>
                <span className="text-2xl font-bold" style={{ 
                  color: dashboardData.myStats.quota.remaining > 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)' 
                }}>
                  {dashboardData.myStats.quota.remaining}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>Used: {dashboardData.myStats.quota.used}</span>
                <span className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>Total: {dashboardData.myStats.quota.total}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    backgroundColor: dashboardData.myStats.quota.percentageUsed >= 100 ? 'rgb(239, 68, 68)' : 
                                   dashboardData.myStats.quota.percentageUsed >= 80 ? 'rgb(245, 158, 11)' : 'rgb(34, 197, 94)', 
                    width: `${Math.min(100, dashboardData.myStats.quota.percentageUsed)}%` 
                  }}
                />
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
            MY PERFORMANCE
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            <StatCard
              icon={Ticket}
              label="Total Sales"
              value={myStats.totalTicketsSold?.toString() || '0'}
              subtext="All time"
              color="rgb(34, 197, 94)"
            />
            <StatCard
              icon={DollarSign}
              label="Total Revenue"
              value={`${myStats.totalRevenue?.toLocaleString() || '0'} NSL`}
              subtext="All time"
              color="rgb(59, 130, 246)"
            />
            <StatCard
              icon={TrendingUp}
              label="Today's Sales"
              value={myStats.todaysSales?.toString() || '0'}
              subtext="Tickets sold today"
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
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                // Dispatch custom event to switch to generate tab
                window.dispatchEvent(new CustomEvent('switchToGenerate'));
              }}
              className="rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 active:scale-95"
              style={{ backgroundColor: 'rgb(33, 42, 55)' }}
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgb(34, 197, 94)' }}
              >
                <Ticket size={24} style={{ color: 'white' }} />
              </div>
              <span 
                className="text-sm font-medium"
                style={{ color: 'rgb(248, 248, 255)' }}
              >
                Generate Ticket
              </span>
            </button>
            
            <button
              onClick={() => {
                // Dispatch custom event to switch to stats tab
                window.dispatchEvent(new CustomEvent('switchToStats'));
              }}
              className="rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 active:scale-95"
              style={{ backgroundColor: 'rgb(33, 42, 55)' }}
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgb(59, 130, 246)' }}
              >
                <Users size={24} style={{ color: 'white' }} />
              </div>
              <span 
                className="text-sm font-medium"
                style={{ color: 'rgb(248, 248, 255)' }}
              >
                My Customers
              </span>
            </button>
          </div>
        </div>

        {/* Performance Tip */}
        <div 
          className="p-4 rounded-lg text-sm"
          style={{ backgroundColor: 'rgb(33, 42, 55)' }}
        >
          <p className="font-semibold mb-2" style={{ color: 'white' }}>
            💡 Seller Tip
          </p>
          <p style={{ color: 'rgb(248, 248, 255)', opacity: 0.8 }}>
            Use the Generate tab to create tickets for your customers. Each ticket has a unique QR code for verification.
          </p>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}