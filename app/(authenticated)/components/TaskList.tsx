// TaskList.tsx
import React from "react";

export interface Task {
  id: string | number;
  name: string;
  date: string; // format: YYYY-MM-DD or any display string
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string | number) => void;
  onAddTask?: () => void;
  showAddButton?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleComplete,
  onAddTask,
  showAddButton = false,
}) => {
  return (
    <div className="bg-white rounded-md shadow p-4">
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between p-2 border rounded-md"
          >
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleComplete(task.id)}
                className="h-5 w-5 text-blue-600"
              />
              <div>
                <p
                  className={`text-gray-800 ${
                    task.completed ? "line-through text-gray-400" : ""
                  }`}
                >
                  {task.name}
                </p>
                <p className="text-xs text-gray-500">{task.date}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {showAddButton && onAddTask && (
        <button
          onClick={onAddTask}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          + Add Task
        </button>
      )}
    </div>
  );
};

export default TaskList;
