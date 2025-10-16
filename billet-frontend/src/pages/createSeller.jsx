import React, { useState } from 'react';
import { X, User, Mail, Lock, Hash, AtSign } from 'lucide-react';

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
          className="block text-sm font-medium mb-2"
          style={{ color: 'rgb(248, 248, 255)' }}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Icon size={18} style={{ color: 'rgb(248, 248, 255)', opacity: 0.6 }} />
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`
            w-full py-3
            border-2 rounded-lg
            text-sm
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-10 pr-3' : 'px-3'}
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
          className="mt-1 text-xs text-red-400"
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

// Validation functions
const validateName = (name) => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  return '';
};

const validateUsername = (username) => {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
  return '';
};

const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return '';
};

const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return '';
};

const validateQuota = (quota) => {
  if (!quota) return 'Quota is required';
  if (isNaN(quota) || Number(quota) < 1) return 'Quota must be at least 1';
  if (Number(quota) > 10000) return 'Quota cannot exceed 10,000';
  return '';
};

// Create Seller Popup Component
export default function CreateSellerPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [quota, setQuota] = useState('');
  
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
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setQuota('');
    setErrors({});
    setTouched({});
  };

  const handleSubmit = async () => {
    // Validate all fields
    const newErrors = {
      name: validateName(name),
      username: validateUsername(username),
      email: validateEmail(email),
      password: validatePassword(password),
      quota: validateQuota(quota),
    };
    
    setErrors(newErrors);
    setTouched({
      name: true,
      username: true,
      email: true,
      password: true,
      quota: true,
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real app: 
      // const response = await fetch('/api/admin/sellers/create', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     name,
      //     username,
      //     email,
      //     password,
      //     quota: Number(quota)
      //   })
      // });
      
      setToast({ message: 'Seller created successfully!', type: 'success' });
      
      setTimeout(() => {
        resetForm();
        setIsOpen(false);
        console.log('Seller Created:', { name, username, email, quota });
      }, 1500);
      
    } catch (error) {
      setToast({ 
        message: error.message || 'Failed to create seller. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      setIsOpen(false);
    }
  };

  return (
    <div>
      {/* Demo Button to Open Popup */}
      <div 
        className="min-h-screen flex items-center justify-center p-6"
        style={{ backgroundColor: 'rgb(12, 12, 12)' }}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="px-6 py-4 rounded-lg font-semibold text-base transition-all duration-200 active:scale-95"
          style={{
            backgroundColor: 'rgb(59, 130, 246)',
            color: 'white',
          }}
        >
          Open Create Seller Popup
        </button>
      </div>

      {/* Popup Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-0 sm:p-6"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={handleClose}
        >
          {toast && (
            <Toast 
              message={toast.message} 
              type={toast.type}
              onClose={() => setToast(null)} 
            />
          )}

          {/* Popup Content */}
          <div
            className="w-full max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden animate-slide-up"
            style={{ backgroundColor: 'rgb(33, 42, 55)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between p-6 pb-4"
              style={{ borderBottom: '1px solid rgb(33, 33, 33)' }}
            >
              <h2 
                className="text-xl font-bold"
                style={{ color: 'white' }}
              >
                Create New Seller
              </h2>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: 'rgb(33, 33, 33)' }}
              >
                <X size={20} style={{ color: 'rgb(248, 248, 255)' }} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                icon={User}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  handleChange('name', e.target.value, validateName);
                }}
                onBlur={() => handleBlur('name', validateName, name)}
                error={touched.name ? errors.name : ''}
                disabled={isLoading}
              />

              <Input
                label="Username"
                type="text"
                placeholder="johndoe"
                icon={AtSign}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  handleChange('username', e.target.value, validateUsername);
                }}
                onBlur={() => handleBlur('username', validateUsername, username)}
                error={touched.username ? errors.username : ''}
                disabled={isLoading}
              />

              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
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
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  handleChange('password', e.target.value, validatePassword);
                }}
                onBlur={() => handleBlur('password', validatePassword, password)}
                error={touched.password ? errors.password : ''}
                disabled={isLoading}
                autoComplete="new-password"
              />

              <Input
                label="Ticket Quota"
                type="number"
                placeholder="100"
                icon={Hash}
                value={quota}
                onChange={(e) => {
                  setQuota(e.target.value);
                  handleChange('quota', e.target.value, validateQuota);
                }}
                onBlur={() => handleBlur('quota', validateQuota, quota)}
                error={touched.quota ? errors.quota : ''}
                disabled={isLoading}
                min="1"
                max="10000"
              />

              <div 
                className="rounded-lg p-3 mt-4"
                style={{ backgroundColor: 'rgb(33, 33, 33)' }}
              >
                <p 
                  className="text-xs"
                  style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}
                >
                  💡 The seller will be able to sell up to {quota || '0'} tickets for your event.
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div 
              className="p-6 pt-4 flex gap-3"
              style={{ borderTop: '1px solid rgb(33, 33, 33)' }}
            >
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 py-3 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-95 disabled:opacity-50"
                style={{
                  backgroundColor: 'rgb(33, 33, 33)',
                  color: 'rgb(248, 248, 255)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 py-3 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-95 disabled:opacity-70 flex items-center justify-center"
                style={{
                  backgroundColor: 'rgb(59, 130, 246)',
                  color: 'white',
                }}
              >
                {isLoading ? (
                  <>
                    <svg 
                      className="animate-spin -ml-1 mr-2 h-4 w-4" 
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
                    Creating...
                  </>
                ) : (
                  'Create Seller'
                )}
              </button>
            </div>
          </div>
        </div>
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

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        /* Smooth scrolling for form */
        .overflow-y-auto {
          -webkit-overflow-scrolling: touch;
        }

        /* Hide scrollbar but keep functionality */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgb(33, 33, 33);
          border-radius: 2px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgb(59, 130, 246);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}