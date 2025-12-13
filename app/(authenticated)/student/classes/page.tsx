"use client";

import React, { useEffect, useState, useCallback } from 'react';
import AppBreadcrumb from '@/app/components/ui/AppBreadCrumb';
import JoinClassCard from './components/JoinClassCard';
import EnrolledClassCard, { EnrolledClassProps } from './components/EnrolledClassCard';
import { createClient } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';
import EventModal from '../calendar/components/EventModal';
import { CalendarEvent, EventType, RepeatPattern } from '@/types/calendar';
import { useSubjects } from '../subjects/SubjectContext'; 

interface ClassData extends EnrolledClassProps {
  description?: string;
  color?: string;
  startTime?: string;
  endTime?: string;
  repeatDays?: number[];
  classType?: 'Lecture' | 'Lab';
}

export default function StudentClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); 
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const supabase = createClient();
  const { refreshSubjects } = useSubjects(); 

  const fetchClasses = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 100)); 
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: enrollmentData, error } = await supabase
        .from('enrollments')
        .select(`
          status,
          classes (
            id,
            name,
            code,
            description,
            color,
            start_time,
            end_time,
            repeat_days,
            class_type,
            schedule_settings,
            location,
            instructor_id
          )
        `)
        .eq('student_id', user.id);

      if (!error && enrollmentData) {
        const instructorIds = [...new Set(enrollmentData
            .map((e: any) => e.classes?.instructor_id)
            .filter(Boolean))];

        let profilesMap: Record<string, string> = {};

        if (instructorIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, name')
                .in('id', instructorIds);
            
            profiles?.forEach(p => {
                profilesMap[p.id] = p.name;
            });
        }

        const mappedClasses: ClassData[] = enrollmentData.map((enrollment: any) => {
          const cls = enrollment.classes;
          if (!cls) return null;

          const instructorName = profilesMap[cls.instructor_id] || 'Unknown Instructor';

          let scheduleStr = "Schedule TBD";
          if (cls.schedule_settings && typeof cls.schedule_settings === 'object') {
             scheduleStr = cls.schedule_settings.displayString || "Schedule TBD";
          }

          return {
            id: cls.id,
            name: cls.name,
            code: cls.code,
            instructor: instructorName,
            schedule: scheduleStr,
            room: cls.location || 'Online', 
            status: enrollment.status,
            description: cls.description,
            color: cls.color,
            startTime: cls.start_time,
            endTime: cls.end_time,
            repeatDays: cls.repeat_days,
            classType: cls.class_type
          };
        }).filter(item => item !== null) as ClassData[];
        
        setClasses(mappedClasses);
        setRefreshKey(prev => prev + 1);
        
        refreshSubjects();
      }
    }
    setLoading(false);
  }, [supabase, refreshSubjects]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    let channel: any;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('student_classes_page_updates')   
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'enrollments', filter: `student_id=eq.${user.id}` },
          () => {
            console.log("Realtime: Enrollment update detected");
            fetchClasses();
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'classes' },
          (payload) => {
             console.log("Realtime: Class deleted, checking if enrolled...");
             setClasses(prev => {
                 const wasEnrolled = prev.some(c => c.id === payload.old.id);
                 if (wasEnrolled) {
                     const newClasses = prev.filter(c => c.id !== payload.old.id);
                     refreshSubjects();
                     return newClasses;
                 }
                 return prev;
             });
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'classes' },
          (payload) => {
            setClasses(currentClasses => {
                const isRelevant = currentClasses.some(c => c.id === payload.new.id);
                if (isRelevant) fetchClasses();
                return currentClasses;
            });
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase, fetchClasses, refreshSubjects]);

  const handleClassClick = (cls: ClassData) => {
    const now = new Date();
    const sTime = cls.startTime || "09:00:00";
    const eTime = cls.endTime || "10:00:00";
    
    const [sH, sM] = sTime.split(':').map(Number);
    const [eH, eM] = eTime.split(':').map(Number);
    
    let targetDate = new Date(now);
    
    if (cls.repeatDays && cls.repeatDays.length > 0) {
        const todayDay = now.getDay();
        const sortedDays = [...cls.repeatDays].sort((a, b) => a - b);
        
        let nextDay = sortedDays.find(d => d >= todayDay);
        
        if (nextDay === undefined) {
            nextDay = sortedDays[0];
        }
        
        const daysToAdd = (nextDay + 7 - todayDay) % 7;
        targetDate.setDate(now.getDate() + daysToAdd);
    }

    const start = new Date(targetDate);
    start.setHours(sH, sM, 0, 0);
    
    const end = new Date(targetDate);
    end.setHours(eH, eM, 0, 0);

    const event: CalendarEvent = {
        id: `class_${cls.id}`, 
        title: cls.name,
        type: EventType.SUBJECT,
        start,
        end,
        color: cls.color,
        description: cls.description,
        subjectCode: cls.code,
        instructor: cls.instructor,
        location: cls.room,
        repeatPattern: RepeatPattern.WEEKLY, 
        repeatDays: cls.repeatDays,
        classType: cls.classType
    };

    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div 
      className="min-h-screen py-6 px-4 sm:px-6 lg:px-12"
      style={{ backgroundColor: "var(--color-main-bg)" }}
    >
      <AppBreadcrumb />

      <div className="max-w-6xl mx-auto">
        <JoinClassCard onJoinSuccess={fetchClasses} />

        <div 
          className="p-6 md:p-8 rounded-2xl shadow-sm border border-[var(--color-border)] min-h-[300px]"
          style={{ backgroundColor: 'var(--color-components-bg)' }}
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
            Enrolled Classes
          </h2>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
            </div>
          ) : classes.length > 0 ? (
            <div key={refreshKey} className="grid gap-4">
              {classes.map((cls) => (
                <EnrolledClassCard 
                    key={cls.id} 
                    {...cls} 
                    onClick={() => handleClassClick(cls)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[var(--color-text-secondary)]">
              <p>You haven't joined any classes yet.</p>
              <p className="text-sm mt-2">Use the code above to join your first class!</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedEvent && (
        <EventModal
            event={selectedEvent}
            onClose={() => setIsModalOpen(false)}
            onSave={() => {}} 
            onDelete={() => {}} 
            isScheduleOnly={false}
        />
      )}
    </div>
  );
}