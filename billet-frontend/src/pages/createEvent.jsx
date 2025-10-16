import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, FileText, Tag, Clock, Users, DollarSign } from 'lucide-react';
import EventService from '../services/eventService';

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

// Textarea Component
const Textarea = React.forwardRef(({ 
  label, 
  error, 
  icon: Icon,
  className = '', 
  id,
  rows = 4,
  ...props 
}, ref) => {
  const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
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
          <div className="absolute left-4 top-4">
            <Icon size={20} style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }} />
          </div>
        )}
        
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={`
            w-full py-4 
            border-2 rounded-lg
            text-base
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-none
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

Textarea.displayName = 'Textarea';

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

// Validation functions
const validateEventName = (name) => {
  if (!name) return 'Event name is required';
  if (name.length < 3) return 'Event name must be at least 3 characters';
  return '';
};

const validateDate = (date) => {
  if (!date) return 'Event date is required';
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) return 'Event date cannot be in the past';
  return '';
};

const validateLocation = (location) => {
  if (!location) return 'Location is required';
  if (location.length < 3) return 'Location must be at least 3 characters';
  return '';
};

const validateTime = (time) => {
  if (!time) return 'Event time is required';
  return '';
};

const validateCapacity = (capacity) => {
  if (!capacity) return 'Max capacity is required';
  if (isNaN(capacity) || Number(capacity) < 1) return 'Please enter a valid capacity';
  return '';
};

const validateTicketPrice = (price) => {
  if (!price) return 'Ticket price is required';
  if (isNaN(price) || Number(price) < 0) return 'Please enter a valid price';
  return '';
};

export default function CreateEventPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('100');
  const [ticketPrice, setTicketPrice] = useState('');
  const [description, setDescription] = useState('');
  
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

  const handleSubmit = async () => {
    // Validate all fields
    const newErrors = {
      eventName: validateEventName(eventName),
      eventDate: validateDate(eventDate),
      eventTime: validateTime(eventTime),
      location: validateLocation(location),
      maxCapacity: validateCapacity(maxCapacity),
      ticketPrice: validateTicketPrice(ticketPrice),
    };
    
    setErrors(newErrors);
    setTouched({
      eventName: true,
      eventDate: true,
      eventTime: true,
      location: true,
      maxCapacity: true,
      ticketPrice: true,
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
      const result = await EventService.createEvent({
        eventName,
        eventDate,
        eventTime,
        location,
        maxCapacity,
        ticketPrice,
        description
      });
      
      if (result.success) {
        // Store complete event data for context
        if (result.data) {
          localStorage.setItem('eventId', result.data.id);
          localStorage.setItem('currentEvent', JSON.stringify(result.data));
          console.log('✅ Event created and stored:', result.data);
        }
        
        setToast({ message: 'Event created successfully! Redirecting...', type: 'success' });
        
        setTimeout(() => {
          navigate('/menu');
        }, 1500);
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      setToast({ 
        message: error.message || 'Failed to create event. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgb(12, 12, 12)' }}
    >
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type}
          onClose={() => setToast(null)} 
        />
      )}

      <div className="w-full max-w-md">
        <div 
          className="rounded-2xl p-8 shadow-2xl"
          style={{ backgroundColor: 'rgb(33, 42, 55)' }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: 'rgb(59, 130, 246)' }}
            >
              <Calendar size={32} style={{ color: 'white' }} />
            </div>
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ color: 'white' }}
            >
              Create Your Event
            </h1>
            <p 
              className="text-base"
              style={{ color: 'rgb(248, 248, 255)' }}
            >
              Set up your event details to get started
            </p>
          </div>
          
          {/* Create Event Form */}
          <div className="space-y-5">
            <Input
              label="Event Name"
              type="text"
              placeholder="e.g., Summer Music Festival 2025"
              icon={Tag}
              value={eventName}
              onChange={(e) => {
                setEventName(e.target.value);
                handleChange('eventName', e.target.value, validateEventName);
              }}
              onBlur={() => handleBlur('eventName', validateEventName, eventName)}
              error={touched.eventName ? errors.eventName : ''}
              disabled={isLoading}
            />

            <div className="w-full">
              <label 
                className="block text-base font-medium mb-2"
                style={{ color: 'rgb(248, 248, 255)' }}
              >
                Event Date
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                  <Calendar size={20} style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }} />
                </div>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => {
                    setEventDate(e.target.value);
                    handleChange('eventDate', e.target.value, validateDate);
                  }}
                  onBlur={() => handleBlur('eventDate', validateDate, eventDate)}
                  disabled={isLoading}
                  className={`
                    w-full pl-12 pr-4 py-4
                    border-2 rounded-lg
                    text-base
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    disabled:opacity-50 disabled:cursor-not-allowed
                    date-input
                    ${touched.eventDate && errors.eventDate
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'focus:ring-blue-400 focus:border-blue-400'
                    }
                  `}
                  style={{
                    backgroundColor: 'rgb(33, 33, 33)',
                    borderColor: touched.eventDate && errors.eventDate ? '#ef4444' : 'rgb(33, 42, 55)',
                    color: 'rgb(248, 248, 255)',
                    colorScheme: 'dark',
                    '--tw-ring-offset-color': 'rgb(12, 12, 12)',
                  }}
                />
              </div>
              {touched.eventDate && errors.eventDate && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.eventDate}
                </p>
              )}
            </div>

            <Input
              label="Location"
              type="text"
              placeholder="e.g., Central Park, New York"
              icon={MapPin}
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                handleChange('location', e.target.value, validateLocation);
              }}
              onBlur={() => handleBlur('location', validateLocation, location)}
              error={touched.location ? errors.location : ''}
              disabled={isLoading}
            />

            <Input
              label="Event Time"
              type="time"
              icon={Clock}
              value={eventTime}
              onChange={(e) => {
                setEventTime(e.target.value);
                handleChange('eventTime', e.target.value, validateTime);
              }}
              onBlur={() => handleBlur('eventTime', validateTime, eventTime)}
              error={touched.eventTime ? errors.eventTime : ''}
              disabled={isLoading}
            />

            <Input
              label="Max Capacity"
              type="number"
              placeholder="100"
              icon={Users}
              value={maxCapacity}
              onChange={(e) => {
                setMaxCapacity(e.target.value);
                handleChange('maxCapacity', e.target.value, validateCapacity);
              }}
              onBlur={() => handleBlur('maxCapacity', validateCapacity, maxCapacity)}
              error={touched.maxCapacity ? errors.maxCapacity : ''}
              disabled={isLoading}
              min="1"
            />

            <Input
              label="Ticket Price (NSL)"
              type="number"
              placeholder="5000"
              icon={DollarSign}
              value={ticketPrice}
              onChange={(e) => {
                setTicketPrice(e.target.value);
                handleChange('ticketPrice', e.target.value, validateTicketPrice);
              }}
              onBlur={() => handleBlur('ticketPrice', validateTicketPrice, ticketPrice)}
              error={touched.ticketPrice ? errors.ticketPrice : ''}
              disabled={isLoading}
              min="0"
              step="0.01"
            />

            <Textarea
              label="Description (Optional)"
              placeholder="Tell people about your event..."
              icon={FileText}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-4 rounded-lg font-semibold text-base transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-6"
              style={{
                backgroundColor: 'white',
                color: 'rgb(12, 12, 12)',
              }}
            >
              {isLoading ? (
                <>
                  <svg 
                    className="animate-spin -ml-1 mr-3 h-5 w-5" 
                    style={{ color: 'rgb(12, 12, 12)' }}
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
                  Creating Event...
                </>
              ) : (
                'Create Event'
              )}
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div 
          className="mt-6 p-4 rounded-lg text-sm"
          style={{ backgroundColor: 'rgb(33, 42, 55)' }}
        >
          <p className="font-semibold mb-2" style={{ color: 'white' }}>
            💡 Quick Tip
          </p>
          <p style={{ color: 'rgb(248, 248, 255)', opacity: 0.8 }}>
            After creating your event, you'll be able to add sellers, generate tickets, and track sales from your dashboard.
          </p>
        </div>
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

        /* Style date and time inputs */
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }

        /* Custom scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
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
      `}</style>
    </div>
  );
}