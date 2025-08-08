'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  show: boolean;
  onClose: () => void;
}

export default function Toast({ message, type, show, onClose }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
      <div className={`
        flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg
        ${typeStyles[type]}
      `}>
        <span className="text-lg">{icons[type]}</span>
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-lg hover:opacity-70"
          aria-label="閉じる"
        >
          ×
        </button>
      </div>
    </div>
  );
}