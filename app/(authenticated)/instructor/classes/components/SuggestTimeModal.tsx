"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Loader2, RefreshCw, Vote, CalendarDays, Merge, Clock } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/app/context/ToastContext';
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/app/components/ui/Select";
import { useSubjects } from '@/app/(authenticated)/student/subjects/SubjectContext';
import { CalendarEvent, EventType, RepeatPattern } from '@/types/calendar';
import { findPatternSlots, Suggestion } from '@/utils/schedulingUtils';
import { Modal } from '@/app/components/ui/Modal';
import { differenceInMinutes, parse, format, isValid } from 'date-fns';

interface SuggestTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: any;
  onScheduleUpdated: () => void;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDays = (days: number[]) => {
    return days.sort().map(d => DAYS_OF_WEEK[d]).join(', ');
};

const timeToDate = (timeStr: string) => {
    const now = new Date();
    if (!timeStr) return now;
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    return d;
};

const fetchStudentBusyTimes = async (classId: string, supabase: any): Promise<{ [studentId: string]: CalendarEvent[] }> => {
    // 1. Get IDs of students enrolled in the CURRENT class
    const { data: currentEnrollments } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('class_id', classId)
        .eq('status', 'approved');

    if (!currentEnrollments || currentEnrollments.length === 0) return {};

    const studentIds = currentEnrollments.map((e: any) => e.student_id);

    const { data: studentManualEvents } = await supabase
        .from('events')
        .select(`
            id, title, type, start_time, end_time, subject_code, user_id, 
            color, repeat_pattern, repeat_days, repeat_until, exclude_dates
        `)
        .in('user_id', studentIds)
        .in('type', [EventType.SUBJECT, EventType.EXAM]); 

    const { data: otherClassEnrollments } = await supabase
        .from('enrollments')
        .select(`
            student_id,
            classes (
                id, name, start_time, end_time, repeat_days, repeat_until, subject_code, location
            )
        `)
        .in('student_id', studentIds)
        .eq('status', 'approved')
        .neq('class_id', classId);

    const groupedEvents: { [studentId: string]: CalendarEvent[] } = {};

    studentManualEvents?.forEach((item: any) => {
        const studentId = item.user_id;    

        const safeRepeatDays = Array.isArray(item.repeat_days) 
            ? item.repeat_days.map((d: any) => Number(d)) 
            : [];

        let pattern = item.repeat_pattern as RepeatPattern;
        if (item.type === EventType.SUBJECT && safeRepeatDays.length > 0) {
             pattern = RepeatPattern.WEEKLY;
        }

        const mappedEvent: CalendarEvent = {
            id: item.id,
            title: item.title,
            type: item.type as EventType,
            start: new Date(item.start_time),
            end: new Date(item.end_time),
            color: item.color,
            subjectCode: item.subject_code,
            repeatPattern: pattern || RepeatPattern.NONE,
            repeatDays: safeRepeatDays,
            repeatUntil: item.repeat_until ? new Date(item.repeat_until) : undefined,
            excludeDates: item.exclude_dates ? item.exclude_dates.map((d: string) => new Date(d)) : []
        };
        groupedEvents[studentId] = [...(groupedEvents[studentId] || []), mappedEvent];
    });

    otherClassEnrollments?.forEach((enrollment: any) => {
        const cls = enrollment.classes;
        if (!cls) return;
        
        const studentId = enrollment.student_id;
        
        const safeRepeatDays = Array.isArray(cls.repeat_days) 
            ? cls.repeat_days.map((d: any) => Number(d)) 
            : [];

        const mappedClassEvent: CalendarEvent = {
            id: `class_${cls.id}`, 
            title: cls.name,
            type: EventType.SUBJECT, 
            start: timeToDate(cls.start_time),
            end: timeToDate(cls.end_time),
            color: '#808080', 
            subjectCode: cls.subject_code,
            location: cls.location,
            repeatPattern: RepeatPattern.WEEKLY, 
            repeatDays: safeRepeatDays,
            repeatUntil: cls.repeat_until ? new Date(cls.repeat_until) : undefined
        };

        groupedEvents[studentId] = [...(groupedEvents[studentId] || []), mappedClassEvent];
    });

    return groupedEvents;
};
export default function SuggestTimeModal({ isOpen, onClose, classData, onScheduleUpdated }: SuggestTimeModalProps) {
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(90);
  const [dayPool, setDayPool] = useState<number[]>([1, 2, 3, 4, 5]);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(2);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [threshold, setThreshold] = useState(50);
  const [isMergedView, setIsMergedView] = useState(false);
  const [timePreference, setTimePreference] = useState<'any' | 'morning' | 'afternoon'>('any');

  const supabase = createClient();
  const { showToast } = useToast();
  const { subjects: instructorEvents } = useSubjects();

  useEffect(() => {
      if (isOpen && classData.id) {
          const now = new Date();
          if (classData.startTime && classData.endTime) {
             let start = parse(classData.startTime, 'HH:mm:ss', now);
             let end = parse(classData.endTime, 'HH:mm:ss', now);
             
             if (!isValid(start) || !isValid(end)) {
                start = parse(classData.startTime, 'HH:mm', now);
                end = parse(classData.endTime, 'HH:mm', now);
             }

             if (isValid(start) && isValid(end)) {
                setDuration(differenceInMinutes(end, start));
             }
          }
          
          if (classData.repeatDays && classData.repeatDays.length > 0) {
              setSessionsPerWeek(classData.repeatDays.length);
          }
          setSuggestions([]); 
          setIsMergedView(false);
          setTimePreference('any');
      }
  }, [isOpen, classData]);

  const toggleDayPool = (dayIndex: number) => {
      setDayPool(prev => 
          prev.includes(dayIndex) 
              ? prev.filter(d => d !== dayIndex) 
              : [...prev, dayIndex].sort()
      );
  };

  const handleGenerateSuggestions = useCallback(async () => {
    if (!classData.id) return;
    
    if (dayPool.length < sessionsPerWeek && sessionsPerWeek > 1) { 
       if (dayPool.length === 0) {
           showToast("Error", "Please select allowed days.", "error");
           return;
       }
    }

    setLoading(true);
    setSuggestions([]);
    setIsMergedView(false);

    try {
        const studentBusyEventsGrouped = await fetchStudentBusyTimes(classData.id, supabase);
        let allBusyEvents: { event: CalendarEvent, isInstructor: boolean, studentId?: string }[] = [];
        
        instructorEvents.forEach(e => {
            allBusyEvents.push({ event: e, isInstructor: true });
        });

        Object.entries(studentBusyEventsGrouped).forEach(([studentId, events]) => {
            events.forEach(e => {
                allBusyEvents.push({ event: e, isInstructor: false, studentId });
            });
        });

        let freeSlots = findPatternSlots(allBusyEvents, duration, dayPool, sessionsPerWeek, timePreference);

        if (freeSlots.length === 0 && sessionsPerWeek > 1) {
            const totalDuration = duration * sessionsPerWeek;
            const mergedSlots = findPatternSlots(allBusyEvents, totalDuration, dayPool, 1, timePreference);
            
            if (mergedSlots.length > 0) {
                freeSlots = mergedSlots.map(s => ({
                    ...s,
                    isMerged: true,
                    totalDuration: totalDuration
                }));
                setIsMergedView(true);
                showToast("Fallback Mode", "Standard patterns blocked. Found single-day merged options.", "info");
            }
        }
        
        setSuggestions(freeSlots);
        
        if (freeSlots.length === 0) {
            showToast("No Options Found", "Could not find standard patterns or merged fallback slots.", "warning");
        }

    } catch (error) {
        console.error("Error generating suggestions:", error);
        showToast('Error', 'Failed to generate suggestions.', 'error');
    } finally {
        setLoading(false);
    }
  }, [classData, duration, dayPool, sessionsPerWeek, instructorEvents, supabase, showToast, timePreference]);

  const handleCreateProposal = async (suggestion: Suggestion) => {
    setLoading(true);
    
    try {
        const dayLabel = formatDays(suggestion.days);
        const displayString = `${dayLabel} ${suggestion.startTime} - ${suggestion.endTime}`;

        const now = new Date();
        const startObj = parse(suggestion.startTime, 'h:mm a', now);
        const endObj = parse(suggestion.endTime, 'h:mm a', now);
        
        const newStartTime = format(startObj, 'HH:mm:ss');
        const newEndTime = format(endObj, 'HH:mm:ss');

        const { error: proposalError } = await supabase
          .from('proposals')
          .insert({
            class_id: classData.id,
            new_start_time: newStartTime,
            new_end_time: newEndTime,
            new_repeat_days: suggestion.days, 
            display_string: displayString,
            threshold_percent: threshold,
            status: 'pending'
          });

        if (proposalError) throw proposalError;

        const { data: students } = await supabase
            .from('enrollments')
            .select('student_id')
            .eq('class_id', classData.id)
            .eq('status', 'approved');

        if (students && students.length > 0) {
            const notifications = students.map(s => ({
                user_id: s.student_id,
                title: 'New Vote Required',
                message: `Vote on a schedule change for ${classData.name}: ${displayString}`,
                type: 'proposal',
                link: '/student/dashboard',
                is_read: false
            }));

            await supabase.from('notifications').insert(notifications);
        }

        showToast('Proposal Created', `Voting started for ${displayString}. Students have been notified.`, 'success');
        onClose();
        if (onScheduleUpdated) onScheduleUpdated();

    } catch (error: any) {
      console.error(error);
      showToast('Error', error.message || 'Failed to create proposal.', 'error');
    } finally {
        setLoading(false);
    }
  };

  const headerContent = (
      <div className="flex items-center gap-2">
         <Clock size={20} /> Smart Suggest
      </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} headerContent={headerContent}>
        <div className="p-6 space-y-6">
            <div className={`p-3 rounded-lg text-sm border ${isMergedView ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800' : 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900'}`}>
                <p className={`font-medium ${isMergedView ? 'text-amber-800 dark:text-amber-300' : 'text-blue-800 dark:text-blue-300'}`}>
                    {isMergedView 
                        ? "Could not find slots for your multi-day pattern. Showing available SINGLE-DAY slots with combined duration."
                        : "Finds slots that work for ALL selected days. If none found, tries to merge duration into one day."
                    }
                </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="text-[var(--color-text-primary)]">Sessions per Week</Label>
                    <div className="flex items-center gap-2 mt-1">
                        <Button 
                            variant="outline" 
                            size="sm"
                            className="h-9 w-9"
                            onClick={() => setSessionsPerWeek(Math.max(1, sessionsPerWeek - 1))}
                        >
                            -
                        </Button>
                        <span className="font-bold text-lg text-[var(--color-text-primary)] w-6 text-center">{sessionsPerWeek}</span>
                        <Button 
                            variant="outline" 
                            size="sm"
                            className="h-9 w-9"
                            onClick={() => setSessionsPerWeek(Math.min(5, sessionsPerWeek + 1))}
                        >
                            +
                        </Button>
                    </div>
                </div>
                
                <div>
                    <Label className="text-[var(--color-text-primary)]">Duration (Minutes)</Label>
                    <Input 
                        type='number'
                        min={30}
                        step={15}
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                        className="mt-1 bg-[var(--color-bar-bg)] text-[var(--color-text-primary)]"
                    />
                </div>
            </div>

            <div>
                <Label className="text-[var(--color-text-primary)] mb-2 block">Time Preference</Label>
                <Select 
                    value={timePreference} 
                    onValueChange={(val: any) => setTimePreference(val)}
                >
                    <SelectTrigger className="w-full bg-[var(--color-bar-bg)] border-[var(--color-border)] text-[var(--color-text-primary)]">
                        <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="any">Any Time (7 AM - 8 PM)</SelectItem>
                        <SelectItem value="morning">Morning Only (7 AM - 12 PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon Only (1 PM - 8 PM)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <Label className="text-[var(--color-text-primary)]">Voting Threshold</Label>
                    <span className="text-sm font-bold text-[var(--color-primary)]">{threshold}%</span>
                </div>
                <input
                    type="range"
                    min="10"
                    max="100"
                    step="10"
                    value={threshold}
                    onChange={(e) => setThreshold(parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-[var(--color-border)] accent-[var(--color-primary)]"
                />
            </div>

            <div>
                <Label className="text-[var(--color-text-primary)] mb-2 block">Allowed Days Pool</Label>
                <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day, index) => (
                        <button
                            key={day}
                            onClick={() => toggleDayPool(index)}
                            className={`size-8 rounded-full text-xs font-bold transition-all border ${
                                dayPool.includes(index)
                                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                                    : 'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-hover)]'
                            }`}
                        >
                            {day.charAt(0)}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    System will try combinations from this pool (e.g. T/Th from M-F).
                </p>
            </div>

            <Button 
                onClick={handleGenerateSuggestions}
                disabled={loading || duration < 30}
                className="w-full bg-[var(--color-primary)] text-white h-10"
            >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw size={16} className='mr-1' />}
                Find Valid Slots
            </Button>

            <h3 className='text-lg font-semibold border-b pb-2 border-[var(--color-border)] text-[var(--color-text-primary)]'>
                {isMergedView ? 'Fallback Options (Merged)' : 'Conflict-Free Patterns'}
            </h3>

            <div className='space-y-3'>
                {loading ? (
                    <div className='flex items-center justify-center py-6 text-[var(--color-text-secondary)]'>
                        <Loader2 className="animate-spin mr-2" /> Analyzing...
                    </div>
                ) : suggestions.length > 0 ? (
                    suggestions.map((s, index) => (
                        <div 
                            key={index} 
                            className={`flex items-center justify-between p-4 rounded-xl border ${s.isMerged ? 'border-amber-300 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/10' : 'border-green-300 dark:border-green-700/50 bg-green-50 dark:bg-green-900/10'}`}
                        >
                            <div className='text-[var(--color-text-primary)]'>
                                <div className='flex items-center gap-2'>
                                    {s.isMerged ? <Merge size={16} className="text-amber-600"/> : <CalendarDays size={16} className="text-green-600"/>}
                                    <p className='font-bold text-base md:text-lg'>
                                        {formatDays(s.days)}
                                    </p>
                                </div>
                                <p className='text-xs text-[var(--color-text-secondary)] mt-1 font-medium'>
                                    @ {s.startTime} - {s.endTime} ({s.totalDuration} mins)
                                </p>
                            </div>
                            <Button 
                                size='sm'
                                onClick={() => handleCreateProposal(s)}
                                className={`text-white ${s.isMerged ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                <Vote size={16} className="mr-1.5" /> Vote
                            </Button>
                        </div>
                    ))
                ) : (
                    <div className='text-center py-4 text-[var(--color-text-secondary)] text-sm'>
                        <p className='italic mb-1'>No patterns found.</p>
                        <p className='opacity-70 text-xs'>Try reducing session count or duration.</p>
                    </div>
                )}
            </div>
        </div>
    </Modal>
  );
}