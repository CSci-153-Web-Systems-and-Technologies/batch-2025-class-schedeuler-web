"use client";
import { useState } from "react";
import React from "react";
import PomodoroTimer from "../dashboard/components/PomodoroTimer";
import AppBreadcrumb from "@/app/components/ui/AppBreadCrumb";
import TaskList from "./components/TaskList";
import AddTaskForm from "./components/AddTaskForm";
import CurrentTask from "./components/CurrentTask";

type Task = {
  id: number;
  name: string;
  doneReps: number;
  totalReps: number;
};

export default function PomodoroPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskName, setTaskName] = useState("");
  const [taskReps, setTaskReps] = useState<number>(1);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);

  const addTask = () => {
    if (!taskName.trim() || taskReps < 1) return;

    const newTask: Task = {
      id: Date.now(),
      name: taskName,
      doneReps: 0,
      totalReps: taskReps,
    };

    setTasks([...tasks, newTask]);
    setTaskName("");
    setTaskReps(1);
    setShowAddTaskForm(false);
  };

  const clearTasks = () => {
    setTasks([]);
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const cancelAddTask = () => {
    setTaskName("");
    setTaskReps(1);
    setShowAddTaskForm(false);
  };

  return (
    <div
      className="min-h-screen py-4 px-4 sm:py-6 sm:px-6 lg:py-6 lg:px-12"
      style={{ backgroundColor: "var(--color-main-bg)" }}
    >
      <AppBreadcrumb />
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-12 rounded-2xl sm:rounded-3xl lg:rounded-4xl text-white mt-12"
      style={{ backgroundColor: "var(--color-components-bg)" }}>
        {/* MAIN LAYOUT - Column on small/medium, Row on large */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6 w-full lg:w-1/2">
            {/* POMODORO TIMER */}
            <PomodoroTimer/>

            {/* CURRENT TASK */}
            <CurrentTask tasks={tasks} />
          </div>

          {/* RIGHT COLUMN (TASK LIST) */}
          <TaskList
            tasks={tasks}
            onClearTasks={clearTasks}
            onDeleteTask={deleteTask}
            onShowAddForm={() => setShowAddTaskForm(true)}
          />
        </div>
      </div>

      {/* OVERLAY POPUP FOR ADD TASK */}
      <AddTaskForm
        isOpen={showAddTaskForm}
        taskName={taskName}
        taskReps={taskReps}
        onTaskNameChange={setTaskName}
        onTaskRepsChange={setTaskReps}
        onAddTask={addTask}
        onCancel={cancelAddTask}
      />
    </div>
  );
}