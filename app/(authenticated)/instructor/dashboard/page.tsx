"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";
import { Plus } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import AppBreadcrumb from "@/app/components/ui/AppBreadCrumb";
import Greeting from "@/app/(authenticated)/components/Greeting";
import DashboardStats from "./components/DashboardStats";
import InstructorClasses from "./components/InstructorClasses";
import InstructorTasks from "./components/InstructorTasks";
import CalendarDisplay from "@/app/(authenticated)/components/CalendarDisplay";
import CreateClassModal from "./components/CreateClassModal";

import { useSubjects } from "@/app/(authenticated)/student/subjects/SubjectContext";

export default function InstructorDashboard() {
  const [userName, setUserName] = useState("Instructor");
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  
  const supabase = createClient();
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

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        
        <div className="lg:col-span-2 min-h-[500px]">
          <InstructorClasses />
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

      <CreateClassModal 
        isOpen={isClassModalOpen} 
        onClose={() => setIsClassModalOpen(false)} 
        onClassCreated={() => {
            refreshSubjects(); 
        }}
      />
    </div>
  );
}