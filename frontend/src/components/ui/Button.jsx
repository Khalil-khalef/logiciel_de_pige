import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  startIcon,
  endIcon,
  className = '',
  ...props
}) => {
  // Configuration des tailles
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // Configuration des variantes
  const variantClasses = {
    primary: `
      bg-accent-primary 
      text-background-primary 
      hover:bg-accent-primary/90 
      focus:ring-2 focus:ring-accent-primary/50 
      disabled:opacity-70 disabled:cursor-not-allowed
    `,
    secondary: `
      bg-transparent 
      border border-accent-primary 
      text-accent-primary 
      hover:bg-accent-primary/10 
      focus:ring-2 focus:ring-accent-primary/30
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
    danger: `
      bg-red-600 
      text-white 
      hover:bg-red-700 
      focus:ring-2 focus:ring-red-500/50
      disabled:opacity-70 disabled:cursor-not-allowed
    `,
    ghost: `
      bg-transparent 
      text-text-primary 
      hover:bg-background-card 
      focus:ring-2 focus:ring-accent-primary/30
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`
        inline-flex items-center justify-center 
        rounded-2xl
        font-medium 
        transition-all duration-200 ease-in-out
        focus:outline-none
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Chargement...
        </>
      ) : (
        <>
          {startIcon && <span className="mr-2">{startIcon}</span>}
          {children}
          {endIcon && <span className="ml-2">{endIcon}</span>}
        </>
      )}
    </motion.button>
  );
};

export default Button;
