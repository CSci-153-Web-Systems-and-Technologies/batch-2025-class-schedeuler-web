// app/(authenticated)/student/dashboard/page.tsx
"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation"; 
import { createClient } from "@/utils/supabase/client"; 
import { useToast } from "@/app/context/ToastContext"; 
import moment from 'moment';
import AppBreadcrumb from "@/app/components/ui/AppBreadCrumb";
import Greeting from "@/app/(authenticated)/components/Greeting";
import CalendarDisplay from "@/app/(authenticated)/components/CalendarDisplay";
import StudentOverview from "./components/StudentOverview";
import TasksDeadline from "./components/TasksDeadline";
import JoinClassButton from "./components/JoinClassButton";
import PomodoroTimer from "./components/PomodoroTimer";
import SubjectsList from "./components/SubjectsList";
import StudentVoteCard from "./components/StudentVoteCard";

import { ClassCardProps } from "../../components/ClassCard";
import { EventType } from '@/types/calendar';
import { useSubjects } from "../subjects/SubjectContext";
import { generateRecurringEvents } from "@/utils/calendarUtils";

export default function StudentDashboard() {
  const [userName, setUserName] = useState("Student");
  const supabase = createClient();
  const { subjects: allSubjects } = useSubjects(); 
  
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

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; 
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();
      
      if (profile?.name) {
        setUserName(profile.name.split(" ")[0]);
      }
    }
    getUser();
  }, [supabase]);

  const todaySchedule = useMemo(() => {
     const eventsToday = generateRecurringEvents(allSubjects, new Date(), 'day');
     const subjectInstances = eventsToday.filter(e => e.type === EventType.SUBJECT);
     subjectInstances.sort((a, b) => a.start.getTime() - b.start.getTime());

     return subjectInstances.map((subj): ClassCardProps => ({
        subject: subj.title,
        type: subj.location || 'Class',
        time: `${moment(subj.start).format('h:mm A')} - ${moment(subj.end).format('h:mm A')}`,
        bgColor: subj.color,
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
    </div>
  );
}