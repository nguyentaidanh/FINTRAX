
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, style, className }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
      style={style}
    >
      {children}
    </span>
  );
};

export default Badge;
