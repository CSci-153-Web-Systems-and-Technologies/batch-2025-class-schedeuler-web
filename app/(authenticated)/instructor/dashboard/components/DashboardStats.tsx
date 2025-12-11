"use client";

import React, { useEffect, useState, useCallback } from "react";
import { BookOpen, Users, ListTodo, AlertCircle } from "lucide-react";
import { useThemeContext } from "@/app/(authenticated)/components/ThemeContext";
import { useSubjects } from "@/app/(authenticated)/student/subjects/SubjectContext";
import { useTasks } from "@/app/(authenticated)/student/tasks/TaskContext";
import { createClient } from "@/utils/supabase/client";
import { generateRecurringEvents } from "@/utils/calendarUtils";
import { EventType } from "@/types/calendar";

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
  
  const lightBg = badgeSettings?.light.bg || "#F3F4F6";
  const lightText = badgeSettings?.light.text || "#374151";

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
              style={!isDark ? { backgroundColor: lightBg, color: lightText } : {}}
            >
              {badgeText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

interface DashboardStatsProps {
  initialData?: {
    totalStudents: number;
    conflictCount: number;
  };
}

export default function DashboardStats({ initialData }: DashboardStatsProps) {
  const { subjects } = useSubjects();
  const { tasks } = useTasks();
  const supabase = createClient();
  
  const [totalStudents, setTotalStudents] = useState(initialData?.totalStudents || 0);
  const [conflictCount, setConflictCount] = useState(initialData?.conflictCount || 0);

  useEffect(() => {
    if (initialData) {
        setTotalStudents(initialData.totalStudents);
        setConflictCount(initialData.conflictCount);
    }
  }, [initialData]);

  const classesThisWeek = React.useMemo(() => {
    const now = new Date();
    const events = generateRecurringEvents(subjects, now, 'week'); 
    return events.filter(e => e.type === EventType.SUBJECT).length;
  }, [subjects]);

  const pendingTasks = tasks.filter(t => t.type === EventType.TASK && !t.completed).length;

  const fetchStats = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: classes } = await supabase.from('classes').select('id').eq('instructor_id', user.id);
    
    if (classes && classes.length > 0) {
      const classIds = classes.map(c => c.id);
      
      const { data: enrollments, count: studentCount } = await supabase
        .from('enrollments')
        .select('conflict_report', { count: 'exact' })
        .in('class_id', classIds)
        .eq('status', 'approved');
      
      setTotalStudents(studentCount || 0);

      if (enrollments) {
          const conflicts = enrollments.filter(e => 
              e.conflict_report && 
              Array.isArray(e.conflict_report) && 
              e.conflict_report.length > 0
          ).length;
          setConflictCount(conflicts);
      } else {
          setConflictCount(0);
      }
    } else {
        setTotalStudents(0);
        setConflictCount(0);
    }
  }, [supabase]);

  // Realtime Listeners
  useEffect(() => {
    let channel: any;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('dashboard_stats_updates')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'enrollments' }, 
          () => {
             fetchStats();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'classes', filter: `instructor_id=eq.${user.id}` },
          () => {
             fetchStats();
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase, fetchStats]);

  const isConflict = conflictCount > 0;
  
  const conflictBadgeSettings = {
    light: { 
      bg: isConflict ? "#FEE2E2" : "#DCFCE7", 
      text: isConflict ? "#DC2626" : "#166534" 
    },
    darkClasses: isConflict 
      ? "dark:bg-red-900/30 dark:text-red-400" 
      : "dark:bg-green-900/30 dark:text-green-400"
  };

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
        title="Conflicts" 
        value={conflictCount} 
        subtitle="Active Conflicting Students" 
        badgeText={isConflict ? "Review Required" : "No issues"}
        badgeSettings={conflictBadgeSettings}
        icon={<AlertCircle size={20} />} 
      />
    </div>
  );
}