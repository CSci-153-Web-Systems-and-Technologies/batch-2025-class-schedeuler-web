"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import "@/app/globals.css";
export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  closing?: boolean; // New: Tracks if the toast is currently leaving
}

interface ToastContextType {
  showToast: (title: string, message?: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    // 1. Trigger the exit animation first
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, closing: true } : t)));

    // 2. Wait for animation (300ms) before removing from DOM
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const showToast = useCallback((title: string, message?: string, type: ToastType = "info") => {
    const id = Date.now().toString();
    // Start with closing: false
    const newToast = { id, title, message, type, closing: false };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* CONTAINER: Fixed to Top-Right */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            // Apply 'toast-exit' if closing, otherwise 'toast-enter'
            className={`
              pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border 
              ${toast.closing ? "toast-exit" : "toast-enter"}
              ${toast.type === 'success' ? 'bg-white border-green-200 dark:bg-slate-800 dark:border-green-900' : ''}
              ${toast.type === 'error' ? 'bg-white border-red-200 dark:bg-slate-800 dark:border-red-900' : ''}
              ${toast.type === 'info' ? 'bg-white border-blue-200 dark:bg-slate-800 dark:border-blue-900' : ''}
              ${toast.type === 'warning' ? 'bg-white border-amber-200 dark:bg-slate-800 dark:border-amber-900' : ''} 
            `}
          >
            {/* ICON */}
            <div className="flex-shrink-0 pt-0.5">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
            </div>

            {/* CONTENT */}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {toast.title}
              </h3>
              {toast.message && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {toast.message}
                </p>
              )}
            </div>

            {/* CLOSE BUTTON */}
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}