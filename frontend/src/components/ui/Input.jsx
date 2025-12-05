import React from 'react';

const Input = ({
  id,
  name,
  type = 'text',
  label,
  placeholder = '',
  value,
  onChange,
  onBlur,
  error,
  helperText,
  disabled = false,
  required = false,
  autoComplete = 'off',
  startIcon,
  endIcon,
  className = '',
  inputClassName = '',
  ...props
}) => {
  const hasError = !!error;
  const inputId = id || name;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className={`block text-sm font-medium ${
            hasError ? 'text-red-400' : 'text-text-primary'
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      
      <div className="relative rounded-xl">
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {React.cloneElement(startIcon, {
              className: `h-5 w-5 ${
                hasError ? 'text-red-400' : 'text-text-secondary'
              }`
            })}
          </div>
        )}
        
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className={`block w-full py-3 ${
            startIcon ? 'pl-10' : 'pl-4'
          } pr-4 bg-background-secondary border ${
            hasError 
              ? 'border-red-500/50 focus:ring-red-500/30' 
              : 'border-border-light/20 focus:ring-accent-primary/50'
          } rounded-xl text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${inputClassName}`}
          placeholder={placeholder}
          {...props}
        />
        
        {endIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {React.cloneElement(endIcon, {
              className: `h-5 w-5 ${
                hasError ? 'text-red-400' : 'text-text-secondary'
              }`
            })}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${hasError ? 'text-red-400' : 'text-text-secondary'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
