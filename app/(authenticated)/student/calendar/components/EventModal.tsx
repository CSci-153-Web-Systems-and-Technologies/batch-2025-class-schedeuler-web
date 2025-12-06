// components/Calendar/EventModal.tsx
import React, { useState, useEffect } from 'react';
import { CalendarEvent, EventType, RepeatPattern } from '@/types/calendar';
import { SlotInfo } from 'react-big-calendar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/DatePickerStyles.css'; // Add custom styles for datepicker

interface EventModalProps {
  event?: CalendarEvent | null;
  slotInfo?: SlotInfo | null;
  onSave: (event: CalendarEvent) => void;
  onDelete: () => void;
  onClose: () => void;
}

const COLOR_OPTIONS = [
  '#4169e1', // Primary Blue
  '#52c41a', // Green (for Exams)
  '#ff4d4f', // Red (for Tasks)
  '#faad14', // Yellow/Orange
  '#6a5acd', // Purple
  '#1abc9c', // Turquoise
  '#f39c12', // Orange
  '#e74c3c', // Alizarin Red
];

const EventModal: React.FC<EventModalProps> = ({
  event,
  slotInfo,
  onSave,
  onDelete,
  onClose,
}) => {
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    type: EventType.TASK,
    description: '',
    start: new Date(),
    end: new Date(),
    color: COLOR_OPTIONS[0],
    priority: 'medium',
    repeatPattern: RepeatPattern.NONE, // Added recurrence field
  });

  useEffect(() => {
    if (event) {
      const { allDay, ...restEvent } = event as any; 
      setFormData(restEvent);
    } else if (slotInfo) {
      setFormData({
        ...formData,
        start: slotInfo.start,
        end: new Date(slotInfo.start.getTime() + 60 * 60 * 1000), 
        type: EventType.TASK, 
        color: COLOR_OPTIONS[0], 
        repeatPattern: RepeatPattern.NONE,
      });
    }
  }, [event, slotInfo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const start = formData.start || new Date();
    let end = formData.end || new Date(start.getTime() + 60 * 60 * 1000);

    if (start >= end) {
        end = new Date(start.getTime() + 60 * 60 * 1000);
    }
    
    // Base object for all events
    const baseEvent: CalendarEvent = {
      id: event?.id || Date.now().toString(),
      title: formData.title || '',
      type: formData.type || EventType.TASK,
      description: formData.description,
      start: start,
      end: end,
      color: formData.color,
    } as CalendarEvent; // Cast to ensure base required fields exist

    let finalEvent: CalendarEvent;

    if (formData.type === EventType.SUBJECT) {
        // Subject-specific logic
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
        // Task/Exam-specific logic
        finalEvent = {
            ...baseEvent,
            repeatPattern: RepeatPattern.NONE, // Ensure non-subject events don't recur
            ...(formData.type === EventType.TASK && {
                completed: formData.completed || false,
                priority: formData.priority || 'medium',
                taskEstimate: formData.taskEstimate,
            }),
            ...(formData.type === EventType.EXAM && {
                completed: false,
            })
        };
    }
    
    onSave(finalEvent);
  };

  const handleDelete = () => {
    onDelete();
  };
  
  const isSubject = formData.type === EventType.SUBJECT;
  const isTask = formData.type === EventType.TASK;

  // Day mapping for recurrence selection (0=Sun, 1=Mon, ...)
  const dayMap = [
    { value: 1, label: 'Mon' }, { value: 2, label: 'Tue' }, { value: 3, label: 'Wed' }, 
    { value: 4, label: 'Thu' }, { value: 5, label: 'Fri' }, { value: 6, label: 'Sat' }, 
    { value: 0, label: 'Sun' }
  ];

  const handleRepeatDayToggle = (dayValue: number) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Scroll fix: Use flex-col and max-h to contain content and apply overflow to inner div */}
      <div className="bg-[var(--color-components-bg)] rounded-lg p-6 w-full max-w-md border border-[var(--color-border)] flex flex-col max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4 text-[var(--color-text-primary)] flex-shrink-0">
          {event ? 'Edit Event' : 'Create New Event'}
        </h2>

        {/* Form Content Wrapper: Allows scrolling */}
        <div className="overflow-y-auto flex-grow pr-2"> 
          <form onSubmit={handleSubmit}>
            {/* Event Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-[var(--color-text-primary)]">Event Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`px-4 py-2 rounded transition-colors ${
                    formData.type === EventType.SUBJECT 
                      ? 'bg-[var(--color-primary)] text-white' 
                      : 'bg-[var(--color-hover)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]'
                  }`}
                  onClick={() => setFormData({...formData, type: EventType.SUBJECT, repeatPattern: RepeatPattern.WEEKLY})}
                >
                  Subject
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded transition-colors ${
                    formData.type === EventType.TASK 
                      ? 'bg-[var(--color-primary)] text-white' 
                      : 'bg-[var(--color-hover)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]'
                  }`}
                  onClick={() => setFormData({...formData, type: EventType.TASK, repeatPattern: RepeatPattern.NONE})}
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
                  onClick={() => setFormData({...formData, type: EventType.EXAM, repeatPattern: RepeatPattern.NONE})}
                >
                  Exam
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">Title</label>
              <input
                type="text"
                className="w-full p-2 border border-[var(--color-border)] rounded bg-[var(--color-components-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                value={formData.title || ''}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            {/* Color Selector */}
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
            
            {/* Start Time */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">
                Start Time
              </label>
              <div className="flex gap-2">
                <DatePicker
                  selected={formData.start}
                  onChange={(date) => date && setFormData({...formData, start: date})}
                  showTimeSelect
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full p-2 border border-[var(--color-border)] rounded bg-[var(--color-components-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>
            </div>

            {/* End Time */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">
                End Time
              </label>
              <div className="flex gap-2">
                  <DatePicker
                      selected={formData.end}
                      onChange={(date) => date && setFormData({...formData, end: date})}
                      showTimeSelect
                      timeIntervals={15}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="w-full p-2 border border-[var(--color-border)] rounded bg-[var(--color-components-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
              </div>
            </div>
            
            {/* --- SUBJECT SPECIFIC FIELDS --- */}
            {isSubject && (
              <>
                {/* Subject Code, Instructor, Location */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">Subject Code</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-[var(--color-border)] rounded bg-[var(--color-components-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                            value={formData.subjectCode || ''}
                            onChange={(e) => setFormData({...formData, subjectCode: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">Location</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-[var(--color-border)] rounded bg-[var(--color-components-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                            value={formData.location || ''}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">Instructor</label>
                    <input
                        type="text"
                        className="w-full p-2 border border-[var(--color-border)] rounded bg-[var(--color-components-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        value={formData.instructor || ''}
                        onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                    />
                </div>

                {/* Recurrence Pattern */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">Repeat</label>
                    <select
                        className="w-full p-2 border border-[var(--color-border)] rounded bg-[var(--color-components-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        value={formData.repeatPattern || RepeatPattern.NONE}
                        onChange={(e) => setFormData({...formData, repeatPattern: e.target.value as RepeatPattern, repeatDays: undefined})}
                    >
                        <option value={RepeatPattern.NONE}>Does not repeat</option>
                        <option value={RepeatPattern.DAILY}>Daily</option>
                        <option value={RepeatPattern.WEEKLY}>Weekly</option>
                        <option value={RepeatPattern.MONTHLY}>Monthly</option>
                    </select>
                </div>

                {/* Weekly Day Selection */}
                {formData.repeatPattern === RepeatPattern.WEEKLY && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">Repeat Days</label>
                        <div className="flex flex-wrap gap-2">
                            {dayMap.map((day) => (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => handleRepeatDayToggle(day.value)}
                                    className={`size-8 rounded-full font-medium transition-colors border-2 ${
                                        (formData.repeatDays || []).includes(day.value)
                                            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                                            : 'bg-[var(--color-hover)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:bg-[var(--color-border)]'
                                    }`}
                                >
                                    {day.label.charAt(0)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Repeat Until Date */}
                {formData.repeatPattern !== RepeatPattern.NONE && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">Repeat Until (Optional)</label>
                        <DatePicker
                            selected={formData.repeatUntil}
                            onChange={(date) => setFormData({...formData, repeatUntil: date || undefined})}
                            dateFormat="MMMM d, yyyy"
                            isClearable
                            placeholderText="Select date"
                            className="w-full p-2 border border-[var(--color-border)] rounded bg-[var(--color-components-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        />
                    </div>
                )}
              </>
            )}

            {/* --- TASK SPECIFIC FIELDS --- */}
            {isTask && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">Priority</label>
                  <select
                    className="w-full p-2 border border-[var(--color-border)] rounded bg-[var(--color-components-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
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
                    className="w-full p-2 border border-[var(--color-border)] rounded bg-[var(--color-components-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    value={formData.taskEstimate || ''}
                    onChange={(e) => setFormData({...formData, taskEstimate: e.target.value})}
                    placeholder="e.g. 2 hours"
                  />
                </div>
              </>
            )}
          </form>
        </div>

        {/* Buttons - flex-shrink-0 keeps buttons pinned */}
        <div className="flex justify-end gap-2 mt-6 flex-shrink-0">
          {event && (
            <button
              type="button"
              onClick={handleDelete}
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
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded hover:opacity-90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;