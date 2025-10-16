import React, { useState } from 'react';
import { Home, Ticket, Scan, BarChart3, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AdminHomeDashboard from '../../pages/adminHomePage';
import SellerHomeDashboard from '../../pages/sellerHomePage';
import GenerateTicketPage from '../../pages/GenerateTicketPage';
import ScanPage from '../../pages/ScanPage';
import SellerStatsPage from '../../pages/SellerStatsPage';
import AdminStatsPage from '../../pages/AdminStatsPage';
import SellerProfilePage from '../../pages/SellerProfilePage';
import AdminProfilePage from '../../pages/AdminProfilePage';

export default function MobileBottomMenu() {
  const [activeTab, setActiveTab] = useState('home');
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, logout } = useAuth();
  
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Refresh seller dashboard when switching to home
    if (tabId === 'home' && user?.role === 'seller') {
      setRefreshKey(prev => prev + 1);
    }
  };

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
    <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'rgb(12, 12, 12)' }}
    >
      {/* Main Content Area */}
      <div className="flex-1">
        {activeTab === 'generate' ? (
          <GenerateTicketPage />
        ) : activeTab === 'scan' ? (
          <ScanPage />
        ) : activeTab === 'stats' && user?.role === 'seller' ? (
          <SellerStatsPage />
        ) : activeTab === 'stats' && user?.role === 'admin' ? (
          <AdminStatsPage />
        ) : activeTab === 'profile' && user?.role === 'seller' ? (
          <SellerProfilePage />
        ) : activeTab === 'profile' && user?.role === 'admin' ? (
          <AdminProfilePage />
        ) : activeTab === 'home' && user?.role === 'admin' ? (
          <AdminHomeDashboard onScanTicket={() => setActiveTab('scan')} />
        ) : activeTab === 'home' && user?.role === 'seller' ? (
          <SellerHomeDashboard key={refreshKey} />
        ) : (
          <div className="flex items-center justify-center p-6 min-h-screen">
            <div 
              className="text-center p-8 rounded-2xl max-w-md w-full"
              style={{ backgroundColor: 'rgb(33, 42, 55)' }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 
                    className="text-3xl font-bold mb-2"
                    style={{ color: 'white' }}
                  >
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
              {user?.role === 'seller' && activeTab === 'scan' && (
                <p className="text-xs mt-2" style={{ color: 'rgb(156, 163, 175)' }}>
                  Scan feature is disabled for sellers
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation - Always show for sellers, hide only for admin home */}
      {user?.role === 'seller' || !(activeTab === 'home' && user?.role === 'admin') ? (
        <div 
          className="fixed bottom-0 left-0 right-0 pb-safe"
          style={{ 
            backgroundColor: 'rgb(33, 42, 55)',
            borderTop: '1px solid rgb(33, 33, 33)'
          }}
        >
        <div className="flex items-center justify-around px-4 py-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isScan = item.id === 'scan';

            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex flex-col items-center justify-center transition-all duration-200 ${
                  isScan ? 'relative -mt-8' : ''
                }`}
                style={{
                  minWidth: '60px',
                  padding: isScan ? '0' : '8px',
                }}
              >
                {isScan ? (
                  // Special elevated scan button
                  <div
                    className="rounded-full p-4 shadow-2xl"
                    style={{
                      backgroundColor: isActive ? 'rgb(59, 130, 246)' : 'rgb(59, 130, 246)',
                      transform: 'scale(1.1)',
                    }}
                  >
                    <Icon
                      size={28}
                      style={{ color: 'white' }}
                      strokeWidth={2.5}
                    />
                  </div>
                ) : (
                  <>
                    <div
                      className={`rounded-full p-3 transition-all duration-200 ${
                        isActive ? 'scale-110' : ''
                      }`}
                      style={{
                        backgroundColor: isActive ? 'rgb(59, 130, 246)' : 'transparent',
                      }}
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
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Safe area spacer for iOS */}
        <div style={{ height: 'env(safe-area-inset-bottom)' }} />
        </div>
      ) : null}
      
      {/* Floating Bottom Navigation for Admin Home */}
      {activeTab === 'home' && user?.role === 'admin' && (
        <div 
          className="fixed bottom-4 left-4 right-4 pb-safe"
          style={{ 
            backgroundColor: 'rgb(33, 42, 55)',
            borderRadius: '20px',
            border: '1px solid rgb(33, 33, 33)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="flex items-center justify-around px-4 py-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isScan = item.id === 'scan';

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex flex-col items-center justify-center transition-all duration-200 ${
                    isScan ? 'relative -mt-8' : ''
                  }`}
                  style={{
                    minWidth: '60px',
                    padding: isScan ? '0' : '8px',
                  }}
                >
                  {isScan ? (
                    <div
                      className="rounded-full p-4 shadow-2xl"
                      style={{
                        backgroundColor: isActive ? 'rgb(59, 130, 246)' : 'rgb(59, 130, 246)',
                        transform: 'scale(1.1)',
                      }}
                    >
                      <Icon
                        size={28}
                        style={{ color: 'white' }}
                        strokeWidth={2.5}
                      />
                    </div>
                  ) : (
                    <>
                      <div
                        className={`rounded-full p-3 transition-all duration-200 ${
                          isActive ? 'scale-110' : ''
                        }`}
                        style={{
                          backgroundColor: isActive ? 'rgb(59, 130, 246)' : 'transparent',
                        }}
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
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        /* Support for iOS safe area */
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .pb-safe {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }

        /* Active state tap feedback */
        button:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
}