// app/(authenticated)/instructor/dashboard/components/InstructorTasks.tsx
"use client";

import React, { useMemo } from "react";
import { Checkbox } from "@/app/components/ui/Checkbox";
import { Plus } from "lucide-react";
import { useTasks } from "@/app/(authenticated)/student/tasks/TaskContext";
import { EventType } from "@/types/calendar";
import Link from "next/link";

export default function InstructorTasks() {
  const { tasks: allTasks, toggleComplete, loading } = useTasks();

  const groupedTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const groups: Record<string, typeof allTasks> = {
      "Today": [],
      "Upcoming": []
    };

    allTasks
      .filter(t => t.type === EventType.TASK && !t.completed)
      .sort((a, b) => (a.start?.getTime() || 0) - (b.start?.getTime() || 0))
      .forEach(task => {
        if (!task.start) return;
        const taskDate = new Date(task.start);
        taskDate.setHours(0,0,0,0);

        if (taskDate.getTime() === today.getTime()) {
          groups["Today"].push(task);
        } else {
          groups["Upcoming"].push(task);
        }
      });

    return groups;
  }, [allTasks]);

  const handleToggle = (id: string, checked: boolean) => {
    toggleComplete(id, checked);
  };

  return (
    <div 
      className="p-6 rounded-2xl border border-[var(--color-border)] shadow-sm flex flex-col h-full"
      style={{ backgroundColor: "var(--color-components-bg)" }}
    >
      <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4 text-[#4169E1]">Tasks</h2>

      <div className="flex-1 space-y-6 overflow-y-auto max-h-[400px] pr-2">
        {loading ? (
           <p className="text-sm text-[var(--color-text-secondary)]">Loading tasks...</p>
        ) : (
          Object.entries(groupedTasks).map(([group, tasks]) => (
            tasks.length > 0 && (
              <div key={group}>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">{group}</h3>
                </div>
                
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 group">
                      <Checkbox 
                        checked={task.completed || false} 
                        onCheckedChange={(checked) => handleToggle(task.id, checked as boolean)}
                        className="mt-0.5 data-[state=checked]:bg-[#4169E1] data-[state=checked]:border-[#4169E1]"
                      />
                      <div className="flex flex-col">
                        <span className={`text-sm transition-all ${
                          task.completed 
                            ? "text-[var(--color-text-secondary)] line-through opacity-70" 
                            : "text-[var(--color-text-primary)]"
                        }`}>
                          {task.title}
                        </span>
                        {task.subjectCode && (
                           <span className="text-[10px] text-[var(--color-text-secondary)]">
                             {task.subjectCode}
                           </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))
        )}
        
        {!loading && Object.values(groupedTasks).every(g => g.length === 0) && (
           <p className="text-sm text-[var(--color-text-secondary)] italic text-center py-4">
             No pending tasks. Good job!
           </p>
        )}
      </div>

      <Link 
        href="/instructor/tasks"
        className="flex items-center gap-2 text-sm font-bold text-[#4169E1] mt-6 hover:opacity-80 transition-opacity w-fit mx-auto"
      >
        <Plus size={16} />
        Manage Tasks
      </Link>
    </div>
  );
}