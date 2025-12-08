"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Users, ListTodo, AlertCircle } from "lucide-react";
import { useThemeContext } from "@/app/(authenticated)/components/ThemeContext";
import { useSubjects } from "@/app/(authenticated)/student/subjects/SubjectContext";
import { useTasks } from "@/app/(authenticated)/student/tasks/TaskContext";
import { createClient } from "@/utils/supabase/client";
import { generateRecurringEvents } from "@/utils/calendarUtils";
import { EventType } from "@/types/calendar";
import moment from "moment";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  badgeText?: string;
  badgeSettings?: {
    light: { bg: string; text: string };
    darkClasses: string;
  };
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, value, subtitle, badgeText, badgeSettings, icon 
}) => {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  return (
    <div 
      className="p-5 rounded-2xl border border-[var(--color-border)] shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group hover:shadow-md transition-all duration-200"
      style={{ backgroundColor: "var(--color-components-bg)" }}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">{title}</h3>
        <div className="text-[var(--color-muted)] group-hover:text-[var(--color-primary)] transition-colors">
          {icon}
        </div>
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">{value}</h2>
        <div className="flex justify-between items-end">
          <p className="text-xs text-[var(--color-text-secondary)] font-medium max-w-[50%] leading-tight">
            {subtitle}
          </p>
          {badgeText && badgeSettings && (
            <span 
              className={`text-[10px] font-bold px-2 py-1 rounded-full ${badgeSettings.darkClasses}`}
              style={!isDark ? { backgroundColor: badgeSettings.light.bg, color: badgeSettings.light.text } : {}}
            >
              {badgeText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DashboardStats() {
  const { subjects } = useSubjects();
  const { tasks } = useTasks();
  const supabase = createClient();
  const [totalStudents, setTotalStudents] = useState(0);

  // 1. Calculate Classes This Week (Schedule Events)
  const classesThisWeek = React.useMemo(() => {
    // Generate ALL instances for the current week based on repeat rules
    const now = new Date();
    const events = generateRecurringEvents(subjects, now, 'week'); 
    
    // Filter strictly for this week (Subject events only)
    return events.filter(e => e.type === EventType.SUBJECT).length;
  }, [subjects]);

  // 2. Calculate Pending Tasks
  const pendingTasks = tasks.filter(t => t.type === EventType.TASK && !t.completed).length;

  // 3. Fetch Total Enrolled Students (Direct DB call)
  useEffect(() => {
    async function fetchStudentCount() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all classes owned by instructor
      const { data: classes } = await supabase.from('classes').select('id').eq('instructor_id', user.id);
      
      if (classes && classes.length > 0) {
        const classIds = classes.map(c => c.id);
        const { count } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .in('class_id', classIds)
          .eq('status', 'approved');
        
        setTotalStudents(count || 0);
      }
    }
    fetchStudentCount();
  }, [supabase]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard 
        title="Classes This Week" 
        value={classesThisWeek} 
        subtitle="Scheduled Sessions" 
        badgeSettings={{
          light: { bg: "#C7F0D6", text: "#22C55E" },
          darkClasses: "dark:bg-green-900/30 dark:text-green-400"
        }}
        icon={<BookOpen size={20} />} 
      />
      <StatCard 
        title="Total Students" 
        value={totalStudents} 
        subtitle="Active Enrollments" 
        badgeSettings={{
          light: { bg: "#C7F0D6", text: "#22C55E" },
          darkClasses: "dark:bg-green-900/30 dark:text-green-400"
        }}
        icon={<Users size={20} />} 
      />
      <StatCard 
        title="Pending Tasks" 
        value={pendingTasks} 
        subtitle="To-do items" 
        badgeSettings={{
          light: { bg: "#C7F0D6", text: "#22C55E" },
          darkClasses: "dark:bg-green-900/30 dark:text-green-400"
        }}
        icon={<ListTodo size={20} />} 
      />
      <StatCard 
        title="Lab Hours" 
        value="0" 
        subtitle="Schedule Issues" 
        badgeText="No issues"
        badgeSettings={{
          light: { bg: "#FEE2E2", text: "#DC2626" },
          darkClasses: "dark:bg-red-900/30 dark:text-red-400"
        }}
        icon={<AlertCircle size={20} />} 
      />
    </div>
  );
}