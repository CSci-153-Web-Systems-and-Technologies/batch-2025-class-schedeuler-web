// app/(authenticated)/student/tasks/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import AppBreadcrumb from "@/app/components/ui/AppBreadCrumb";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, Save, X } from "lucide-react"; 
import { useTasks } from "./TaskContext"; 
import { CalendarEvent, EventType } from '@/types/calendar'; 
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useToast } from "@/app/context/ToastContext";

function getTaskProgress(task: CalendarEvent): number {
    const estimate = task.taskEstimate;
    if (estimate && estimate.endsWith('%')) {
        return parseInt(estimate.replace('%', '')) || 0;
    }
    return task.completed ? 100 : 0;
}

function getTaskStatus(task: CalendarEvent): "current" | "past" | "overdue" {
    if (task.completed) return "past";
    const now = new Date();
    const taskEndDay = new Date(task.start!);
    taskEndDay.setHours(23, 59, 59, 999); 
    if (taskEndDay < now) return "overdue";
    return "current";
}

function getDueDateLabel(task: CalendarEvent): string {
    const date = task.start || new Date();
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function getDueTime(task: CalendarEvent): string {
    return task.start 
        ? task.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : '';
}

interface TaskItemProps {
  task: CalendarEvent;
  onSelect: (task: CalendarEvent) => void;
  isSelected: boolean;
  onToggle: (id: string, checked: boolean) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onSelect, isSelected, onToggle }) => {
    const progress = getTaskProgress(task);
    const dueDateLabel = getDueDateLabel(task);
    const dueTime = getDueTime(task);

    const handleCheckboxChange = (checked: boolean) => {
        onToggle(task.id, checked);
        if (isSelected) onSelect({ ...task, completed: checked, taskEstimate: checked ? '100%' : '0%' });
    };

    return (
        <div
            className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 border-2 ${
                isSelected
                    ? "border-[var(--color-primary)] shadow-md"
                    : "border-transparent hover:bg-[var(--color-hover)]"
            }`}
            style={{
                backgroundColor: "var(--color-components-bg)",
                color: "var(--color-text-primary)",
            }}
            onClick={() => onSelect(task)}
        >
            <div className="pt-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                    checked={task.completed}
                    onCheckedChange={handleCheckboxChange}
                    className="size-5"
                />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
                <p className={`font-semibold text-base truncate ${task.completed ? 'line-through text-[var(--color-text-secondary)]' : ''}`}>
                    {task.title || "(No Title)"}
                </p>
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <span className="font-medium text-[var(--color-primary)]">{task.subjectCode}</span>
                    <span className="text-xs">
                        {progress}%
                    </span>
                    <span className="ml-auto text-xs whitespace-nowrap text-[var(--color-text-primary)]">
                        {dueTime} | {dueDateLabel}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default function TasksPage() {
    const { tasks: allTaskEvents, updateTask, toggleComplete, addTask, deleteTask } = useTasks();
    const { showToast } = useToast();
    const taskEvents = allTaskEvents.filter(e => e.type === EventType.TASK);
    
    const [recentlyCompleted, setRecentlyCompleted] = useState<Set<string>>(new Set());
    const [selectedTask, setSelectedTask] = useState<CalendarEvent | null>(null);
    const [activeTab, setActiveTab] = useState<"current" | "past" | "overdue">('current');
    

    const [isCreating, setIsCreating] = useState(false);

    const handleTaskToggle = (taskId: string, checked: boolean) => {
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
    };


    useEffect(() => {
 
        if (isCreating) return;

        const updatedTask = selectedTask ? taskEvents.find(t => t.id === selectedTask.id) : null;
        
        if (updatedTask) {
            setSelectedTask(updatedTask);
        } else if (taskEvents.length > 0 && !selectedTask) {

            const firstActiveTask = taskEvents.find(t => getTaskStatus(t) === activeTab);
            setSelectedTask(firstActiveTask || null);
        } else if (taskEvents.length === 0) {
            setSelectedTask(null);
        }
    }, [taskEvents, activeTab, isCreating]);


    const sortedTasks = taskEvents.sort((a, b) => a.start!.getTime() - b.start!.getTime());
    
    const groupedTasksMap = sortedTasks.reduce((acc, task) => {
        let status = getTaskStatus(task);
        
        if (recentlyCompleted.has(task.id)) {
             if (activeTab === 'current' && status === 'past') {
                 status = 'current';
             }
        }

        if (status !== activeTab && !(activeTab === 'current' && status === 'overdue')) return acc; 
        if (status !== activeTab && !recentlyCompleted.has(task.id)) return acc;
        
        const dateKey = getDueDateLabel(task);
        const group = acc.get(dateKey) || [];
        group.push(task);
        acc.set(dateKey, group);
        return acc;
    }, new Map<string, CalendarEvent[]>());


    const handleUpdateField = (field: keyof CalendarEvent, value: any) => {
        if (!selectedTask) return;
        
        const updatedTask = { 
            ...selectedTask, 
            [field]: value,
            ...(field === 'start' && { end: value }) 
        };

        setSelectedTask(updatedTask); 

        if (!isCreating) {
            updateTask(updatedTask);
        }
    };

    const handleMarkAsComplete = (id: string) => {
        handleTaskToggle(id, true);
    };

    const handleDeleteTask = () => {
        if (selectedTask) {
            deleteTask(selectedTask.id);
            setSelectedTask(null);
        }
    };

    const handleProgressChange = (newProgress: number) => {
        if (!selectedTask) return;
        const completed = newProgress === 100;
        const updatedTask = { ...selectedTask, taskEstimate: `${newProgress}%`, completed: completed };
        
        setSelectedTask(updatedTask); 
        
        if (!isCreating) {
            updateTask(updatedTask);
        }
    };

    const handleSelectTask = (task: CalendarEvent) => {

        if (isCreating) {
            setIsCreating(false);
        }
        
        const globalTask = taskEvents.find(t => t.id === task.id);
        if (globalTask) {
            setSelectedTask(globalTask);
        }
    }

    const orderedGroupKeys = ['Today', 'Tomorrow', ...Array.from(groupedTasksMap.keys()).filter(k => k !== 'Today' && k !== 'Tomorrow')];
    
    const handleAddTask = () => {
        const now = new Date();

        now.setHours(now.getHours() + 1, 0, 0, 0);

        const newTask: CalendarEvent = {
            id: 'temp_draft', 
            title: "", 
            type: EventType.TASK,
            subjectCode: '',
            start: now, 
            end: now,
            color: '#ff4d4f',
            priority: 'medium',
            taskEstimate: '0%', 
            completed: false,
            description: "",
        };
        
        setIsCreating(true);
        setSelectedTask(newTask);
    };

    const handleSaveNewTask = () => {
        if (!selectedTask) return;

        if (!selectedTask.title?.trim()) {
            showToast("Required", "Please enter a task title.", "error");
            return;
        }

        addTask(selectedTask); 
        setIsCreating(false);
        setActiveTab('current');
        showToast("Success", "Task created successfully.", "success");
    };

    const handleCancelCreate = () => {
        setIsCreating(false);
        setSelectedTask(null);
    };

    return (
        <div
            className="min-h-screen py-6 px-4 sm:px-6 lg:px-12"
            style={{ backgroundColor: "var(--color-main-bg)" }}
        >
            <AppBreadcrumb />
            <div className="flex flex-col lg:flex-row gap-6">              
                <div className="w-full lg:w-1/2 xl:w-2/5 p-6 rounded-2xl shadow-lg" 
                    style={{ backgroundColor: "var(--color-components-bg)" }}>
                    
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                            Tasks & Deadlines
                        </h2>
                        <Button 
                            onClick={handleAddTask}
                            size="icon-sm"
                            className="lg:hidden bg-[var(--color-primary)] text-white"
                        >
                            <Plus size={20} />
                        </Button>
                    </div>
                    
                    <div className="flex justify-between p-1 mb-4 rounded-xl" style={{ backgroundColor: 'var(--color-hover)' }}>
                        {(['current', 'past', 'overdue'] as ("current" | "past" | "overdue")[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors duration-200 ${
                                    activeTab === tab
                                        ? 'bg-[var(--color-primary)] text-white'
                                        : 'text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'
                                }`}
                            >
                                {tab} ({taskEvents.filter(t => getTaskStatus(t) === tab).length})
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                        
                        {orderedGroupKeys.map(dateKey => {
                            const tasksForDay = groupedTasksMap.get(dateKey) || [];
                            if (tasksForDay.length === 0) return null;

                            return (
                                <div key={dateKey}>
                                    <p className="font-bold text-lg mb-2" style={{ color: "var(--color-text-primary)" }}>
                                        {dateKey} ({tasksForDay.length})
                                    </p>
                                    <div className="space-y-3">
                                        {tasksForDay.map(task => (
                                            <TaskItem 
                                                key={task.id} 
                                                task={task} 
                                                onSelect={handleSelectTask} 
                                                isSelected={selectedTask?.id === task.id}
                                                onToggle={handleTaskToggle}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )
                        })}

                        {Array.from(groupedTasksMap.values()).flat().length === 0 && (
                            <p className="text-sm text-[var(--color-text-secondary)] italic p-3 text-center">
                                No tasks in this category.
                            </p>
                        )}
                        
                        <div className="flex justify-center pt-4">
                            <Button 
                                onClick={handleAddTask}
                                variant="ghost" 
                                size="sm"
                                className="text-[var(--color-primary)] hover:bg-[var(--color-hover)] w-full border border-dashed border-[var(--color-border)]"
                            >
                                <Plus size={16} className="mr-1" />
                                Create New Task
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 xl:w-3/5 p-6 rounded-2xl shadow-lg" 
                    style={{ backgroundColor: "var(--color-components-bg)" }}>
                    
                    {selectedTask ? (
                        <div className="space-y-6">
                            
                            <div className="p-4 rounded-xl relative" style={{ backgroundColor: 'var(--color-hover)' }}>
                                {isCreating && (
                                    <span className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded bg-[var(--color-primary)] text-white">
                                        New Task
                                    </span>
                                )}
                                <input
                                    type="text"
                                    value={selectedTask.title || ''}
                                    onChange={(e) => handleUpdateField('title', e.target.value)}
                                    className="text-xl font-bold mb-1 w-full bg-transparent focus:outline-none placeholder:text-[var(--color-muted)]"
                                    style={{ color: "var(--color-text-primary)" }}
                                    placeholder="Enter Task Title..."
                                    autoFocus={isCreating}
                                />
                                <div className="flex gap-3 text-sm text-[var(--color-text-secondary)] items-center">
                                    <input
                                        type="text"
                                        value={selectedTask.subjectCode || ''}
                                        onChange={(e) => handleUpdateField('subjectCode', e.target.value)}
                                        className="font-medium bg-transparent focus:outline-none border-b border-transparent focus:border-gray-500 placeholder:text-[var(--color-muted)]"
                                        style={{ color: "var(--color-primary)" }}
                                        placeholder="Subject (Optional)"
                                    />
                                    <span className="text-[var(--color-text-primary)] font-medium opacity-50">| Task</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">Due Date</label>
                                    <DatePicker
                                        selected={selectedTask.start || new Date()}
                                        onChange={(date: Date | null) => date && handleUpdateField('start', date)}
                                        dateFormat="MMMM d, yyyy"
                                        className="w-full p-2 border border-[var(--color-border)] rounded bg-[var(--color-components-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">Due Time</label>
                                    <DatePicker
                                        selected={selectedTask.start || new Date()}
                                        onChange={(date: Date | null) => date && handleUpdateField('start', date)}
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={15}
                                        timeCaption="Time"
                                        dateFormat="h:mm aa"
                                        className="w-full p-2 border border-[var(--color-border)] rounded bg-[var(--color-components-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-lg font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
                                    Description
                                </label>
                                <textarea
                                    value={selectedTask.description || ''}
                                    onChange={(e) => handleUpdateField('description', e.target.value)}
                                    rows={4}
                                    className="w-full p-3 border border-[var(--color-border)] rounded-lg resize-none outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors"
                                    style={{
                                        backgroundColor: "var(--color-bar-bg)", 
                                        color: "var(--color-text-primary)",
                                    }}
                                    placeholder="Add details about this task..."
                                />
                            </div>

                            <div>
                                <label className="block text-lg font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
                                    Progress {getTaskProgress(selectedTask)}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="25"
                                    value={getTaskProgress(selectedTask)}
                                    onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                                    className="w-full h-3 rounded-full overflow-hidden appearance-none bg-[var(--color-border)] [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:bg-[var(--color-primary)]"
                                    style={{
                                        background: `linear-gradient(to right, var(--color-primary) ${getTaskProgress(selectedTask)}%, var(--color-border) ${getTaskProgress(selectedTask)}%)`,
                                    }}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                {isCreating ? (
                                    <>
                                        <Button
                                            onClick={handleCancelCreate}
                                            variant="outline"
                                            className="flex-1 py-6 text-base font-bold border-[var(--color-border)] text-[var(--color-text-primary)]"
                                        >
                                            <X size={18} className="mr-2" />
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleSaveNewTask}
                                            className="flex-1 py-6 text-base font-bold bg-[var(--color-primary)] text-white hover:opacity-90"
                                        >
                                            <Save size={18} className="mr-2" />
                                            Create Task
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            onClick={() => handleMarkAsComplete(selectedTask.id)}
                                            disabled={selectedTask.completed}
                                            className="flex-1 py-6 text-lg font-bold transition-all hover:opacity-90 bg-[var(--color-primary)] text-white"
                                        >
                                            {selectedTask.completed ? 'Completed' : 'Mark as Complete'}
                                        </Button>

                                        <button
                                            onClick={handleDeleteTask}
                                            className="px-4 py-2 text-red-500 hover:bg-red-50 hover:dark:bg-red-950/20 rounded-lg transition-colors"
                                            title="Delete Task"
                                        >
                                            <Trash2 size={24} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                            <img src="/icons/schedule.png" alt="No Task" className="w-16 h-16 mb-4 grayscale opacity-50" />
                            <p className="text-xl font-semibold text-[var(--color-text-primary)]">
                                No task selected
                            </p>
                            <p className="text-[var(--color-text-secondary)] mt-2">
                                Select a task from the list to view details or create a new one.
                            </p>
                            <Button 
                                onClick={handleAddTask}
                                className="mt-6 bg-[var(--color-primary)] text-white"
                            >
                                <Plus size={18} className="mr-2" />
                                Create Task
                            </Button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}