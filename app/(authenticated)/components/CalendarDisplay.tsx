// components/dashboard/calendar-display.tsx
"use client";

import React, { useMemo } from "react";
import { Calendar, CalendarMarker } from "@/app/components/ui/Calendar";
import { useSubjects } from "../student/subjects/SubjectContext";
import { useTasks } from "../student/tasks/TaskContext";
import { generateRecurringEvents } from "@/utils/calendarUtils";
import { EventType } from "@/types/calendar";
import moment from "moment";

export default function CalendarDisplay() {
  const [month, setMonth] = React.useState<Date>(new Date());
  const [selected, setSelected] = React.useState<Date | undefined>(new Date());
  
  const { subjects } = useSubjects();
  const { tasks } = useTasks();

  const markers = useMemo(() => {
    const recurringEvents = generateRecurringEvents(subjects, month, 'month');
    
    const taskEvents = tasks.filter(t => {
        if (!t.start) return false;
        return t.start.getMonth() === month.getMonth() && t.start.getFullYear() === month.getFullYear();
    });

    const allEvents = [...recurringEvents, ...taskEvents];

    const markerMap = new Map<string, CalendarMarker>();

    allEvents.forEach(evt => {
        const dateKey = evt.start.toDateString();
        
        if (!markerMap.has(dateKey)) {
            markerMap.set(dateKey, {
                date: evt.start,
                events: []
            });
        }

        markerMap.get(dateKey)?.events.push({
            title: evt.title,
            color: evt.color || (evt.type === EventType.TASK ? '#ff4d4f' : '#4169e1'),
            type: evt.type,
            time: evt.allDay ? 'All Day' : moment(evt.start).format('h:mm A')
        });
    });

    return Array.from(markerMap.values());
  }, [subjects, tasks, month]);

  const handleSelect = (date: Date | undefined) => {
    setSelected(date);
  };

  return (
    <div className="w-full">
      <Calendar
        mode="single"
        selected={selected}
        onSelect={handleSelect}
        month={month}
        onMonthChange={setMonth}
        captionLayout="dropdown"
        showOutsideDays={true}
        fixedWeeks={true}
        fromYear={1900}
        toYear={2100}
        className="w-full"
        markedDates={markers}
      />
    </div>
  );
}