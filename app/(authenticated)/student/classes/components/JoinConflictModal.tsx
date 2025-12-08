// app/(authenticated)/student/classes/components/JoinConflictModal.tsx
"use client";

import React from 'react';
import { X, AlertTriangle, Calendar } from 'lucide-react';
import { CalendarEvent } from '@/types/calendar';
import { useThemeContext } from "@/app/(authenticated)/components/ThemeContext";

interface JoinConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  newClassName: string;
  conflicts: CalendarEvent[];
}

export default function JoinConflictModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  newClassName,
  conflicts 
}: JoinConflictModalProps) {
  const { theme } = useThemeContext();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-components-bg)] w-full max-w-md rounded-2xl shadow-xl border border-[var(--color-border)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-start bg-amber-50 dark:bg-amber-900/10">
          <div className="flex gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-500">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Conflict Detected</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                The class <strong>{newClassName}</strong> overlaps with your existing schedule.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            Conflicting Event{conflicts.length > 1 ? 's' : ''}:
          </p>
          
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {conflicts.map((conflict) => (
              <div 
                key={conflict.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bar-bg)]"
              >
                <Calendar size={18} className="text-red-500" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[var(--color-text-primary)] truncate">
                    {conflict.title}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {conflict.subjectCode ? `${conflict.subjectCode} • ` : ''} 
                    {conflict.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                    {conflict.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div 
            className="p-3 rounded-lg text-xs"
            style={{
               backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
               color: theme === 'dark' ? '#93C5FD' : '#1E40AF'
            }}
          >
            <p>
              <strong>Tip:</strong> If "<strong>{conflicts[0]?.title}</strong>" is actually the same class you manually added earlier, you can force join now.
            </p>
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-primary)] font-medium hover:bg-[var(--color-hover)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            Join Anyway
          </button>
        </div>
      </div>
    </div>
  );
}