"use client";

import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/app/context/ToastContext';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/Select";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/DatePickerStyles.css';

import { checkForConflicts } from '@/utils/calendarUtils';
import { useSubjects } from '@/app/(authenticated)/student/subjects/SubjectContext';
import { CalendarEvent, EventType, RepeatPattern } from '@/types/calendar';

interface PreFilledData {
  startTime?: string;
  endTime?: string;
  repeatDays?: number[];
}

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassCreated?: () => void;
  initialData?: PreFilledData | null;
}

const COLOR_OPTIONS = ['#4169e1', '#52c41a', '#ff4d4f', '#faad14', '#8e44ad', '#2c3e50'];
const DAYS = [
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 },
  { label: 'S', value: 0 },
];

export default function CreateClassModal({ isOpen, onClose, onClassCreated, initialData }: CreateClassModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    courseNumber: '',
    description: '',
    location: '',
    type: 'Lecture',
    color: COLOR_OPTIONS[0],
    startTime: '09:00',
    endTime: '10:30',
    repeatDays: [] as number[],
    repeatUntil: null as Date | null,
  });
  
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const { showToast } = useToast();
  
  const { subjects } = useSubjects();

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData(prev => ({
        ...prev,
        startTime: initialData.startTime || prev.startTime,
        endTime: initialData.endTime || prev.endTime,
        repeatDays: initialData.repeatDays || prev.repeatDays,
      }));
    } else if (isOpen && !initialData) {
       setFormData(prev => ({
         ...prev,
         startTime: '09:00',
         endTime: '10:30',
         repeatDays: [],
         repeatUntil: null
       }));
    }
  }, [isOpen, initialData]);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const [classCode, setClassCode] = useState(generateCode());

  const toggleDay = (dayValue: number) => {
    setFormData(prev => {
      const exists = prev.repeatDays.includes(dayValue);
      if (exists) {
        return { ...prev, repeatDays: prev.repeatDays.filter(d => d !== dayValue) };
      }
      return { ...prev, repeatDays: [...prev.repeatDays, dayValue] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.courseNumber) {
        showToast('Error', 'Please fill in the required fields.', 'error');
        return;
    }
    if (formData.repeatDays.length === 0) {
        showToast('Warning', 'Please select at least one day for the schedule.', 'warning');
        return;
    }

    setLoading(true);

    const now = new Date();
    now.setSeconds(0);
    now.setMilliseconds(0);

    const [startH, startM] = formData.startTime.split(':').map(Number);
    const [endH, endM] = formData.endTime.split(':').map(Number);

    if (startH > endH || (startH === endH && startM >= endM)) {
        showToast('Error', 'End time must be after start time.', 'error');
        setLoading(false);
        return;
    }

    const startDate = new Date(now);
    startDate.setHours(startH, startM, 0, 0);

    const endDate = new Date(now);
    endDate.setHours(endH, endM, 0, 0);

    const tempEvent: CalendarEvent = {
        id: 'temp_creation_check',
        title: formData.name,
        type: EventType.SUBJECT,
        start: startDate,
        end: endDate,
        repeatPattern: RepeatPattern.WEEKLY,
        repeatDays: formData.repeatDays,
        repeatUntil: formData.repeatUntil || undefined
    };

    if (checkForConflicts(tempEvent, subjects)) {
        showToast('Conflict Detected', 'This schedule overlaps with an existing class.', 'error');
        setLoading(false);
        return;
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const dayLabels = formData.repeatDays
            .sort()
            .map(d => DAYS.find(day => day.value === d)?.label || '')
            .join(', ');
            
        const displayString = `${dayLabels} ${formData.startTime} - ${formData.endTime}`;

        const { error } = await supabase
          .from('classes')
          .insert([
            {
              instructor_id: user.id,
              name: formData.name,
              subject_code: formData.courseNumber,
              description: formData.description,
              location: formData.location,
              class_type: formData.type,
              color: formData.color,
              code: classCode,
              start_time: formData.startTime,
              end_time: formData.endTime,
              repeat_days: formData.repeatDays,
              repeat_until: formData.repeatUntil,
              schedule_settings: { displayString },
              status: 'Active'
            }
          ]);

        if (error) throw error;

        showToast('Success', `Class "${formData.name}" created!`, 'success');
        
        setFormData({ 
            name: '', 
            courseNumber: '', 
            description: '', 
            location: '', 
            type: 'Lecture', 
            color: COLOR_OPTIONS[0],
            startTime: '09:00',
            endTime: '10:30',
            repeatDays: [],
            repeatUntil: null
        });
        setClassCode(generateCode()); 
        
        if (onClassCreated) onClassCreated(); 
        onClose();

    } catch (error: any) {
        console.error("Create Class Error:", error);
        showToast('Error', error.message || 'Failed to create class.', 'error');
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-components-bg)] w-full max-w-lg rounded-2xl shadow-xl border border-[var(--color-border)] flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center sticky top-0 bg-[var(--color-components-bg)] z-10">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Create New Class</h2>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-[var(--color-hover)] p-4 rounded-xl flex items-center justify-between border border-[var(--color-primary)] border-dashed">
            <div>
              <p className="text-xs text-[var(--color-text-secondary)] uppercase font-bold tracking-wider">Join Code</p>
              <p className="text-2xl font-mono font-bold text-[var(--color-primary)] tracking-widest">{classCode}</p>
            </div>
            <button 
              type="button"
              onClick={() => setClassCode(generateCode())}
              className="p-2 hover:bg-[var(--color-border)] rounded-full transition-colors"
              title="Generate New Code"
            >
              <RefreshCw size={20} className="text-[var(--color-text-secondary)]" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  Course Number <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={formData.courseNumber}
                  onChange={(e) => setFormData({...formData, courseNumber: e.target.value})}
                  placeholder="e.g. CS101"
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-bar-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  Class Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Intro to AI"
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-bar-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Class Type</label>
                <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                  <SelectTrigger className="w-full bg-[var(--color-bar-bg)] border-[var(--color-border)] text-[var(--color-text-primary)]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Lecture">Lecture</SelectItem>
                      <SelectItem value="Lab">Lab</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Location / Room</label>
                <input
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g. Room 304"
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-bar-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[var(--color-bar-bg)] border border-[var(--color-border)]">
                <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-3">
                    Weekly Schedule
                </label>
                
                <div className="flex justify-between mb-4">
                    {DAYS.map((day) => (
                        <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleDay(day.value)}
                            className={`w-8 h-8 rounded-full text-sm font-bold transition-all ${
                                formData.repeatDays.includes(day.value)
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'bg-[var(--color-hover)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
                            }`}
                        >
                            {day.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Start Time</label>
                        <input 
                            type="time" 
                            value={formData.startTime}
                            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                            // [FIX] Added dark mode icon filter to make it visible
                            className="w-full px-3 py-2 rounded-md bg-[var(--color-components-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none dark:[&::-webkit-calendar-picker-indicator]:filter dark:[&::-webkit-calendar-picker-indicator]:invert"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">End Time</label>
                        <input 
                            type="time" 
                            value={formData.endTime}
                            onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                            // [FIX] Added dark mode icon filter to make it visible
                            className="w-full px-3 py-2 rounded-md bg-[var(--color-components-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none dark:[&::-webkit-calendar-picker-indicator]:filter dark:[&::-webkit-calendar-picker-indicator]:invert"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Repeat Until (Optional)</label>
                    <DatePicker
                        selected={formData.repeatUntil}
                        onChange={(date) => setFormData({...formData, repeatUntil: date})}
                        dateFormat="MMMM d, yyyy"
                        isClearable
                        placeholderText="Forever"
                        wrapperClassName='w-full'
                        className="w-full px-3 py-2 rounded-md bg-[var(--color-components-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                    />
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief summary..."
                rows={2}
                className="w-full px-4 py-2 rounded-lg bg-[var(--color-bar-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Class Color</label>
              <div className="flex gap-3 flex-wrap">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({...formData, color: c})}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${formData.color === c ? 'border-[var(--color-text-primary)] scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)] transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}