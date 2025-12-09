"use client";

import React, { useMemo } from 'react';
import { useSubjects } from '@/app/(authenticated)/student/subjects/SubjectContext';
import { CalendarEvent, EventType } from '@/types/calendar';
import { generateRecurringEvents } from '@/utils/calendarUtils';
import ClassCard, { ClassCardProps } from '@/app/(authenticated)/components/ClassCard';
import moment from 'moment';

const InstructorTodayClasses: React.FC = () => {
    const { subjects: allSubjects, loading } = useSubjects();
    
    const todayClasses = useMemo(() => {
        const today = new Date();
        
        const eventsToday = generateRecurringEvents(allSubjects, today, 'day')
            .filter(e => e.type === EventType.SUBJECT)
            .sort((a, b) => a.start.getTime() - b.start.getTime());

        return eventsToday.map((subj: CalendarEvent): ClassCardProps => ({
            subject: subj.subjectCode ? `${subj.subjectCode} - ${subj.title}` : subj.title,
            type: subj.location || 'Location TBD',
            time: `${moment(subj.start).format('h:mm A')} - ${moment(subj.end).format('h:mm A')}`,
            bgColor: subj.color,
        }));
    }, [allSubjects]);

    return (
        <div className="p-4 rounded-xl shadow-md" style={{ backgroundColor: 'var(--color-components-bg)' }}>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Today's Classes
            </h2>

            {loading ? (
               <p className="text-sm text-[var(--color-text-secondary)] italic py-2">Loading...</p>
            ) : todayClasses.length > 0 ? (
                <div className="space-y-2"> 
                    {todayClasses.map((cls, index) => (
                        <ClassCard 
                            key={index} 
                            subject={cls.subject} 
                            type={cls.type} 
                            time={cls.time}
                            bgColor={cls.bgColor}
                            borderColor={cls.borderColor}
                            className="p-3 shadow-none border-l-[4px] [&_h3]:text-base [&_h3]:leading-tight [&_span]:text-[12px] [&_p]:text-[13px]" 
                        />
                    ))}
                </div>
            ) : (
                <p className="text-sm text-[var(--color-text-secondary)] italic py-2">
                    No classes scheduled for today.
                </p>
            )}
        </div>
    );
};

export default InstructorTodayClasses;