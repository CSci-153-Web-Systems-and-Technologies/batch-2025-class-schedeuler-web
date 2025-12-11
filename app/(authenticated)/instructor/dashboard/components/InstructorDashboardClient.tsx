"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";
import { Plus } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import AppBreadcrumb from "@/app/components/ui/AppBreadCrumb";
import Greeting from "@/app/(authenticated)/components/Greeting";
import DashboardStats from "./DashboardStats";
import InstructorClasses from "./InstructorClasses";
import InstructorTasks from "./InstructorTasks";
import CalendarDisplay from "@/app/(authenticated)/components/CalendarDisplay";
import { useSubjects } from "@/app/(authenticated)/student/subjects/SubjectContext";
import dynamic from "next/dynamic";
import { CalendarEvent } from "@/types/calendar";

const CreateClassModal = dynamic(() => import("./CreateClassModal"), {
  ssr: false,
  loading: () => null,
});

const EventModal = dynamic(() => import("@/app/(authenticated)/student/calendar/components/EventModal"), {
  ssr: false,
  loading: () => null,
});

interface InstructorDashboardClientProps {
  userName: string;
  initialStats: {
    totalStudents: number;
    conflictCount: number;
  };
}

export default function InstructorDashboardClient({ userName, initialStats }: InstructorDashboardClientProps) {
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  
  const { refreshSubjects } = useSubjects();

  useEffect(() => {
    const toastType = searchParams.get('toast');
    if (toastType) {
      if (toastType === 'login') showToast("Welcome Back!", "Logged in successfully.", "success");
      if (toastType === 'signup') showToast("Welcome!", "Instructor account created.", "success");
      router.replace('/instructor/dashboard');
    }
  }, [searchParams, router, showToast]);

  // [NEW] Handler
  const handleClassClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  return (
    <div
      className="min-h-screen py-6 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--color-main-bg)" }}
    >
      <AppBreadcrumb />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <Greeting userName={userName} />
        
        <Button 
          onClick={() => setIsClassModalOpen(true)}
          className="bg-[#4169E1] hover:bg-[#3557C5] text-white font-semibold px-6 py-5 rounded-full shadow-lg transition-all hover:scale-105"
        >
          Create Class
          <Plus className="ml-2 h-5 w-5" strokeWidth={3} />
        </Button>
      </div>

      <DashboardStats initialData={initialStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        
        <div className="lg:col-span-2 min-h-[500px]">
          <InstructorClasses onClassClick={handleClassClick} />
        </div>

        <div className="flex flex-col gap-6">
          
          <div 
            className="p-4 rounded-2xl border border-[var(--color-border)] shadow-sm"
            style={{ backgroundColor: "var(--color-components-bg)" }}
          >
            <CalendarDisplay />
          </div>

          <div className="flex-1">
            <InstructorTasks />
          </div>
        </div>
      </div>

      {isClassModalOpen && (
        <CreateClassModal 
            isOpen={isClassModalOpen} 
            onClose={() => setIsClassModalOpen(false)} 
            onClassCreated={() => {
                refreshSubjects(); 
            }}
        />
      )}

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