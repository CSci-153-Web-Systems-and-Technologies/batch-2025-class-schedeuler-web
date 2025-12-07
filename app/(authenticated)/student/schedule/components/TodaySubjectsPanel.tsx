// app/(authenticated)/student/schedule/components/TodaySubjectsPanel.tsx
"use client";

import React, { useMemo } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Plus } from 'lucide-react';
import { useSubjects } from '../../subjects/SubjectContext';
import { CalendarEvent, EventType } from '@/types/calendar';
import { generateRecurringEvents } from '@/utils/calendarUtils';
import ClassCard, { ClassCardProps } from '@/app/(authenticated)/components/ClassCard';
import moment from 'moment';

interface TodaySubjectsPanelProps {
    onAddSubject: () => void; 
}

const TodaySubjectsPanel: React.FC<TodaySubjectsPanelProps> = ({ onAddSubject }) => {
    const { subjects: allSubjects } = useSubjects();
    
    // Logic to find today's recurring subjects
    const todaySubjects = useMemo(() => {
        const today = moment().toDate();
        
        // Generate recurring events for a one-day interval
        const eventsToday = generateRecurringEvents(allSubjects, today, 'day')
            .filter(e => e.type === EventType.SUBJECT)
            .sort((a, b) => a.start.getTime() - b.start.getTime()); // Sort by time

        // Convert to ClassCardProps
        return eventsToday.map((subj: CalendarEvent): ClassCardProps => ({
            // Cleaned up the title format for the card
            subject: subj.subjectCode ? `${subj.subjectCode} - ${subj.title}` : subj.title,
            type: subj.location || 'Class',
            time: `${moment(subj.start).format('h:mm A')} - ${moment(subj.end).format('h:mm A')}`,
            bgColor: subj.color,
            // Automatic darker border logic will handle this
        }));
    }, [allSubjects]);

    // Function to handle the button click
    const handleAddSubject = () => {
        onAddSubject();
    };

    return (
        <div className="p-4 rounded-xl shadow-md" style={{ backgroundColor: 'var(--color-components-bg)' }}>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Today's Subjects
            </h2>

            {todaySubjects.length > 0 ? (
                <div className="space-y-2"> 
                    {todaySubjects.map((subj, index) => (
                        <ClassCard 
                            key={index} 
                            subject={subj.subject} 
                            type={subj.type} 
                            time={subj.time}
                            bgColor={subj.bgColor}
                            borderColor={subj.borderColor}
                            // [FIX] Compact styling: Reduced padding and font sizes using arbitrary selectors
                            // [&_h3]: Targets the subject title
                            // [&_span]: Targets the class type/location
                            // [&_p]: Targets the time
                            className="p-2 shadow-none border-l-[4px] [&_h3]:text-base [&_h3]:leading-tight [&_span]:text-[12px] [&_p]:text-[13px]" 
                        />
                    ))}
                </div>
            ) : (
                <p className="text-sm text-[var(--color-text-secondary)] italic py-2">No classes scheduled for today.</p>
            )}

            <div className="mt-4 flex justify-center">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[var(--color-primary)] hover:bg-[var(--color-hover)]"
                    onClick={handleAddSubject} 
                >
                    <Plus size={16} className="mr-1" />
                    Add Subject
                </Button>
            </div>
        </div>
    );
};

export default TodaySubjectsPanel;