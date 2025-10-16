import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Input Component
const Input = React.forwardRef(({ 
  label, 
  error, 
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
      
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={`
          w-full px-4 py-4 
          border-2 rounded-lg
          text-base
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
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

// Validation Schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});



// Admin/Seller Login Page
export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setToast(null);

    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        setToast({ message: 'Login successful! Redirecting...', type: 'success' });
        // Let the route component handle the redirect based on user role
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setToast({ 
        message: error.message || 'Login failed. Please try again.', 
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
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ color: 'white' }}
            >
              Welcome Back
            </h1>
            <p 
              className="text-base"
              style={{ color: 'rgb(248, 248, 255)' }}
            >
              Sign in to your account
            </p>
          </div>
          
          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              disabled={isLoading}
              autoComplete="email"
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              error={errors.password?.message}
              disabled={isLoading}
              autoComplete="current-password"
              {...register('password')}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-lg font-semibold text-base transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          {/* Footer Link */}
          <div className="mt-6 text-center">
            <a 
              href="#"
              className="text-sm hover:underline"
              style={{ color: 'rgb(248, 248, 255)' }}
            >
              Forgot password?
            </a>
          </div>

        
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
      `}</style>
    </div>
  );
}