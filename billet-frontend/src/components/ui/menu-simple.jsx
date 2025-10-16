import React, { useState } from 'react';
import { Home, Ticket, Scan, BarChart3, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AdminHomeDashboard from '../../pages/adminHomePage';
import SellerHomeDashboard from '../../pages/sellerHomePage';
import GenerateTicketPage from '../../pages/GenerateTicketPage';
import ScanPage from '../../pages/ScanPage';
import SellerStatsPage from '../../pages/SellerStatsPage';
import SellerProfilePage from '../../pages/SellerProfilePage';

export default function MobileBottomMenu() {
  const [activeTab, setActiveTab] = useState('home');
  const { user, logout } = useAuth();

  React.useEffect(() => {
    const handleSwitchToGenerate = () => setActiveTab('generate');
    const handleSwitchToStats = () => setActiveTab('stats');
    const handleNavigateToCreateEvent = () => {
      // For admin, navigate to create event page
      if (user?.role === 'admin') {
        window.location.href = '/admin/create-event';
      }
    };
    
    window.addEventListener('switchToGenerate', handleSwitchToGenerate);
    window.addEventListener('switchToStats', handleSwitchToStats);
    window.addEventListener('navigateToCreateEvent', handleNavigateToCreateEvent);
    
    return () => {
      window.removeEventListener('switchToGenerate', handleSwitchToGenerate);
      window.removeEventListener('switchToStats', handleSwitchToStats);
      window.removeEventListener('navigateToCreateEvent', handleNavigateToCreateEvent);
    };
  }, [user]);



  const allMenuItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'generate', icon: Ticket, label: 'Generate' },
    { id: 'scan', icon: Scan, label: 'Scan' },
    { id: 'stats', icon: BarChart3, label: 'Stats' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  // Filter menu items based on user role
  const menuItems = user?.role === 'seller' 
    ? allMenuItems.filter(item => item.id !== 'scan')
    : allMenuItems;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
      {/* Main Content Area */}
      <div className="flex-1">
        {activeTab === 'generate' ? (
          <GenerateTicketPage />
        ) : activeTab === 'stats' ? (
          <SellerStatsPage />
        ) : activeTab === 'profile' ? (
          <SellerProfilePage />
        ) : activeTab === 'home' && user?.role === 'admin' ? (
          <AdminHomeDashboard onScanTicket={() => setActiveTab('scan')} />
        ) : activeTab === 'home' && user?.role === 'seller' ? (
          <SellerHomeDashboard />
        ) : activeTab === 'scan' ? (
          <ScanPage />
        ) : (
          <div className="flex items-center justify-center p-6 min-h-screen">
            <div className="text-center p-8 rounded-2xl max-w-md w-full" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2" style={{ color: 'white' }}>
                    {menuItems.find(item => item.id === activeTab)?.label} Page
                  </h1>
                  <p className="text-sm" style={{ color: 'rgb(248, 248, 255)' }}>
                    {user?.role === 'admin' ? 'Admin Dashboard' : 'Seller Dashboard'}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
              <p style={{ color: 'rgb(248, 248, 255)' }}>
                Welcome back, {user?.email}
              </p>
              {user?.role === 'seller' && (
                <p className="text-xs mt-2" style={{ color: 'rgb(156, 163, 175)' }}>
                  Scan feature is disabled for sellers
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0" style={{ backgroundColor: 'rgb(33, 42, 55)', borderTop: '1px solid rgb(33, 33, 33)' }}>
        <div className="flex items-center justify-around px-4 py-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center transition-all duration-200"
                style={{ minWidth: '60px', padding: '8px' }}
              >
                <div
                  className="rounded-full p-3 transition-all duration-200"
                  style={{ backgroundColor: isActive ? 'rgb(59, 130, 246)' : 'transparent' }}
                >
                  <Icon
                    size={22}
                    style={{ 
                      color: isActive ? 'white' : 'rgb(248, 248, 255)',
                      opacity: isActive ? 1 : 0.6
                    }}
                    strokeWidth={2}
                  />
                </div>
                <span
                  className="text-xs mt-1 transition-all duration-200"
                  style={{
                    color: isActive ? 'white' : 'rgb(248, 248, 255)',
                    opacity: isActive ? 1 : 0.6,
                    fontWeight: isActive ? '600' : '400',
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}