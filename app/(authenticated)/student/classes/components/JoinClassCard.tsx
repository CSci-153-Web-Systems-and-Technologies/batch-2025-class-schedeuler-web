// app/(authenticated)/student/classes/components/JoinClassCard.tsx
"use client";

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/app/context/ToastContext';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useThemeContext } from "@/app/(authenticated)/components/ThemeContext";
import { useSubjects } from '@/app/(authenticated)/student/subjects/SubjectContext';
import { getConflictingEvents } from '@/utils/calendarUtils';
import { CalendarEvent, EventType, RepeatPattern } from '@/types/calendar';
import JoinConflictModal from './JoinConflictModal';
import moment from 'moment';

const JoinClassCard: React.FC<{ onJoinSuccess?: () => void }> = ({ onJoinSuccess }) => {
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [pendingClassData, setPendingClassData] = useState<any>(null);
  const [detectedConflicts, setDetectedConflicts] = useState<CalendarEvent[]>([]);

  const supabase = createClient();
  const { showToast } = useToast();
  const { theme } = useThemeContext();
  const { subjects: currentSchedule, deleteSubject } = useSubjects();

  const generateConflictReport = (conflicts: CalendarEvent[]): string[] => {
    if (!conflicts || conflicts.length === 0) return [];
    return conflicts.map(c => 
        `Conflict with '${c.title}' (${c.subjectCode || c.type}), ${moment(c.start).format('h:mm A')} - ${moment(c.end).format('h:mm A')}`
    );
  };

  const fetchCurrentUserName = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single();
    return profile?.name || 'A Student';
  };

  const executeJoin = async (
    classId: string, 
    className: string, 
    instructorId: string,
    studentName: string,
    eventIdToDelete: string | null = null, 
    finalConflicts: CalendarEvent[] = []
  ) => {
    if (!classId) {
        showToast('Error', 'Missing class information. Please try searching again.', 'error');
        return;
    }

    setLoading(true);
    setIsConflictModalOpen(false);

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        if (eventIdToDelete) {
            await deleteSubject(eventIdToDelete); 
        }

        const conflictReport = generateConflictReport(finalConflicts);

        const { error: enrollError } = await supabase
            .from('enrollments')
            .insert([{
                student_id: user.id,
                class_id: classId,
                status: 'pending',
                conflict_report: conflictReport
            }]);

        if (enrollError) {
            console.error("Enrollment Error:", enrollError);
            
            if (enrollError.code === '23505') { 
                showToast('Info', 'You have already requested to join this class.', 'info');
            } else {
                showToast('Error', `Failed to join: ${enrollError.message}`, 'error');
            }
        } else {
            await supabase.from('notifications').insert({
                user_id: instructorId,
                title: 'New Enrollment Request',
                message: `${studentName} requested to join "${className}". Review on the My Classes page.`,
                type: 'info',
                link: '/instructor/classes',
                is_read: false
            });

            showToast('Success', `Request sent to join "${className}"`, 'success');
            setClassCode(''); 
            if (onJoinSuccess) onJoinSuccess(); 
        }
    } catch (err: any) {
        console.error("Join Exception:", err);
        showToast('Error', err.message || 'Failed to process join request.', 'error');
    } finally {
        setLoading(false);
        setPendingClassData(null);
    }
  };

  const handleReplaceAndJoin = async () => {
    if (!pendingClassData || !pendingClassData.manualConflictId) return;
    
    await executeJoin(
        pendingClassData.id, 
        pendingClassData.name, 
        pendingClassData.instructor_id,
        pendingClassData.student_name,
        pendingClassData.manualConflictId,
        detectedConflicts
    );
  };


  const handleJoinClick = async () => {
    if (!classCode.trim()) {
      showToast('Error', 'Please enter a class code', 'error');
      return;
    }
    
    setLoading(true);

    try {
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, name, instructor_id, start_time, end_time, repeat_days')
        .eq('code', classCode.trim())
        .single();

      if (classError || !classData) {
        showToast('Error', 'Invalid Class Code. Please check and try again.', 'error');
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const studentName = await fetchCurrentUserName(user.id);

      const { data: existing } = await supabase
        .from('enrollments')
        .select('status')
        .eq('student_id', user.id)
        .eq('class_id', classData.id)
        .single();

      if (existing) {
        showToast('Info', `You have already requested to join "${classData.name}"`, 'info');
        setLoading(false);
        return;
      }

      const now = new Date();
      now.setSeconds(0);
      now.setMilliseconds(0);

      const [startH, startM] = (classData.start_time || "00:00").split(':').map(Number);
      const [endH, endM] = (classData.end_time || "00:00").split(':').map(Number);

      const startDate = new Date(now);
      startDate.setHours(startH, startM, 0, 0);
      
      const endDate = new Date(now);
      endDate.setHours(endH, endM, 0, 0);

      const tentativeEvent: CalendarEvent = {
        id: `temp_check_${classData.id}`,
        title: classData.name,
        type: EventType.SUBJECT,
        start: startDate,
        end: endDate,
        repeatPattern: RepeatPattern.WEEKLY,
        repeatDays: classData.repeat_days || [],
      };


      const conflicts = getConflictingEvents(tentativeEvent, currentSchedule);

      if (conflicts.length > 0) {
        const manualConflict = conflicts.find(c => c.type === EventType.SUBJECT && !c.id.startsWith('class_'));
        
        setPendingClassData({
            ...classData,
            manualConflictId: manualConflict ? manualConflict.id : null,
            instructor_id: classData.instructor_id, 
            student_name: studentName,
        });
        setDetectedConflicts(conflicts);
        setIsConflictModalOpen(true);
        setLoading(false); 
      } else {
        await executeJoin(
            classData.id, 
            classData.name, 
            classData.instructor_id, 
            studentName,
            null, 
            []
        );
      }

    } catch (err) {
      console.error(err);
      showToast('Error', 'An unexpected error occurred.', 'error');
      setLoading(false);
    }
  };


  return (
    <>
      <div 
        className="p-6 md:p-8 rounded-2xl shadow-sm border border-[var(--color-border)] mb-8"
        style={{ backgroundColor: 'var(--color-components-bg)' }}
      >
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          + Join a Class
        </h2>
        <p className="mb-6 text-sm md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
          Enter the class code provided by your instructor
        </p>

        <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
          <input
            type="text"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
            placeholder="Enter Class Code"
            className="flex-1 px-4 py-3 rounded-lg border text-base outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            style={{ 
              backgroundColor: 'var(--color-bar-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)'
            }}
          />
          <button
            onClick={handleJoinClick}
            disabled={loading}
            className="px-8 py-3 rounded-lg font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'JOIN'}
          </button>
        </div>

        <div 
          className="mt-4 flex items-start gap-2 p-3 rounded-lg text-xs md:text-sm"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(30, 58, 138, 0.1)' : '#EFF6FF',
            color: theme === 'dark' ? '#93C5FD' : '#1E40AF'
          }}
        >
          <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
          <p>
            <span className="font-bold">Privacy Note:</span> By joining a class, you allow the instructor to view your schedule for conflict detection. This ensures exams and classes don't overlap with your other commitments.
          </p>
        </div>
      </div>

      <JoinConflictModal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        onConfirm={() => executeJoin(pendingClassData?.id, pendingClassData?.name, pendingClassData?.instructor_id, pendingClassData?.student_name, null, detectedConflicts)} 
        onConfirmReplace={handleReplaceAndJoin}
        newClassName={pendingClassData?.name || 'Class'}
        conflicts={detectedConflicts}
        isReplacingManualSubject={!!pendingClassData?.manualConflictId}
      />
    </>
  );
};

export default JoinClassCard;