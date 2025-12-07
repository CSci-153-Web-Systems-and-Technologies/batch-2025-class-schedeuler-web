// app/(authenticated)/student/dashboard/components/TasksDeadline.tsx
"use client";

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { useTasks } from "../../tasks/TaskContext"; 
import { CalendarEvent, EventType } from '@/types/calendar';

function getTaskStatus(task: CalendarEvent): "current" | "past" | "overdue" {
    if (task.completed) return "past";
    const now = new Date();
    const taskEndDay = new Date(task.start!);
    taskEndDay.setHours(23, 59, 59, 999); 
    
    if (taskEndDay < now) {
        return "overdue";
    }
    return "current";
}

function getDueTime(task: CalendarEvent): string {
    return task.start 
        ? task.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : '';
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatLabel(date: Date) {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) return `Today • ${date.toLocaleDateString("en-US", { weekday: "long" })}`;
  if (isTomorrow) return `Tomorrow • ${date.toLocaleDateString("en-US", { weekday: "long" })}`;

  return date.toLocaleDateString("en-US", { weekday: "long" });
}

const TasksDeadlines: React.FC = () => {
  const { tasks: allTaskEvents, toggleComplete } = useTasks();
  
  const [recentlyCompleted, setRecentlyCompleted] = useState<Set<string>>(new Set());

  const visibleTasks = allTaskEvents
    .filter(e => 
      e.type === EventType.TASK && 
      (!e.completed || recentlyCompleted.has(e.id))
    )
    .sort((a, b) => a.start!.getTime() - b.start!.getTime()); 

  const groupedTasksMap = visibleTasks.reduce((acc, task) => {
    if (!task.start) return acc;
    const dateString = task.start.toDateString();
    if (!acc.has(dateString)) {
        acc.set(dateString, { date: task.start, tasks: [] });
    }
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
    <div className="px-8 py-4 rounded-xl flex-1 h-full" style={{ backgroundColor: 'var(--color-components-bg)' }}>
      <h1 className="text-2xl font-bold border-b-2 mb-2.5" style={{ color: 'var(--color-text-primary)' }}>Tasks & Deadlines</h1>

      {groups.length > 0 ? (
        groups.map((group) => (
            <div key={group.date.toDateString()} className="mb-6">
            <div className="flex items-center justify-between mb-2">
                <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatLabel(group.date)}</p>
                <span className="text-sm text-gray-500">
                {formatDate(group.date)}
                </span>
            </div>

            <ul className="space-y-3">
                {group.tasks.map((task) => (
                <li key={task.id} className="flex items-center gap-3 transition-all duration-300">
                    <Checkbox
                        checked={task.completed}
                        onCheckedChange={(checked) => handleToggleTask(task.id, checked as boolean)}
                    />

                    <span
                    className={`${
                        task.completed ? "line-through text-gray-400" : ""
                    }`}
                    style={{ color: 'var(--color-text-primary)' }}
                    >
                    {task.title}
                    <span className="text-xs ml-2 text-gray-500">({getDueTime(task)})</span>
                    </span>
                </li>
                ))}
            </ul>
            </div>
        ))
      ) : (
        <div className="text-center py-6">
            <p className="text-sm text-[var(--color-text-secondary)] italic">No active tasks or deadlines.</p>
        </div>
      )}
    </div>
  );
};

export default TasksDeadlines;