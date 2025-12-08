"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { CalendarEvent, EventType, RepeatPattern } from '@/types/calendar';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/app/context/ToastContext';

interface SubjectContextType {
  subjects: CalendarEvent[];
  addSubject: (newSubject: CalendarEvent) => void;
  updateSubject: (updatedSubject: CalendarEvent) => void;
  deleteSubject: (id: string) => void;
  refreshSubjects: () => Promise<void>;
  loading: boolean;
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

export function SubjectProvider({ children }: { children: React.ReactNode }) {
  const [subjects, setSubjects] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { showToast } = useToast();
  
  const subjectsRef = useRef<CalendarEvent[]>([]);

  useEffect(() => {
    subjectsRef.current = subjects;
  }, [subjects]);

  const mapClassToEvent = useCallback((cls: any): CalendarEvent => {
    const now = new Date();
    now.setSeconds(0);
    now.setMilliseconds(0);
    
    const startTimeStr = cls.start_time || "08:00:00";
    const endTimeStr = cls.end_time || "09:00:00";

    const [startH, startM] = startTimeStr.split(':').map(Number);
    const [endH, endM] = endTimeStr.split(':').map(Number);

    const startDate = new Date(now);
    startDate.setHours(startH, startM, 0, 0);

    const endDate = new Date(now);
    endDate.setHours(endH, endM, 0, 0);

    return {
      id: `class_${cls.id}`,
      title: cls.name,
      type: EventType.SUBJECT,
      start: startDate,
      end: endDate,
      color: cls.color || '#4169e1',
      description: cls.description,
      subjectCode: cls.subject_code || cls.code,
      location: cls.location,
      instructor: 'Official Class', 
      repeatPattern: RepeatPattern.WEEKLY,
      repeatDays: cls.repeat_days || [],
      classType: cls.class_type,
    };
  }, []);

  const fetchSubjects = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
          if (!silent) setLoading(false);
          return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('account_type')
        .eq('id', user.id)
        .single();
      
      const isInstructor = profile?.account_type === 'instructor';
      let allEvents: CalendarEvent[] = [];

      const { data: personalEvents } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .in('type', ['subject', 'exam']); 

      if (personalEvents) {
        const mappedPersonal = personalEvents.map((item: any) => ({
          id: item.id,
          title: item.title,
          type: item.type as EventType,
          start: new Date(item.start_time),
          end: new Date(item.end_time),
          color: item.color,
          description: item.description,
          subjectCode: item.subject_code,
          location: item.location,
          repeatPattern: (item.repeat_pattern as RepeatPattern) || RepeatPattern.NONE,
          repeatUntil: item.repeat_until ? new Date(item.repeat_until) : undefined,
          repeatDays: item.repeat_days || [],
          excludeDates: (item.exclude_dates || []).map((d: string) => new Date(d)),
        }));
        allEvents = [...allEvents, ...mappedPersonal];
      }

      if (isInstructor) {
        const { data: myClasses } = await supabase
          .from('classes')
          .select('*')
          .eq('instructor_id', user.id);
        
        if (myClasses) {
          const mappedClasses = myClasses.map(mapClassToEvent);
          allEvents = [...allEvents, ...mappedClasses];
        }
      } else {
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select(`
            status,
            classes (
              id, name, code, subject_code, 
              description, color, location,
              start_time, end_time, repeat_days, class_type
            )
          `)
          .eq('student_id', user.id)
          .eq('status', 'approved');

        if (enrollments) {
          const mappedClasses = enrollments
            .map((e: any) => e.classes)
            .filter((c: any) => c) 
            .map(mapClassToEvent);
          
          allEvents = [...allEvents, ...mappedClasses];
        }
      }

      setSubjects(allEvents);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [supabase, mapClassToEvent]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    let channel: any;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('universal_subject_updates')
        
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'events', filter: `user_id=eq.${user.id}` },
          () => fetchSubjects(true)
        )
        
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'enrollments' },
          () => fetchSubjects(true)
        )
        
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'classes' },
          (payload: any) => {
             const updatedClassId = `class_${payload.new.id}`;
             
             const isRelevant = subjectsRef.current.some(s => s.id === updatedClassId);

             if (isRelevant) {
                 const newEvent = mapClassToEvent(payload.new);
                 setSubjects(prev => prev.map(s => s.id === updatedClassId ? newEvent : s));
                 
                 fetchSubjects(true); 
             }
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase, fetchSubjects, mapClassToEvent]);


  const addSubject = useCallback(async (newSubject: CalendarEvent) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
      location: newSubject.location,
      repeat_pattern: newSubject.repeatPattern || 'none',
      repeat_until: newSubject.repeatUntil ? newSubject.repeatUntil.toISOString() : null,
      repeat_days: newSubject.repeatDays || [],
      exclude_dates: newSubject.excludeDates ? newSubject.excludeDates.map(d => d.toISOString()) : [],
    };

    const { data, error } = await supabase.from('events').insert([dbPayload]).select().single();

    if (error) {
      setSubjects(prev => prev.filter(s => s.id !== tempId));
      showToast("Error", "Failed to add event.", "error");
    } else {
      setSubjects(prev => prev.map(s => s.id === tempId ? { ...newSubject, id: data.id } : s));
      showToast("Success", "Event added.", "success");
    }
  }, [supabase, showToast]);

  const updateSubject = useCallback(async (updatedSubject: CalendarEvent) => {
    if (updatedSubject.id.startsWith('class_')) {
      showToast("Restricted", "Update official classes in 'My Classes'.", "warning");
      return;
    }
    setSubjects(prev => prev.map(s => s.id === updatedSubject.id ? updatedSubject : s));
    
    const dbPayload = {
        title: updatedSubject.title,
        start_time: updatedSubject.start.toISOString(),
        end_time: updatedSubject.end.toISOString(),
        color: updatedSubject.color,
        description: updatedSubject.description,
        subject_code: updatedSubject.subjectCode,
        location: updatedSubject.location,
        repeat_days: updatedSubject.repeatDays,
    };

    const { error } = await supabase.from('events').update(dbPayload).eq('id', updatedSubject.id);
    if (error) showToast("Error", "Failed to save changes.", "error");
    else showToast("Success", "Event updated.", "success");
  }, [supabase, showToast]);

  const deleteSubject = useCallback(async (id: string) => {
    if (id.startsWith('class_')) {
        showToast("Restricted", "Cannot delete official classes here.", "warning");
        return;
    }
    setSubjects(prev => prev.filter(s => s.id !== id));
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) showToast("Error", "Failed to delete.", "error");
    else showToast("Deleted", "Event removed.", "success");
  }, [supabase, showToast]);

  const refreshSubjects = async () => {
      await fetchSubjects(true);
  };

  const contextValue = useMemo(() => ({
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    refreshSubjects,
    loading
  }), [subjects, addSubject, updateSubject, deleteSubject, fetchSubjects, loading]);

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