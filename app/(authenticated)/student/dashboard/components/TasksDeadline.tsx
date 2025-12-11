"use client";

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { useTasks } from "../../tasks/TaskContext"; 
import { CalendarEvent, EventType } from '@/types/calendar';

function getDueTime(task: CalendarEvent): string {
    return task.start 
        ? task.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : '';
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatLabel(date: Date) {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

const TasksDeadlines: React.FC = () => {
  const { tasks: allTaskEvents, toggleComplete } = useTasks();
  const [recentlyCompleted, setRecentlyCompleted] = useState<Set<string>>(new Set());

  const visibleTasks = allTaskEvents
    .filter(e => e.type === EventType.TASK && (!e.completed || recentlyCompleted.has(e.id)))
    .sort((a, b) => a.start!.getTime() - b.start!.getTime()); 

  const groupedTasksMap = visibleTasks.reduce((acc, task) => {
    if (!task.start) return acc;
    const dateString = task.start.toDateString();
    if (!acc.has(dateString)) acc.set(dateString, { date: task.start, tasks: [] });
    acc.get(dateString)!.tasks.push(task);
    return acc;
  }, new Map<string, { date: Date; tasks: CalendarEvent[] }>());

  const groups = Array.from(groupedTasksMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());

  function handleToggleTask(taskId: string, checked: boolean) {
    if (checked) {
        setRecentlyCompleted(prev => new Set(prev).add(taskId));
        toggleComplete(taskId, true, 100);
        setTimeout(() => {
            setRecentlyCompleted(prev => {
                const next = new Set(prev);
                next.delete(taskId);
                return next;
            });
        }, 1000);
    } else {
        toggleComplete(taskId, false, 0);
        setRecentlyCompleted(prev => {
            const next = new Set(prev);
            next.delete(taskId);
            return next;
        });
    }
  }
  
  return (
    <div 
      className="p-6 rounded-2xl border border-[var(--color-border)] shadow-sm flex flex-col h-full min-h-[300px]"
      style={{ backgroundColor: 'var(--color-components-bg)' }}
    >
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4 text-[#4169E1] border-b-2 pb-2">
        Tasks & Deadlines
      </h2>

      {groups.length > 0 ? (
        <div className="space-y-6 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {groups.map((group) => (
            <div key={group.date.toDateString()}>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-bold text-[var(--color-text-primary)]">{formatLabel(group.date)}</p>
                <span className="text-xs text-[var(--color-text-secondary)]">{formatDate(group.date)}</span>
              </div>

              <div className="space-y-3">
                {group.tasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 group">
                    <Checkbox
                        checked={task.completed}
                        onCheckedChange={(checked) => handleToggleTask(task.id, checked as boolean)}
                        className="mt-0.5 data-[state=checked]:bg-[#4169E1] data-[state=checked]:border-[#4169E1]"
                    />
                    <div className="flex flex-col">
                        <span className={`text-sm transition-all ${task.completed ? "line-through text-[var(--color-text-secondary)] opacity-70" : "text-[var(--color-text-primary)]"}`}>
                            {task.title}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-secondary)]">
                            {getDueTime(task)}
                        </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
            <p className="text-sm text-[var(--color-text-secondary)] italic">No pending tasks.</p>
        </div>
      )}
    </div>
  );
};

export default TasksDeadlines;