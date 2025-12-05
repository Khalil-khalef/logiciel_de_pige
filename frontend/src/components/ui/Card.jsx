import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  title,
  description,
  className = '',
  padding = 'p-6',
  hoverEffect = true,
  ...props
}) => {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' } : {}}
      className={`
        bg-background-card 
        rounded-xl 
        border border-border-light/10 
        overflow-hidden 
        transition-all duration-200 ease-in-out
        ${hoverEffect ? 'hover:shadow-lg' : ''}
        ${className}
      `}
      {...props}
    >
      {(title || description) && (
        <div className="border-b border-border-light/10 px-6 py-4">
          {title && <h3 className="text-lg font-semibold text-text-primary">{title}</h3>}
          {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
        </div>
      )}
      <div className={padding}>
        {children}
      </div>
    </motion.div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 border-b border-border-light/10 ${className}`} {...props}>
    {children}
  </div>
);

const CardContent = ({ children, className = '', ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 bg-background-secondary/50 border-t border-border-light/10 ${className}`} {...props}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
