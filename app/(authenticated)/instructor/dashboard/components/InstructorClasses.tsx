// app/(authenticated)/instructor/dashboard/components/InstructorClasses.tsx
"use client";

import React, { useMemo } from "react";
import ClassCard, { ClassCardProps } from "@/app/(authenticated)/components/ClassCard";
import { useSubjects } from "@/app/(authenticated)/student/subjects/SubjectContext";
import { generateRecurringEvents } from "@/utils/calendarUtils";
import { EventType, CalendarEvent } from "@/types/calendar";
import moment from "moment";
import Link from "next/link"; // For the "View Schedule" or similar if needed

export default function InstructorClasses() {
  const { subjects: allSubjects, loading } = useSubjects();
  const currentDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const todayClasses = useMemo(() => {
    const today = new Date();
    // Generate events for today based on recurrence patterns
    const eventsToday = generateRecurringEvents(allSubjects, today, 'day');
    
    // Filter for subjects and sort by time
    return eventsToday
      .filter(e => e.type === EventType.SUBJECT)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .map((subj: CalendarEvent): ClassCardProps => ({
        subject: subj.subjectCode ? `${subj.subjectCode} - ${subj.title}` : subj.title,
        type: subj.location || 'Room TBD', // Use location for instructors
        time: `${moment(subj.start).format('h:mm A')} - ${moment(subj.end).format('h:mm A')}`,
        bgColor: subj.color,
      }));
  }, [allSubjects]);

  return (
    <div 
      className="p-6 rounded-2xl border border-[var(--color-border)] shadow-sm h-full flex flex-col"
      style={{ backgroundColor: "var(--color-components-bg)" }}
    >
      <div className="flex justify-between items-center mb-6 pb-2 border-b border-[var(--color-border)]">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Today's Classes</h2>
        <span className="text-sm font-bold text-[var(--color-text-secondary)]">{currentDate}</span>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        {loading ? (
           <p className="text-sm text-[var(--color-text-secondary)]">Loading schedule...</p>
        ) : todayClasses.length > 0 ? (
          todayClasses.map((cls, index) => (
            <ClassCard
              key={index}
              {...cls}
              className="border-l-[6px] shadow-sm hover:translate-x-1 transition-transform"
            />
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <p className="text-lg font-medium text-[var(--color-text-primary)]">No classes scheduled for today.</p>
            <p className="text-sm text-[var(--color-text-secondary)]">Check your calendar to add sessions.</p>
          </div>
        )}
      </div>
    </div>
  );
}