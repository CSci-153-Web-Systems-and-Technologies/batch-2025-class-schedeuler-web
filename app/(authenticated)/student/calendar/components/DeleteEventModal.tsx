// app/(authenticated)/student/calendar/components/DeleteEventModal.tsx
import React from 'react';
import { CalendarEvent, EventType, RepeatPattern } from '@/types/calendar';

interface DeleteEventModalProps {
  event: CalendarEvent;
  // onConfirm now takes 'deleteOption' argument for recurring events
  onConfirm: (deleteOption: 'this' | 'all' | 'future') => void; 
  onCancel: () => void;
}

const DeleteEventModal: React.FC<DeleteEventModalProps> = ({
  event,
  onConfirm,
  onCancel,
}) => {
  // Check if it's a recurring event or an instance of one
  const isRecurringBase = event.type === EventType.SUBJECT && event.repeatPattern !== RepeatPattern.NONE;
  const isRecurringInstance = event.id.includes('-') && event.type === EventType.SUBJECT;

  const showRecurringOptions = isRecurringBase || isRecurringInstance;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--color-components-bg)] rounded-lg p-6 w-full max-w-sm border border-[var(--color-border)]">
        <h2 className="text-xl font-bold mb-3 text-[var(--color-text-primary)]">
          Delete Event
        </h2>
        
        <p className="mb-4 text-[var(--color-text-primary)]">
          Are you sure you want to delete the event: <strong className="font-semibold">{event.title}</strong>?
        </p>

        {showRecurringOptions && (
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              This is a recurring event. How would you like to delete it?
            </h3>
            
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onConfirm('this')}
                className="w-full text-left p-3 rounded-md hover:bg-[var(--color-hover)] transition-colors text-[var(--color-text-primary)] border border-[var(--color-border)]"
              >
                Delete only this occurrence
              </button>
              
              <button
                type="button"
                onClick={() => onConfirm('future')}
                className="w-full text-left p-3 rounded-md hover:bg-[var(--color-hover)] transition-colors text-[var(--color-text-primary)] border border-[var(--color-border)]"
              >
                Delete this and all future occurrences
              </button>
              
              <button
                type="button"
                onClick={() => onConfirm('all')}
                className="w-full text-left p-3 rounded-md hover:bg-[var(--color-hover)] transition-colors text-[var(--color-text-primary)] border border-[var(--color-border)]"
              >
                Delete all occurrences in the series
              </button>
            </div>
          </div>
        )}
        
        {!showRecurringOptions && (
            <div className="mb-6">
                <button
                    type="button"
                    onClick={() => onConfirm('all')} // 'all' acts as the only option for non-recurring events
                    className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                    Confirm Delete
                </button>
            </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-[var(--color-border)] rounded hover:bg-[var(--color-hover)] transition-colors text-[var(--color-text-primary)]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteEventModal;