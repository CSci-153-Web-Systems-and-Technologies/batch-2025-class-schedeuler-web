"use client";

import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerContent?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, className = "max-w-lg", headerContent, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-[var(--color-components-bg)] w-full ${className} rounded-2xl shadow-xl border border-[var(--color-border)] flex flex-col max-h-[90vh]`}>
        
        <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            {title && <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{title}</h2>}
            {headerContent}
          </div>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-0">
          {children}
        </div>

        {footer && (
          <div className="p-6 border-t border-[var(--color-border)] flex-shrink-0 bg-[var(--color-components-bg)] rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}