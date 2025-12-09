// app/(authenticated)/student/tasks/TaskContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { CalendarEvent, EventType, RepeatPattern } from '@/types/calendar';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/app/context/ToastContext';

interface TaskContextType {
  tasks: CalendarEvent[];
  addTask: (newTask: CalendarEvent) => void;
  updateTask: (updatedTask: CalendarEvent) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string, isCompleted?: boolean, progress?: number) => void;
  loading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'task');

      if (error) {
        console.error('Error fetching tasks:', error);
      } else if (data) {
        const mappedTasks: CalendarEvent[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          type: EventType.TASK,
          description: item.description,
          start: new Date(item.start_time),
          end: new Date(item.end_time),
          color: item.color,
          priority: item.priority,
          taskEstimate: item.task_estimate,
          completed: item.completed,
          subjectCode: item.subject_code,
          repeatPattern: RepeatPattern.NONE,
        }));
        setTasks(mappedTasks);
      }
      setLoading(false);
    };

    fetchTasks();
  }, [supabase]);

  const addTask = useCallback(async (newTask: CalendarEvent) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const tempId = Date.now().toString();
    setTasks(prev => [...prev, { ...newTask, id: tempId }]);

    const dbPayload = {
      user_id: user.id,
      title: newTask.title,
      type: 'task',
      description: newTask.description,
      start_time: newTask.start.toISOString(),
      end_time: newTask.end.toISOString(),
      color: newTask.color,
      priority: newTask.priority,
      task_estimate: newTask.taskEstimate,
      completed: newTask.completed || false,
      subject_code: newTask.subjectCode,
    };

    const { data, error } = await supabase.from('events').insert([dbPayload]).select().single();

    if (error) {
      console.error('Error adding task:', error);
      setTasks(prev => prev.filter(t => t.id !== tempId));
      showToast("Error", `Failed to create task: ${error.message}`, "error");
    } else {
      setTasks(prev => prev.map(t => t.id === tempId ? { ...newTask, id: data.id } : t));
      showToast("Success", "Task created successfully.", "success");
    }
  }, [supabase, showToast]);

  const updateTask = useCallback(async (updatedTask: CalendarEvent) => {
    if (!updatedTask.id || updatedTask.id.length < 10 || updatedTask.id === 'temp_draft') {
       console.warn("Skipping update on invalid/temp ID:", updatedTask.id);
       return;
    }

    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));

    const dbPayload = {
      title: updatedTask.title,
      description: updatedTask.description,
      start_time: updatedTask.start.toISOString(),
      end_time: updatedTask.end.toISOString(),
      color: updatedTask.color,
      priority: updatedTask.priority,
      task_estimate: updatedTask.taskEstimate,
      completed: updatedTask.completed,
      subject_code: updatedTask.subjectCode,
    };

    const { error } = await supabase.from('events').update(dbPayload).eq('id', updatedTask.id);
    
    if (error) {
      console.error('Error updating task:', error);
      showToast("Update Failed", error.message || "Could not save changes.", "error");
    } 
  }, [supabase, showToast]);

  const deleteTask = useCallback(async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));

    const { error } = await supabase.from('events').delete().eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      showToast("Error", error.message || "Failed to delete task.", "error");
    } else {
      showToast("Deleted", "Task deleted successfully.", "success");
    }
  }, [supabase, showToast]);

  const toggleComplete = useCallback(async (id: string, isCompleted?: boolean, progress?: number) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const newCompleted = isCompleted !== undefined ? isCompleted : !task.completed;
        const newEstimate = `${progress !== undefined ? progress : (newCompleted ? 100 : 0)}%`;
        
        supabase.from('events').update({ 
          completed: newCompleted, 
          task_estimate: newEstimate 
        }).eq('id', id).then(({ error }) => {
          if (error) {
             console.error("Error toggling complete:", error);
             showToast("Error", error.message, "error");
          }
        });

        return { ...task, completed: newCompleted, taskEstimate: newEstimate };
      }
      return task;
    }));
  }, [supabase, showToast]);

  const contextValue = useMemo(() => ({
    tasks, addTask, updateTask, deleteTask, toggleComplete, loading
  }), [tasks, addTask, updateTask, deleteTask, toggleComplete, loading]);

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}