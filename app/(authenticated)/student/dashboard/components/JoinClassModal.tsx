// app/(authenticated)/student/dashboard/components/JoinClassModal.tsx
"use client";

import React, { useState } from 'react';
import { X, Search, Loader2, ShieldAlert } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/app/context/ToastContext';
import { useSubjects } from '../../subjects/SubjectContext';
import { getConflictingEvents } from '@/utils/calendarUtils';
import { CalendarEvent, EventType, RepeatPattern } from '@/types/calendar';
import JoinConflictModal from '../../classes/components/JoinConflictModal';
import moment from 'moment';

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinClassModal({ isOpen, onClose }: JoinClassModalProps) {
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundClass, setFoundClass] = useState<any | null>(null);
  
  // Conflict Handling State
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [detectedConflicts, setDetectedConflicts] = useState<CalendarEvent[]>([]);
  const [pendingJoinData, setPendingJoinData] = useState<any>(null);

  const supabase = createClient();
  const { showToast } = useToast();
  const { subjects: currentSchedule, refreshSubjects, deleteSubject } = useSubjects();

  // Helper: Fetch current user name for the notification
  const fetchCurrentUserName = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single();
    return profile?.name || 'A Student';
  };

  const generateConflictReport = (conflicts: CalendarEvent[]): string[] => {
    if (!conflicts || conflicts.length === 0) return [];
    return conflicts.map(c => 
        `Conflict with '${c.title}' (${c.subjectCode || c.type}), ${moment(c.start).format('h:mm A')} - ${moment(c.end).format('h:mm A')}`
    );
  };

  const handleSearch = async () => {
    if (!classCode.trim()) return;
    setLoading(true);
    setFoundClass(null);

    // [UPDATED] Fetch schedule details needed for conflict detection
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id, name, instructor_id, start_time, end_time, repeat_days')
      .eq('code', classCode.trim())
      .single();

    if (classError || !classData) {
      console.error("Search Error:", classError);
      showToast('Error', 'Class not found. Check the code or your connection.', 'error');
      setLoading(false);
      return;
    }

    // Fetch instructor name manually
    let instructorName = 'Unknown Instructor';
    if (classData.instructor_id) {
        const { data: profileData } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', classData.instructor_id)
            .single();
        
        if (profileData) instructorName = profileData.name;
    }

    setLoading(false);
    setFoundClass({ 
        ...classData, 
        profiles: { name: instructorName } 
    });
  };

  // The actual database insertion logic
  const executeJoin = async (
    eventIdToDelete: string | null = null, 
    finalConflicts: CalendarEvent[] = []
  ) => {
    if (!foundClass) return;
    setLoading(true);
    setIsConflictModalOpen(false);

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // If replacing a manual entry, delete it first
        if (eventIdToDelete) {
            await deleteSubject(eventIdToDelete);
        }

        const studentName = await fetchCurrentUserName(user.id);
        const conflictReport = generateConflictReport(finalConflicts);

        const { error } = await supabase
        .from('enrollments')
        .insert([
            {
            student_id: user.id,
            class_id: foundClass.id,
            status: 'pending',
            conflict_report: conflictReport
            }
        ]);

        if (error) {
            if (error.code === '23505') { 
                showToast('Info', 'You have already requested to join this class.', 'info');
            } else {
                showToast('Error', 'Failed to join class.', 'error');
            }
        } else {
            // Notify Instructor
            await supabase.from('notifications').insert({
                user_id: foundClass.instructor_id,
                title: 'New Enrollment Request',
                message: `${studentName} has requested to join "${foundClass.name}".`,
                type: 'info',
                link: '/instructor/classes',
                is_read: false
            });

            showToast('Success', 'Request sent! Waiting for approval.', 'success');
            refreshSubjects();
            
            // Reset and close
            onClose();
            setClassCode('');
            setFoundClass(null);
            setPendingJoinData(null);
        }
    } catch (err: any) {
        console.error("Join Error:", err);
        showToast("Error", "An unexpected error occurred.", "error");
    } finally {
        setLoading(false);
    }
  };

  // Called when user clicks "Send Join Request"
  const handleCheckConflictsAndJoin = async () => {
    if (!foundClass) return;
    
    // 1. Construct a tentative event for the class
    const now = new Date();
    now.setSeconds(0);
    now.setMilliseconds(0);

    const [startH, startM] = (foundClass.start_time || "00:00").split(':').map(Number);
    const [endH, endM] = (foundClass.end_time || "00:00").split(':').map(Number);

    const startDate = new Date(now);
    startDate.setHours(startH, startM, 0, 0);
    
    const endDate = new Date(now);
    endDate.setHours(endH, endM, 0, 0);

    const tentativeEvent: CalendarEvent = {
        id: `temp_check_${foundClass.id}`,
        title: foundClass.name,
        type: EventType.SUBJECT,
        start: startDate,
        end: endDate,
        repeatPattern: RepeatPattern.WEEKLY,
        repeatDays: foundClass.repeat_days || [],
    };

    // 2. Check for conflicts
    const conflicts = getConflictingEvents(tentativeEvent, currentSchedule);

    if (conflicts.length > 0) {
        // 3a. If conflicts found, open the conflict modal
        const manualConflict = conflicts.find(c => c.type === EventType.SUBJECT && !c.id.startsWith('class_'));
        
        setPendingJoinData({
            manualConflictId: manualConflict ? manualConflict.id : null,
        });
        setDetectedConflicts(conflicts);
        setIsConflictModalOpen(true);
    } else {
        // 3b. No conflicts, join immediately
        await executeJoin(null, []);
    }
  };

  const handleReplaceAndJoin = async () => {
    if (!pendingJoinData || !pendingJoinData.manualConflictId) return;
    await executeJoin(pendingJoinData.manualConflictId, detectedConflicts);
  };

  if (!isOpen) return null;

  return (
    <>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[var(--color-components-bg)] w-full max-w-md rounded-2xl shadow-xl border border-[var(--color-border)] flex flex-col overflow-hidden">
            
            <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Join a Class</h2>
            <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                <X size={24} />
            </button>
            </div>

            <div className="p-6 space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-secondary)]">Class Code</label>
                <div className="flex gap-2">
                <input
                    type="text"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WEB-123"
                    className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-bar-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <button
                    onClick={handleSearch}
                    disabled={loading || !classCode}
                    className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                </button>
                </div>
            </div>

            {foundClass && (
                <div className="bg-[var(--color-hover)] p-4 rounded-xl border border-[var(--color-border)]">
                <h3 className="font-bold text-lg text-[var(--color-text-primary)]">{foundClass.name}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                    Instructor: {foundClass.profiles?.name || 'Unknown'}
                </p>
                
                <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-xs text-blue-800 dark:text-blue-300">
                    <ShieldAlert size={14} className="mt-0.5 flex-shrink-0" />
                    <p>
                    <span className="font-bold">Privacy Note:</span> Joining this class allows the instructor to view your schedule for conflict detection.
                    </p>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                    <button
                    onClick={handleCheckConflictsAndJoin}
                    disabled={loading}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                    {loading ? 'Processing...' : 'Send Join Request'}
                    </button>
                </div>
                </div>
            )}
            </div>
        </div>
        </div>

        <JoinConflictModal
            isOpen={isConflictModalOpen}
            onClose={() => setIsConflictModalOpen(false)}
            onConfirm={() => executeJoin(null, detectedConflicts)} 
            onConfirmReplace={handleReplaceAndJoin}
            newClassName={foundClass?.name || 'Class'}
            conflicts={detectedConflicts}
            isReplacingManualSubject={!!pendingJoinData?.manualConflictId}
        />
    </>
  );
}