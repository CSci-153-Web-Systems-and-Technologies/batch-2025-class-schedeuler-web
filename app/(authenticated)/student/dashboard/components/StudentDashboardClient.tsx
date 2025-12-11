"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation"; 
import { useToast } from "@/app/context/ToastContext"; 
import { format } from 'date-fns';
import dynamic from "next/dynamic";

import AppBreadcrumb from "@/app/components/ui/AppBreadCrumb";
import Greeting from "@/app/(authenticated)/components/Greeting";
import CalendarDisplay from "@/app/(authenticated)/components/CalendarDisplay";
import StudentOverview from "./StudentOverview";
import TasksDeadline from "./TasksDeadline";
import PomodoroTimer from "./PomodoroTimer";
import SubjectsList from "./SubjectsList";
import StudentVoteCard from "./StudentVoteCard";

import { ClassCardProps } from "@/app/(authenticated)/components/ClassCard";
import { CalendarEvent, EventType } from '@/types/calendar';
import { useSubjects } from "../../subjects/SubjectContext";
import { generateRecurringEvents } from "@/utils/calendarUtils";

const JoinClassButton = dynamic(() => import("./JoinClassButton"), {
  ssr: false,
  loading: () => <div className="h-10 w-32 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse" />,
});

const EventModal = dynamic(() => import("../../calendar/components/EventModal"), {
  ssr: false,
  loading: () => null,
});

interface StudentDashboardClientProps {
  userName: string;
}

export default function StudentDashboardClient({ userName }: StudentDashboardClientProps) {
  const { subjects: allSubjects } = useSubjects(); 
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const toastShownRef = useRef(false);

  useEffect(() => {
    const toastType = searchParams.get('toast');
    if (toastType && !toastShownRef.current) {
      if (toastType === 'login') showToast("Welcome Back!", "Logged in successfully.", "success");
      else if (toastType === 'signup') showToast("Welcome!", "Account created successfully.", "success");
      
      toastShownRef.current = true;
      router.replace('/student/dashboard'); 
    }
  }, [searchParams, showToast, router]);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const todaySchedule = useMemo(() => {
     const eventsToday = generateRecurringEvents(allSubjects, new Date(), 'day');
     const subjectInstances = eventsToday.filter(e => e.type === EventType.SUBJECT);
     subjectInstances.sort((a, b) => a.start.getTime() - b.start.getTime());

     return subjectInstances.map((subj): ClassCardProps => ({
        subject: subj.title,
        type: subj.location || 'Class',
        time: `${format(subj.start, 'h:mm a')} - ${format(subj.end, 'h:mm a')}`,
        bgColor: subj.color,
        onClick: () => handleEventClick(subj) 
     }));
  }, [allSubjects]);

  const subjectsListData = useMemo(() => {
      const uniqueSubjects = allSubjects.filter(subj => subj.type === EventType.SUBJECT);
      return uniqueSubjects.map(subj => ({
          name: subj.title,
          color: subj.color || '#4169e1'
      }));
  }, [allSubjects]);

  return (
    <div
      className="min-h-screen py-6 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--color-main-bg)" }}
    >
      <AppBreadcrumb />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <Greeting userName={userName} />
        <JoinClassButton className="shadow-lg hover:scale-105 transition-transform" />
      </div>

      <StudentVoteCard />
      <div className="flex flex-col xl:flex-row gap-6 mb-6">
        
        <div className="w-full xl:w-2/3">
          <StudentOverview subjects={todaySchedule} />
        </div>

        <div className="w-full xl:w-1/3 flex flex-col gap-6">
          <div 
            className="p-4 rounded-2xl border border-[var(--color-border)] shadow-sm bg-[var(--color-components-bg)]"
          >
            <CalendarDisplay />
          </div>

          <div>
             <PomodoroTimer />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <TasksDeadline /> 
        </div>
        <div className="flex-1 min-w-0">  
          <SubjectsList subjects={subjectsListData} />
        </div>  
      </div>

      {/* Render Modal */}
      {isEventModalOpen && selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setIsEventModalOpen(false)}
          onSave={() => setIsEventModalOpen(false)} 
          onDelete={() => setIsEventModalOpen(false)}
          isScheduleOnly={false}
        />
      )}
    </div>
  );
}