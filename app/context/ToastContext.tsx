"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"; // [FIX] Import AlertTriangle

// [FIX] Add 'warning' to the type definition
export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (title: string, message?: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, message?: string, type: ToastType = "info") => {
    const id = Date.now().toString();
    const newToast = { id, title, message, type };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* TOAST CONTAINER */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border transition-all duration-300 animate-in slide-in-from-right-full
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
              {/* [FIX] Add Warning Icon */}
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