// app/(authenticated)/student/calendar/components/DeleteEventModal.tsx
import React from 'react';
import { CalendarEvent, EventType, RepeatPattern } from '@/types/calendar';

interface DeleteEventModalProps {
  event: CalendarEvent;
  onConfirm: (deleteOption: 'this' | 'all' | 'future') => void; 
  onCancel: () => void;
}

const DeleteEventModal: React.FC<DeleteEventModalProps> = ({
  event,
  onConfirm,
  onCancel,
}) => {
  const isRecurringBase = event.type === EventType.SUBJECT && event.repeatPattern !== RepeatPattern.NONE;
  const isRecurringInstance = event.id.includes('_') && event.type === EventType.SUBJECT;

  const showRecurringOptions = isRecurringBase || isRecurringInstance;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[var(--color-components-bg)] rounded-lg p-6 w-full max-w-sm border border-[var(--color-border)] shadow-xl">
        <h2 className="text-xl font-bold mb-3 text-[var(--color-text-primary)]">
          Delete Event
        </h2>
        
        <p className="mb-6 text-[var(--color-text-primary)] text-sm">
          Are you sure you want to delete <strong className="font-semibold">{event.title}</strong>? This action cannot be undone.
        </p>

        {showRecurringOptions ? (
          <>
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                This is a recurring event. How would you like to delete it?
              </h3>
              
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => onConfirm('this')}
                  className="w-full text-left p-3 rounded-md hover:bg-[var(--color-hover)] transition-colors text-[var(--color-text-primary)] border border-[var(--color-border)] text-sm"
                >
                  Delete only this occurrence
                </button>
                
                <button
                  type="button"
                  onClick={() => onConfirm('future')}
                  className="w-full text-left p-3 rounded-md hover:bg-[var(--color-hover)] transition-colors text-[var(--color-text-primary)] border border-[var(--color-border)] text-sm"
                >
                  Delete this and all future occurrences
                </button>
                
                <button
                  type="button"
                  onClick={() => onConfirm('all')}
                  className="w-full text-left p-3 rounded-md hover:bg-[var(--color-hover)] transition-colors text-[var(--color-text-primary)] border border-[var(--color-border)] text-sm"
                >
                  Delete all occurrences in the series
                </button>
              </div>
            </div>
            
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-hover)] transition-colors text-[var(--color-text-primary)] text-sm font-medium"
                >
                    Cancel
                </button>
            </div>
          </>
        ) : (
          <div className="flex gap-3">
            <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-hover)] transition-colors text-[var(--color-text-primary)] font-medium"
            >
                Cancel
            </button>
            <button
                type="button"
                onClick={() => onConfirm('all')} 
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
            >
                Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteEventModal;