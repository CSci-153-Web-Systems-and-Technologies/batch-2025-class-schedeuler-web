"use client";

import React, { useEffect, useState, useCallback } from 'react';
import AppBreadcrumb from '@/app/components/ui/AppBreadCrumb';
import JoinClassCard from './components/JoinClassCard';
import EnrolledClassCard, { EnrolledClassProps } from './components/EnrolledClassCard';
import { createClient } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';

export default function StudentClassesPage() {
  const [classes, setClasses] = useState<EnrolledClassProps[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          status,
          classes (
            id,
            name,
            code,
            schedule_settings,
            location, 
            profiles:instructor_id (name)
          )
        `)
        .eq('student_id', user.id);

      if (!error && data) {
        const mappedClasses: EnrolledClassProps[] = data.map((enrollment: any) => {
          const cls = enrollment.classes;
          const instructorName = Array.isArray(cls.profiles) 
            ? cls.profiles[0]?.name 
            : cls.profiles?.name;

          let scheduleStr = "Schedule TBD";
          if (cls.schedule_settings && typeof cls.schedule_settings === 'object') {
             scheduleStr = cls.schedule_settings.displayString || "Schedule TBD";
          }

          return {
            id: cls.id,
            name: cls.name,
            code: cls.code,
            instructor: instructorName || 'Unknown Instructor',
            schedule: scheduleStr,
            room: cls.location || 'Online', 
            status: enrollment.status,
          };
        });
        
        setClasses(mappedClasses);
      }
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return (
    // [FIX] Removed AuthenticatedThemeWrapper
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
            <div className="grid gap-4">
              {classes.map((cls) => (
                <EnrolledClassCard key={cls.id} {...cls} />
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
    </div>
  );
}