import React from 'react';

export default function Card({ children, className = '', onClick, role = 'group' }) {
  return (
    <div
      role={role}
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}
    >
      {children}
    </div>
  );
}