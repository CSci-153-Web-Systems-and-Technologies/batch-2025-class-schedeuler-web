// app/(authenticated)/student/calendar/components/EventModal.tsx
import React, { useState, useEffect } from 'react';
import { CalendarEvent, EventType, RepeatPattern } from '@/types/calendar';
import { SlotInfo } from 'react-big-calendar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/DatePickerStyles.css'; 
import { useToast } from '@/app/context/ToastContext'; 
import { Lock } from 'lucide-react';

interface EventModalProps {
  event?: CalendarEvent | null;
  slotInfo?: SlotInfo | null;
  onSave: (event: CalendarEvent) => void;
  onDelete: () => void;
  onClose: () => void;
  isScheduleOnly?: boolean; 
  disableSubjectCreation?: boolean; 
}

const COLOR_OPTIONS = [
  '#D9F99D', '#C7D2FE', '#FBCFE8', '#BAE6FD', '#FDE68A', '#A7F3D0', 
  '#DDD6FE', '#F5D0FE', '#FECACA', '#FED7AA', '#E2E8F0', '#99F6E4'
];

const EventModal: React.FC<EventModalProps> = ({
  event,
  slotInfo,
  onSave,
  onDelete,
  onClose,
  isScheduleOnly = false,
  disableSubjectCreation = false,
}) => {
  const { showToast } = useToast(); 

  const isOfficialClass = event?.id?.startsWith('class_');
  
  const shouldDefaultToSubject = isScheduleOnly;
  
  const defaultEvent = shouldDefaultToSubject
    ? {
        type: EventType.SUBJECT,
        color: COLOR_OPTIONS[0],
        repeatPattern: RepeatPattern.WEEKLY, 
      }
    : {
        type: EventType.TASK,
        color: COLOR_OPTIONS[2],
        repeatPattern: RepeatPattern.NONE,
      };
      
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    start: new Date(),
    end: new Date(),
    priority: 'medium',
    ...defaultEvent
  });

  useEffect(() => {
    if (event) {
      const { allDay, ...restEvent } = event as any; 
      setFormData(restEvent);
    } else if (slotInfo) {
      setFormData(prev => ({
        ...prev,
        start: slotInfo.start,
        // [FIX] Use slotInfo.end directly to capture the actual drag duration
        end: slotInfo.end, 
        ...defaultEvent
      }));
    } else {
         setFormData(prev => ({
            ...prev,
            title: '',
            description: '',
            start: new Date(),
            end: new Date(new Date().getTime() + 60 * 60 * 1000), 
            ...defaultEvent
         }));
    }
  }, [event, slotInfo, isScheduleOnly, disableSubjectCreation]); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOfficialClass) return; 
    
    if (disableSubjectCreation && formData.type === EventType.SUBJECT) {
        showToast("Restricted", "Subject creation is not allowed here.", "error");
        return;
    }
    
    if (!formData.title?.trim()) {
        showToast("Missing Field", "Please enter a title.", "error");
        return;
    }

    if (!formData.start || !formData.end) {
        showToast("Missing Field", "Start and End times are required.", "error");
        return;
    }

    if (formData.start >= formData.end) {
        showToast("Invalid Time", "End time must be after start time.", "error");
        return;
    }

    if (formData.type === EventType.SUBJECT && formData.repeatPattern === RepeatPattern.WEEKLY) {
        if (!formData.repeatDays || formData.repeatDays.length === 0) {
            showToast("Missing Field", "Please select at least one day for weekly repetition.", "error");
            return;
        }
    }

    const start = formData.start;
    let end = formData.end;

    const baseEvent: CalendarEvent = {
      id: event?.id || Date.now().toString(),
      title: formData.title,
      type: formData.type || EventType.TASK,
      description: formData.description,
      start: start,
      end: end,
      color: formData.color,
    } as CalendarEvent; 

    let finalEvent: CalendarEvent;

    if (formData.type === EventType.SUBJECT) {
        finalEvent = {
            ...baseEvent,
            type: EventType.SUBJECT,
            subjectCode: formData.subjectCode,
            instructor: formData.instructor,
            location: formData.location,
            repeatPattern: formData.repeatPattern || RepeatPattern.NONE,
            repeatUntil: formData.repeatUntil,
            repeatDays: formData.repeatDays,
            excludeDates: formData.excludeDates || [],
        };
    } else {
        finalEvent = {
            ...baseEvent,
            repeatPattern: RepeatPattern.NONE, 
            ...(formData.type === EventType.TASK && {
                completed: formData.completed || false,
                priority: formData.priority || 'medium',
                taskEstimate: formData.taskEstimate || (formData.completed ? '100%' : '0%'), 
                subjectCode: formData.subjectCode, 
            }),
            ...(formData.type === EventType.EXAM && {
                completed: false,
                subjectCode: formData.subjectCode,
            })
        };
    }
    
    onSave(finalEvent);
  };

  const isSubject = formData.type === EventType.SUBJECT;
  const isTaskOrExam = formData.type === EventType.TASK || formData.type === EventType.EXAM;
  const isTask = formData.type === EventType.TASK;

  const dayMap = [
    { value: 1, label: 'Mon' }, { value: 2, label: 'Tue' }, { value: 3, label: 'Wed' }, 
    { value: 4, label: 'Thu' }, { value: 5, label: 'Fri' }, { value: 6, label: 'Sat' }, 
    { value: 0, label: 'Sun' }
  ];

  const handleRepeatDayToggle = (dayValue: number) => {
    if (isOfficialClass) return;
    setFormData(prev => {
      const days = prev.repeatDays || [];
      if (days.includes(dayValue)) {
        return { ...prev, repeatDays: days.filter(d => d !== dayValue) };
      } else {
        return { ...prev, repeatDays: [...days, dayValue].sort((a, b) => a - b) };
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[var(--color-components-bg)] rounded-lg p-6 w-full max-w-md border border-[var(--color-border)] shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            {isOfficialClass 
                ? 'Class Details' 
                : (event ? 'Edit Event' : (isScheduleOnly ? 'Create New Subject' : 'Create New Event'))
            }
            </h2>
            {isOfficialClass && (
                <div className="flex items-center gap-1 text-amber-600 bg-amber-100 px-2 py-1 rounded text-xs font-medium">
                    <Lock size={12} />
                    <span>Read Only</span>
                </div>
            )}
        </div>

        <div className="overflow-y-auto flex-grow px-2"> 
          <form onSubmit={handleSubmit}>
            {!isScheduleOnly && !isOfficialClass && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-[var(--color-text-primary)]">Event Type</label>
                <div className="flex gap-2">
                  {!disableSubjectCreation && (
                    <button
                      type="button"
                      className={`px-4 py-2 rounded transition-colors ${
                        formData.type === EventType.SUBJECT 
                          ? 'bg-[var(--color-primary)] text-white' 
                          : 'bg-[var(--color-hover)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]'
                      }`}
                      onClick={() => setFormData({...formData, type: EventType.SUBJECT, repeatPattern: RepeatPattern.WEEKLY, color: COLOR_OPTIONS[0]})}
                    >
                      Subject
                    </button>
                  )}
                  <button
                    type="button"
                    className={`px-4 py-2 rounded transition-colors ${
                      formData.type === EventType.TASK 
                        ? 'bg-[var(--color-primary)] text-white' 
                        : 'bg-[var(--color-hover)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]'
                    }`}
                    onClick={() => setFormData({...formData, type: EventType.TASK, repeatPattern: RepeatPattern.NONE, color: COLOR_OPTIONS[2]})}
                  >
                    Task/Homework
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded transition-colors ${
                      formData.type === EventType.EXAM 
                        ? 'bg-[var(--color-primary)] text-white' 
                        : 'bg-[var(--color-hover)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]'
                    }`}
                    onClick={() => setFormData({...formData, type: EventType.EXAM, repeatPattern: RepeatPattern.NONE, color: COLOR_OPTIONS[1]})}
                  >
                    Exam
                  </button>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">
                Title {isOfficialClass ? '' : <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                disabled={isOfficialClass}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded bg-[var(--color-components-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent disabled:opacity-70 disabled:cursor-not-allowed"
                value={formData.title || ''}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            {!isOfficialClass && (
                <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">Color</label>
                <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((color) => (
                    <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({...formData, color})}
                        className={`size-8 rounded-full border-2 transition-transform hover:scale-110`}
                        style={{
                        backgroundColor: color,
                        borderColor: formData.color === color ? 'var(--color-text-primary)' : 'transparent',
                        boxShadow: formData.color === color ? `0 0 0 2px ${color}` : 'none',
                        }}
                    />
                    ))}
                </div>
                </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">
                Start Time {isOfficialClass ? '' : <span className="text-red-500">*</span>}
              </label>
              <div className="flex gap-2">
                <DatePicker
                  selected={formData.start}
                  onChange={(date) => date && setFormData({...formData, start: date})}
                  showTimeSelect
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  disabled={isOfficialClass}
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded bg-[var(--color-components-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">
                End Time {isOfficialClass ? '' : <span className="text-red-500">*</span>}
              </label>
              <div className="flex gap-2">
                  <DatePicker
                      selected={formData.end}
                      onChange={(date) => date && setFormData({...formData, end: date})}
                      showTimeSelect
                      timeIntervals={15}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      disabled={isOfficialClass}
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded bg-[var(--color-components-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent disabled:opacity-70 disabled:cursor-not-allowed"
                    />
              </div>
            </div>
            
            {isSubject && (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">Subject Code</label>
                        <input
                            type="text"
                            disabled={isOfficialClass}
                            className="w-full px-4 py-2 border border-[var(--color-border)] rounded bg-[var(--color-components-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent disabled:opacity-70 disabled:cursor-not-allowed"
                            value={formData.subjectCode || ''}
                            onChange={(e) => setFormData({...formData, subjectCode: e.target.value})}
                            placeholder="e.g. CS401"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">Location</label>
                        <input
                            type="text"
                            disabled={isOfficialClass}
                            className="w-full px-4 py-2 border border-[var(--color-border)] rounded bg-[var(--color-components-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent disabled:opacity-70 disabled:cursor-not-allowed"
                            value={formData.location || ''}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">Instructor</label>
                    <input
                        type="text"
                        disabled={isOfficialClass}
                        className="w-full px-4 py-2 border border-[var(--color-border)] rounded bg-[var(--color-components-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent disabled:opacity-70 disabled:cursor-not-allowed"
                        value={formData.instructor || ''}
                        onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                    />
                </div>
              </>
            )}
            
            {isTaskOrExam && (
                 <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">Subject Name (For Task/Exam)</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-[var(--color-border)] rounded bg-[var(--color-components-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        value={formData.subjectCode || ''}
                        onChange={(e) => setFormData({...formData, subjectCode: e.target.value})}
                        placeholder="e.g. Web Systems"
                    />
                </div>
            )}

            {isSubject && (
              <>
                {!isOfficialClass && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">Repeat</label>
                        <select
                            className="w-full px-4 py-2 border border-[var(--color-border)] rounded bg-[var(--color-components-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                            value={formData.repeatPattern || RepeatPattern.NONE}
                            onChange={(e) => setFormData({...formData, repeatPattern: e.target.value as RepeatPattern})}
                        >
                            <option value={RepeatPattern.NONE}>Does not repeat</option>
                            <option value={RepeatPattern.DAILY}>Daily</option>
                            <option value={RepeatPattern.WEEKLY}>Weekly</option>
                            <option value={RepeatPattern.MONTHLY}>Monthly</option>
                        </select>
                    </div>
                )}

                {(formData.repeatPattern === RepeatPattern.WEEKLY || isOfficialClass) && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">
                            Repeat Days
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {dayMap.map((day) => (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => handleRepeatDayToggle(day.value)}
                                    disabled={isOfficialClass}
                                    className={`size-8 rounded-full font-medium transition-colors border-2 ${
                                        (formData.repeatDays || []).includes(day.value)
                                            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                                            : 'bg-[var(--color-hover)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:bg-[var(--color-border)]'
                                    } ${isOfficialClass ? 'opacity-80 cursor-not-allowed' : ''}`}
                                >
                                    {day.label.charAt(0)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {formData.repeatPattern !== RepeatPattern.NONE && !isOfficialClass && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">Repeat Until (Optional)</label>
                        <DatePicker
                            selected={formData.repeatUntil}
                            onChange={(date) => setFormData({...formData, repeatUntil: date || undefined})}
                            dateFormat="MMMM d, yyyy"
                            isClearable
                            placeholderText="Select date"
                            className="w-full px-4 py-2 border border-[var(--color-border)] rounded bg-[var(--color-components-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        />
                    </div>
                )}
              </>
            )}

            {isTask && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">Priority</label>
                  <select
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded bg-[var(--color-components-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    value={formData.priority || 'medium'}
                    onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">Estimate (e.g., 2 hours)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded bg-[var(--color-components-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    value={formData.taskEstimate || ''}
                    onChange={(e) => setFormData({...formData, taskEstimate: e.target.value})}
                    placeholder="e.g. 2 hours / 50%"
                  />
                </div>
              </>
            )}
          </form>
        </div>

        <div className="flex justify-end gap-2 mt-6 flex-shrink-0">
          {!isOfficialClass && event && (
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 text-red-600 hover:text-red-800 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[var(--color-border)] rounded hover:bg-[var(--color-hover)] transition-colors text-[var(--color-text-primary)]"
          >
            {isOfficialClass ? 'Close' : 'Cancel'}
          </button>
          
          {!isOfficialClass && (
            <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded hover:opacity-90 transition-colors"
            >
                Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventModal;