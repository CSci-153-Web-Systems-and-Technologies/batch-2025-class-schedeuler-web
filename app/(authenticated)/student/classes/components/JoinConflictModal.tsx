// app/(authenticated)/student/classes/components/JoinConflictModal.tsx
"use client";

import React from 'react';
import { X, AlertTriangle, Calendar, Replace } from 'lucide-react';
import { CalendarEvent, EventType } from '@/types/calendar';
import { useThemeContext } from "@/app/(authenticated)/components/ThemeContext";
import { Button } from '@/app/components/ui/Button';

interface JoinConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void; 
  onConfirmReplace: () => void; 
  newClassName: string;
  conflicts: CalendarEvent[];
  isReplacingManualSubject: boolean; 
}

export default function JoinConflictModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  onConfirmReplace, 
  newClassName,
  conflicts,
  isReplacingManualSubject
}: JoinConflictModalProps) {
  const { theme } = useThemeContext();

  if (!isOpen) return null;
  
  const manualConflict = conflicts.find(c => !c.id.startsWith('class_') && c.type === EventType.SUBJECT);
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-components-bg)] w-full max-w-md rounded-2xl shadow-xl border border-[var(--color-border)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-start bg-amber-50 dark:bg-amber-900/10">
          <div className="flex gap-3">
            <div className="size-10 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-500 flex-shrink-0">
              <AlertTriangle size={20} />
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
          
          {isReplacingManualSubject && manualConflict && (
            <div 
                className="p-3 rounded-lg text-sm font-medium"
                style={{
                    backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
                    color: theme === 'dark' ? '#93C5FD' : '#1E40AF'
                }}
            >
                <p className='font-bold mb-1'>Intelligent Conflict Detection:</p>
                <p>
                    It looks like you manually entered this schedule as '<strong>{manualConflict.title}</strong>'.
                    Do you want to replace your manual entry with the official class?
                </p>
            </div>
          )}
          
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            Conflicting Event{conflicts.length > 1 ? 's' : ''}:
          </p>
          
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
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
                    {conflict.id.startsWith('class_') ? ' (Official Class)' : ' (Manual Entry)'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 py-2.5 text-[var(--color-text-primary)] font-medium transition-colors"
          >
            Cancel
          </Button>
          
          {isReplacingManualSubject && manualConflict ? (
            <Button
                onClick={onConfirmReplace}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
                <Replace size={16} className="mr-1.5" /> Replace '{manualConflict.title.slice(0, 10)}...'
            </Button>
          ) : (
             <Button
                onClick={onConfirm}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
                Join Anyway
            </Button>
          )}
        </div>
        
        {isReplacingManualSubject && (
            <div className='px-6 pb-6 pt-0'>
                 <Button
                    onClick={onConfirm}
                    variant="ghost"
                    className="w-full text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                >
                    Keep Old Entry and Join Anyway
                </Button>
            </div>
        )}

      </div>
    </div>
  );
}