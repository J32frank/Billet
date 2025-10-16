import React, { useState } from 'react';
import { User, Mail, Phone, Ticket } from 'lucide-react';
import TicketService from '../services/ticketService';
import { TicketQRModal } from './TicketpopUp';
import { useAuth } from '../contexts/AuthContext';

// Input Component
const Input = React.forwardRef(({ 
  label, 
  error, 
  icon: Icon,
  className = '', 
  id,
  type = 'text',
  ...props 
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-base font-medium mb-2"
          style={{ color: 'rgb(248, 248, 255)' }}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Icon size={20} style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }} />
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`
            w-full py-4
            border-2 rounded-lg
            text-base
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-12 pr-4' : 'px-4'}
            ${error 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'focus:ring-blue-400 focus:border-blue-400'
            }
            ${className}
          `}
          style={{
            backgroundColor: 'rgb(33, 33, 33)',
            borderColor: error ? '#ef4444' : 'rgb(33, 42, 55)',
            color: 'rgb(248, 248, 255)',
            '--tw-ring-offset-color': 'rgb(12, 12, 12)',
          }}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>
      
      {error && (
        <p 
          id={`${inputId}-error`}
          className="mt-2 text-sm text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Toast Component
const Toast = ({ message, type = 'error', onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className="fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-lg shadow-2xl z-50 max-w-md w-full mx-4 animate-slide-down"
      style={{
        backgroundColor: type === 'error' ? 'rgb(239, 68, 68)' : 'rgb(34, 197, 94)',
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-white font-medium">{message}</p>
        <button 
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Quota Error Modal Component
const QuotaErrorModal = ({ onClose, quotaInfo }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgb(239, 68, 68, 0.2)' }}>
            <Ticket size={32} style={{ color: 'rgb(239, 68, 68)' }} />
          </div>
          
          <h3 className="text-xl font-bold mb-2" style={{ color: 'white' }}>Ticket Limit Reached</h3>
          
          <p className="text-sm mb-4" style={{ color: 'rgb(248, 248, 255)', opacity: 0.8 }}>
            You have reached your maximum ticket quota and cannot generate more tickets at this time.
          </p>
          
          {quotaInfo && (
            <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Tickets Generated:</span>
                <span className="font-bold" style={{ color: 'rgb(239, 68, 68)' }}>{quotaInfo.used}/{quotaInfo.total}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full" 
                  style={{ 
                    backgroundColor: 'rgb(239, 68, 68)', 
                    width: `${Math.min(100, (quotaInfo.used / quotaInfo.total) * 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
          
          <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: 'rgb(59, 130, 246, 0.1)', border: '1px solid rgb(59, 130, 246, 0.3)' }}>
            <p className="text-sm font-medium mb-2" style={{ color: 'rgb(59, 130, 246)' }}>Need More Tickets?</p>
            <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.8 }}>
              Contact your administrator to request additional ticket quota for your account.
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg font-semibold transition-all duration-200 active:scale-95"
            style={{ backgroundColor: 'rgb(59, 130, 246)', color: 'white' }}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};



// Validation functions
const validateBuyerName = (name) => {
  if (!name) return 'Buyer name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  return '';
};

const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return '';
};

const validatePhone = (phone) => {
  if (!phone) return 'Phone number is required';
  const phoneRegex = /^[0-9]{10,15}$/;
  if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) return 'Please enter a valid phone number';
  return '';
};

// Main Generate Ticket Page
export default function GenerateTicketPage() {
  const { currentEvent, user, refreshCurrentEvent } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState(null);
  const [showQuotaError, setShowQuotaError] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState(null);
  
  const [buyerName, setBuyerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleBlur = (field, validator, value) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validator(value) }));
  };

  const handleChange = (field, value, validator) => {
    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: validator(value) }));
    }
  };

  const resetForm = () => {
    setBuyerName('');
    setEmail('');
    setPhone('');
    setErrors({});
    setTouched({});
  };

  const handleSubmit = async () => {
    // Check if user has access to generate tickets
    if (!currentEvent) {
      setToast({ message: 'No active event found. Contact admin to get assigned to an event.', type: 'error' });
      return;
    }

    // Validate all fields
    const newErrors = {
      buyerName: validateBuyerName(buyerName),
      email: validateEmail(email),
      phone: validatePhone(phone),
    };
    
    setErrors(newErrors);
    setTouched({
      buyerName: true,
      email: true,
      phone: true,
    });

    // Check if any errors exist
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    if (hasErrors) {
      setToast({ message: 'Please fix all errors before submitting', type: 'error' });
      return;
    }

    setIsLoading(true);
    setToast(null);

    try {
      const result = await TicketService.generateTicket({
        buyerName,
        email,
        phone
      });
      
      if (result.success) {
        const ticket = {
          ticketId: result.data.id,
          ticketNumber: result.data.ticket_number,
          crypticCode: result.data.cryptic_code,
          ticketPrice: result.data.ticket_price || currentEvent?.ticket_price || 0,
          buyerName,
          email,
          phone,
          createdAt: result.data.generated_at || new Date().toISOString()
        };
        
        setGeneratedTicket(ticket);
        setShowSuccess(true);
        resetForm();
        
        // Trigger dashboard refresh by dispatching custom event
        window.dispatchEvent(new CustomEvent('ticketGenerated'));
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      let errorMessage = error.message || 'Failed to generate ticket. Please try again.';
      
      // Check if it's a quota error and show special modal
      if (errorMessage.includes('quota') || errorMessage.includes('Quota')) {
        // Extract quota info from error message if available
        const quotaMatch = errorMessage.match(/(\d+)\/(\d+)/);
        if (quotaMatch) {
          setQuotaInfo({
            used: parseInt(quotaMatch[1]),
            total: parseInt(quotaMatch[2])
          });
        }
        setShowQuotaError(true);
      } else {
        setToast({ 
          message: errorMessage, 
          type: 'error' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    console.log('Download ticket:', generatedTicket);
    setToast({ message: 'Ticket downloaded successfully!', type: 'success' });
  };

  const handleShare = () => {
    console.log('Share ticket:', generatedTicket);
    setToast({ message: 'Ticket shared successfully!', type: 'success' });
  };

  return (
    <div 
      className="min-h-screen pb-32"
      style={{ backgroundColor: 'rgb(12, 12, 12)' }}
    >
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type}
          onClose={() => setToast(null)} 
        />
      )}

      {showSuccess && generatedTicket && (
        <TicketQRModal
          ticket={generatedTicket}
          event={currentEvent || {
            name: 'Event Name',
            date: new Date().toISOString(),
            location: 'Event Location'
          }}
          onClose={() => setShowSuccess(false)}
        />
      )}

      {showQuotaError && (
        <QuotaErrorModal
          onClose={() => {
            setShowQuotaError(false);
            setQuotaInfo(null);
          }}
          quotaInfo={quotaInfo}
        />
      )}

      {/* Header */}
      <div 
        className="px-6 pt-6 pb-4 mb-6"
        style={{ backgroundColor: 'rgb(12, 12, 12)' }}
      >
        <h1 
          className="text-3xl font-bold mb-2"
          style={{ color: 'white' }}
        >
          Generate Ticket
        </h1>
        <p 
          className="text-base mb-3"
          style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}
        >
          Enter buyer information to create a new ticket
        </p>
        
        {currentEvent && (
          <div 
            className="rounded-lg p-4"
            style={{ backgroundColor: 'rgb(33, 42, 55)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium" style={{ color: 'rgb(34, 197, 94)' }}>
                🎫 {currentEvent.name}
              </p>
              {currentEvent.ticket_price && (
                <div 
                  className="px-2 py-1 rounded text-xs font-bold"
                  style={{ backgroundColor: 'rgb(34, 197, 94)', color: 'white' }}
                >
                  {currentEvent.ticket_price} NSL
                </div>
              )}
            </div>
            <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>
              {new Date(currentEvent.event_date || currentEvent.date).toLocaleDateString()} • {currentEvent.location}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgb(248, 248, 255)', opacity: 0.5 }}>
              Capacity: {currentEvent.max_capacity} • Sold: {currentEvent.tickets_sold || 0}
            </p>
          </div>
        )}
        
        {!currentEvent && (
          <div 
            className="rounded-lg p-3"
            style={{ backgroundColor: 'rgb(239, 68, 68, 0.1)', border: '1px solid rgb(239, 68, 68, 0.3)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'rgb(239, 68, 68)' }}>
                  ⚠️ No Active Event
                </p>
                <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }}>
                  Contact admin to get assigned to an event
                </p>
              </div>
              {user?.role === 'seller' && (
                <button
                  onClick={refreshCurrentEvent}
                  className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Refresh
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Form Container */}
      <div className="px-6">
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ backgroundColor: 'rgb(33, 42, 55)' }}
        >
          <div className="space-y-5">
            <Input
              label="Buyer Name"
              type="text"
              placeholder="Enter buyer's full name"
              icon={User}
              value={buyerName}
              onChange={(e) => {
                setBuyerName(e.target.value);
                handleChange('buyerName', e.target.value, validateBuyerName);
              }}
              onBlur={() => handleBlur('buyerName', validateBuyerName, buyerName)}
              error={touched.buyerName ? errors.buyerName : ''}
              disabled={isLoading}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="buyer@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                handleChange('email', e.target.value, validateEmail);
              }}
              onBlur={() => handleBlur('email', validateEmail, email)}
              error={touched.email ? errors.email : ''}
              disabled={isLoading}
              autoComplete="email"
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 000-0000"
              icon={Phone}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                handleChange('phone', e.target.value, validatePhone);
              }}
              onBlur={() => handleBlur('phone', validatePhone, phone)}
              error={touched.phone ? errors.phone : ''}
              disabled={isLoading}
              autoComplete="tel"
            />
          </div>
        </div>

        {/* Info Card */}
        <div 
          className="rounded-xl p-4 mb-6"
          style={{ backgroundColor: 'rgb(33, 42, 55)' }}
        >
          <div className="flex gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgb(59, 130, 246, 0.2)' }}
            >
              <Ticket size={20} style={{ color: 'rgb(59, 130, 246)' }} />
            </div>
            <div>
              <p 
                className="text-sm font-semibold mb-1"
                style={{ color: 'white' }}
              >
                Ticket Information
              </p>
              <p 
                className="text-xs"
                style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}
              >
                A unique ticket ID will be generated and sent to the buyer's email address. They can use this to enter the event.
              </p>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-4 rounded-lg font-semibold text-base transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          style={{
            backgroundColor: 'rgb(59, 130, 246)',
            color: 'white',
          }}
        >
          {isLoading ? (
            <>
              <svg 
                className="animate-spin -ml-1 mr-3 h-5 w-5" 
                style={{ color: 'white' }}
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating Ticket...
            </>
          ) : (
            <>
              <Ticket size={20} className="mr-2" />
              Generate Ticket
            </>
          )}
        </button>
      </div>

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

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}