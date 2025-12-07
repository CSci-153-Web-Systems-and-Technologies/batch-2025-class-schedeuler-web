"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { CalendarEvent, EventType, RepeatPattern } from '@/types/calendar';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/app/context/ToastContext';

interface SubjectContextType {
  subjects: CalendarEvent[];
  addSubject: (newSubject: CalendarEvent) => void;
  updateSubject: (updatedSubject: CalendarEvent) => void;
  deleteSubject: (id: string) => void;
  loading: boolean;
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

export function SubjectProvider({ children }: { children: React.ReactNode }) {
  const [subjects, setSubjects] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { showToast } = useToast();

  // --- FETCH SUBJECTS & EXAMS ---
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .in('type', ['subject', 'exam']);

      if (error) {
        console.error('Error fetching subjects:', error);
      } else if (data) {
        const mappedSubjects: CalendarEvent[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          type: item.type as EventType,
          start: new Date(item.start_time),
          end: new Date(item.end_time),
          color: item.color,
          description: item.description,
          subjectCode: item.subject_code,
          instructor: item.instructor,
          location: item.location,
          repeatPattern: (item.repeat_pattern as RepeatPattern) || RepeatPattern.NONE,
          repeatUntil: item.repeat_until ? new Date(item.repeat_until) : undefined,
          repeatDays: item.repeat_days || [],
          excludeDates: (item.exclude_dates || []).map((d: string) => new Date(d)),
        }));
        setSubjects(mappedSubjects);
      }
      setLoading(false);
    };

    fetchSubjects();
  }, [supabase]);

  // --- ADD SUBJECT ---
  const addSubject = useCallback(async (newSubject: CalendarEvent) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Optimistic Update
    const tempId = Date.now().toString();
    setSubjects(prev => [...prev, { ...newSubject, id: tempId }]);

    const dbPayload = {
      user_id: user.id,
      title: newSubject.title,
      type: newSubject.type,
      start_time: newSubject.start.toISOString(),
      end_time: newSubject.end.toISOString(),
      color: newSubject.color,
      description: newSubject.description,
      subject_code: newSubject.subjectCode,
      instructor: newSubject.instructor,
      location: newSubject.location,
      repeat_pattern: newSubject.repeatPattern || 'none',
      repeat_until: newSubject.repeatUntil ? newSubject.repeatUntil.toISOString() : null,
      repeat_days: newSubject.repeatDays || [],
      exclude_dates: newSubject.excludeDates ? newSubject.excludeDates.map(d => d.toISOString()) : [],
    };

    const { data, error } = await supabase.from('events').insert([dbPayload]).select().single();

    if (error) {
      console.error('Error adding subject:', error);
      setSubjects(prev => prev.filter(s => s.id !== tempId));
      showToast("Error", "Failed to add subject.", "error");
    } else {
      setSubjects(prev => prev.map(s => s.id === tempId ? { ...newSubject, id: data.id } : s));
      showToast("Success", "Subject added successfully.", "success");
    }
  }, [supabase, showToast]);

  // --- UPDATE SUBJECT ---
  const updateSubject = useCallback(async (updatedSubject: CalendarEvent) => {
    setSubjects(prev => prev.map(s => s.id === updatedSubject.id ? updatedSubject : s));

    const dbPayload = {
      title: updatedSubject.title,
      start_time: updatedSubject.start.toISOString(),
      end_time: updatedSubject.end.toISOString(),
      color: updatedSubject.color,
      description: updatedSubject.description,
      subject_code: updatedSubject.subjectCode,
      instructor: updatedSubject.instructor,
      location: updatedSubject.location,
      repeat_pattern: updatedSubject.repeatPattern,
      repeat_until: updatedSubject.repeatUntil ? updatedSubject.repeatUntil.toISOString() : null,
      repeat_days: updatedSubject.repeatDays,
      exclude_dates: updatedSubject.excludeDates ? updatedSubject.excludeDates.map(d => d.toISOString()) : [],
    };

    const { error } = await supabase.from('events').update(dbPayload).eq('id', updatedSubject.id);

    if (error) {
      showToast("Error", "Failed to save changes.", "error");
    } else {
      showToast("Success", "Subject updated successfully.", "success");
    }
  }, [supabase, showToast]);

  // --- DELETE SUBJECT ---
  const deleteSubject = useCallback(async (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      showToast("Error", "Failed to delete subject.", "error");
    } else {
      showToast("Deleted", "Subject deleted successfully.", "success");
    }
  }, [supabase, showToast]);

  const contextValue = useMemo(() => ({
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    loading
  }), [subjects, addSubject, updateSubject, deleteSubject, loading]);

  return (
    <SubjectContext.Provider value={contextValue}>
      {children}
    </SubjectContext.Provider>
  );
}

export function useSubjects() {
  const context = useContext(SubjectContext);
  if (context === undefined) {
    throw new Error('useSubjects must be used within a SubjectProvider');
  }
  return context;
}