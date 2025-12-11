"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { X, Clock, Loader2, RefreshCw, Vote, CalendarDays, Merge } from 'lucide-react';
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
import { generateRecurringEvents } from '@/utils/calendarUtils';
import moment from 'moment';
import { addMinutes, format, set } from 'date-fns';

interface SuggestTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: any;
  onScheduleUpdated: () => void;
}

interface Suggestion {
    days: number[]; 
    startTime: string;
    endTime: string;
    busyCount: number;
    busyStudentNames: string[];
    isMerged?: boolean; 
    totalDuration?: number;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDays = (days: number[]) => {
    return days.sort().map(d => DAYS_OF_WEEK[d]).join(', ');
};

const getCombinations = (pool: number[], k: number): number[][] => {
    const result: number[][] = [];
    const f = (start: number, current: number[]) => {
        if (current.length === k) {
            result.push([...current]);
            return;
        }
        for (let i = start; i < pool.length; i++) {
            current.push(pool[i]);
            f(i + 1, current);
            current.pop();
        }
    };
    f(0, []);
    return result;
};

const fetchStudentBusyTimes = async (classId: string, supabase: any): Promise<{ [studentId: string]: CalendarEvent[] }> => {
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('class_id', classId)
        .eq('status', 'approved');

    if (!enrollments || enrollments.length === 0) return {};

    const studentIds = enrollments.map((e: any) => e.student_id);

    const { data: studentEvents } = await supabase
        .from('events')
        .select(`
            id, title, type, start_time, end_time, subject_code, user_id, 
            color, repeat_pattern, repeat_days, repeat_until, exclude_dates
        `)
        .in('user_id', studentIds)
        .in('type', [EventType.SUBJECT, EventType.EXAM]);

    if (!studentEvents) return {};
    
    const groupedEvents: { [studentId: string]: CalendarEvent[] } = {};
    studentEvents.forEach((item: any) => {
        const studentId = item.user_id;
        const mappedEvent: CalendarEvent = {
            id: item.id,
            title: item.title,
            type: item.type as EventType,
            start: new Date(item.start_time),
            end: new Date(item.end_time),
            color: item.color,
            subjectCode: item.subject_code,
            repeatPattern: item.repeat_pattern as RepeatPattern,
            repeatDays: item.repeat_days || [],
        };
        groupedEvents[studentId] = [...(groupedEvents[studentId] || []), mappedEvent];
    });

    return groupedEvents;
};

const findPatternSlots = (
    allBusyEvents: { event: CalendarEvent, isInstructor: boolean, studentId?: string }[], 
    durationMinutes: number,
    poolDays: number[], 
    sessionsPerWeek: number,
    timePreference: 'any' | 'morning' | 'afternoon'
): Suggestion[] => {
    const suggestions: Suggestion[] = [];
    const intervalMinutes = 30;
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const searchWindowEnd = moment(now).add(7, 'days').toDate();

    const busyInstances: { start: Date, end: Date }[] = [];
    allBusyEvents.forEach(busyEvent => {
        const instances = generateRecurringEvents(
            [busyEvent.event], 
            now, 
            'week' 
        ).filter(instance => instance.start >= now && instance.start <= searchWindowEnd);
        
        instances.forEach(ins => {
            busyInstances.push({ start: ins.start, end: ins.end });
        });
    });

    const dayCombinations = getCombinations(poolDays, sessionsPerWeek);

    let startHour = 7; 
    let endHour = 20;

    if (timePreference === 'morning') {
        endHour = 12;
    } else if (timePreference === 'afternoon') {
        startHour = 13; 
        endHour = 20; 
    }

    let baseTime = set(now, { hours: startHour, minutes: 0, seconds: 0, milliseconds: 0 }); 
    const endTimeLimit = set(now, { hours: endHour, minutes: 0 }); 

    while (addMinutes(baseTime, durationMinutes) <= endTimeLimit) {
        const timeSlotStartStr = format(baseTime, 'HH:mm'); 
        const slotDurationEnd = addMinutes(baseTime, durationMinutes);
        
        for (const combination of dayCombinations) {
            let comboConflict = false;

            for (const dayIndex of combination) {
                let checkDate = new Date(now);
                const todayIndex = checkDate.getDay();
                const daysUntil = (dayIndex + 7 - todayIndex) % 7;
                checkDate.setDate(checkDate.getDate() + daysUntil);
                
                const [h, m] = timeSlotStartStr.split(':').map(Number);
                const specificStart = set(checkDate, { hours: h, minutes: m });
                const specificEnd = addMinutes(specificStart, durationMinutes);

                const isBlocked = busyInstances.some(busy => 
                    moment(specificStart).isBefore(busy.end) && moment(specificEnd).isAfter(busy.start)
                );

                if (isBlocked) {
                    comboConflict = true;
                    break; 
                }
            }

            if (!comboConflict) {
                suggestions.push({
                    days: combination,
                    startTime: format(baseTime, 'h:mm a'),
                    endTime: format(slotDurationEnd, 'h:mm a'),
                    busyCount: 0,
                    busyStudentNames: [],
                    totalDuration: durationMinutes
                });
            }
            
            if (suggestions.length >= 5) break; 
        }
        
        baseTime = addMinutes(baseTime, intervalMinutes);
        if (suggestions.length >= 5) break;
    }

    return suggestions;
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
          const start = moment(classData.startTime, 'HH:mm');
          const end = moment(classData.endTime, 'HH:mm');
          if (start.isValid() && end.isValid()) {
             setDuration(end.diff(start, 'minutes'));
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
    
    const dayLabel = formatDays(suggestion.days);
    const displayString = `${dayLabel} ${suggestion.startTime} - ${suggestion.endTime}`;

    const newStartTime = moment(suggestion.startTime, 'h:mm a').format('HH:mm:ss');
    const newEndTime = moment(suggestion.endTime, 'h:mm a').format('HH:mm:ss');

    const { error } = await supabase
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

    setLoading(false);

    if (error) {
      console.error(error);
      showToast('Error', 'Failed to create proposal.', 'error');
    } else {
      showToast('Proposal Created', `Voting started for ${displayString}`, 'success');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-components-bg)] w-full max-w-lg rounded-2xl shadow-xl border border-[var(--color-border)] flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center sticky top-0 bg-[var(--color-components-bg)] z-10">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Clock size={20} /> Smart Suggest
          </h2>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
            <X size={24} />
          </button>
        </div>

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
      </div>
    </div>
  );
}