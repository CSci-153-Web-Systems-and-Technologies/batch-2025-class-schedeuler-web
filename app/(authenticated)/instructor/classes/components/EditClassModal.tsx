"use client";

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/app/context/ToastContext';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
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

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: any;
  onClassUpdated: () => void;
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

export default function EditClassModal({ isOpen, onClose, classData, onClassUpdated }: EditClassModalProps) {
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

  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name || '',
        courseNumber: classData.subjectCode || '',
        description: classData.description || '',
        location: classData.location || '',
        type: classData.type || 'Lecture',
        color: classData.color || COLOR_OPTIONS[0],
        startTime: classData.startTime || '09:00', 
        endTime: classData.endTime || '10:30',
        repeatDays: classData.repeatDays || [],
        repeatUntil: classData.repeatUntil ? new Date(classData.repeatUntil) : null,
      });
    }
  }, [classData]);

  const toggleDay = (dayValue: number) => {
    setFormData(prev => {
      const exists = prev.repeatDays.includes(dayValue);
      if (exists) return { ...prev, repeatDays: prev.repeatDays.filter(d => d !== dayValue) };
      return { ...prev, repeatDays: [...prev.repeatDays, dayValue] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classData?.id) return;
    if (!formData.name || !formData.courseNumber) {
        showToast('Error', 'Please fill in all required fields.', 'error');
        return;
    }
    
    setLoading(true);

    const dayLabels = formData.repeatDays
        .sort()
        .map(d => DAYS.find(day => day.value === d)?.label || '')
        .join(', ');
    const displayString = `${dayLabels} ${formData.startTime} - ${formData.endTime}`;

    const scheduleChanged = 
        formData.startTime !== classData.startTime ||
        formData.endTime !== classData.endTime ||
        JSON.stringify(formData.repeatDays.sort()) !== JSON.stringify(classData.repeatDays?.sort());

    const { error } = await supabase
      .from('classes')
      .update({
        name: formData.name,
        subject_code: formData.courseNumber,
        description: formData.description,
        location: formData.location,
        class_type: formData.type,
        color: formData.color,
        start_time: formData.startTime,
        end_time: formData.endTime,
        repeat_days: formData.repeatDays,
        repeat_until: formData.repeatUntil,
        schedule_settings: { displayString }
      })
      .eq('id', classData.id);

    if (error) {
        setLoading(false);
        showToast('Error', 'Failed to update class.', 'error');
        return;
    }

    if (scheduleChanged) {
        await supabase
            .from('enrollments')
            .update({ conflict_report: null })
            .eq('class_id', classData.id);
    }

    setLoading(false);
    showToast('Success', 'Class updated successfully!', 'success');
    onClassUpdated();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-components-bg)] w-full max-w-lg rounded-2xl shadow-xl border border-[var(--color-border)] flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center sticky top-0 bg-[var(--color-components-bg)] z-10">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Edit Class</h2>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="bg-[var(--color-hover)] p-4 rounded-xl flex items-center justify-between border border-[var(--color-primary)] border-dashed">
            <div>
              <p className="text-xs text-[var(--color-text-secondary)] uppercase font-bold tracking-wider">Join Code</p>
              <p className="text-2xl font-mono font-bold text-[var(--color-primary)] tracking-widest">{classData?.code}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="text-[var(--color-text-primary)]">Course Number</Label>
                    <Input
                        required
                        value={formData.courseNumber}
                        onChange={(e) => setFormData({...formData, courseNumber: e.target.value})}
                        className="bg-[var(--color-bar-bg)] text-[var(--color-text-primary)]"
                    />
                </div>
                <div>
                    <Label className="text-[var(--color-text-primary)]">Class Name</Label>
                    <Input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="bg-[var(--color-bar-bg)] text-[var(--color-text-primary)]"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="text-[var(--color-text-primary)]">Class Type</Label>
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
                    <Label className="text-[var(--color-text-primary)]">Location</Label>
                    <Input
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="bg-[var(--color-bar-bg)] text-[var(--color-text-primary)]"
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
                            className="w-full px-3 py-2 rounded-md bg-[var(--color-components-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">End Time</label>
                        <input 
                            type="time" 
                            value={formData.endTime}
                            onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                            className="w-full px-3 py-2 rounded-md bg-[var(--color-components-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
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
                        className="w-full px-3 py-2 rounded-md bg-[var(--color-components-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                    />
                </div>
            </div>

            <div>
              <Label className="text-[var(--color-text-primary)]">Description</Label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-input bg-[var(--color-bar-bg)] text-sm text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <Label className="text-[var(--color-text-primary)] mb-2 block">Color Tag</Label>
              <div className="flex gap-3">
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
            <Button type="button" variant="outline" onClick={onClose} className="text-[var(--color-text-primary)]">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-[var(--color-primary)] text-white">
              {loading ? <Loader2 className="animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}