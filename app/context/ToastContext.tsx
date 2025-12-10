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
  closing?: boolean;
}

interface ToastContextType {
  showToast: (title: string, message?: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, closing: true } : t)));

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const showToast = useCallback((title: string, message?: string, type: ToastType = "info") => {
    const id = Date.now().toString();
    const newToast = { id, title, message, type, closing: false };
    
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed z-[100] flex flex-col gap-3 pointer-events-none 
                      top-4 left-4 right-4 
                      md:top-6 md:right-6 md:left-auto md:w-full md:max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border 
              transition-all duration-300 transform
              ${toast.closing ? "toast-exit" : "toast-enter"}
              ${toast.type === 'success' ? 'bg-white border-green-200 dark:bg-slate-800 dark:border-green-900' : ''}
              ${toast.type === 'error' ? 'bg-white border-red-200 dark:bg-slate-800 dark:border-red-900' : ''}
              ${toast.type === 'info' ? 'bg-white border-blue-200 dark:bg-slate-800 dark:border-blue-900' : ''}
              ${toast.type === 'warning' ? 'bg-white border-amber-200 dark:bg-slate-800 dark:border-amber-900' : ''} 
            `}
          >
            <div className="flex-shrink-0 pt-0.5">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 break-words">
                {toast.title}
              </h3>
              {toast.message && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 break-words">
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