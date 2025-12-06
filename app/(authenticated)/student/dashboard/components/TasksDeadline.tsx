"use client";

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";

export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

interface GroupedTasksProps {
  initialTasks: {
    date: Date;   // real date object
    tasks: Task[];
  }[];
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

  const isToday =
    date.toDateString() === today.toDateString();
  const isTomorrow =
    date.toDateString() === tomorrow.toDateString();

  if (isToday) return `Today • ${date.toLocaleDateString("en-US", { weekday: "long" })}`;
  if (isTomorrow) return `Tomorrow • ${date.toLocaleDateString("en-US", { weekday: "long" })}`;

  return date.toLocaleDateString("en-US", {
    weekday: "long",
  });
}

const TasksDeadlines: React.FC<GroupedTasksProps> = ({ initialTasks }) => {
  // Local state to allow checkbox interaction
  const [groups, setGroups] = useState(initialTasks);

  function toggleTask(groupIndex: number, taskId: number) {
    setGroups(prev =>
      prev.map((group, gIndex) => {
        if (gIndex !== groupIndex) return group;

        return {
          ...group,
          tasks: group.tasks.map(task =>
            task.id === taskId
              ? { ...task, completed: !task.completed }
              : task
          ),
        };
      })
    );
  }

  return (
    <div className="px-8 py-4 rounded-xl flex-1" style={{ backgroundColor: 'var(--color-components-bg)' }}>
      <h1 className="text-2xl font-bold border-b-2 mb-2.5" style={{ color: 'var(--color-text-primary)' }}>Tasks & Deadlines</h1>

      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="mb-6">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatLabel(group.date)}</p>
            <span className="text-sm text-gray-500">
              {formatDate(group.date)}
            </span>
          </div>

          {/* TASKS */}
          <ul className="space-y-3">
            {group.tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-3">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(groupIndex, task.id)}
                />

                <span
                  className={`${
                    task.completed ? "line-through text-gray-400" : ""
                  }`}
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {task.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default TasksDeadlines;
