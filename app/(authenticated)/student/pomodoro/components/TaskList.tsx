import React from "react";
import { Trash2, Plus } from "lucide-react";
import { Task } from "@/types/pomodoro";

interface TaskListProps {
  tasks: Task[];
  onClearTasks: () => void;
  onDeleteTask: (id: number) => void;
  onShowAddForm: () => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onClearTasks,
  onDeleteTask,
  onShowAddForm,
}) => {
  return (
    <div className="w-full lg:w-1/2 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-l flex flex-col justify-between" style={{ backgroundColor: "#78AFE9" }}>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-white/20">
        <h2 className="text-lg sm:text-xl font-bold">Tasks</h2>

        <button
          onClick={onClearTasks}
          className="px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          style={{ backgroundColor: "#EF4444", color: "white" }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#DC2626"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#EF4444"}
        >
          Clear
        </button>
      </div>

      {/* TASK QUEUE */}
      {tasks.length > 0 ? (
        <div className="space-y-3 mb-6 max-h-60 sm:max-h-80 overflow-y-auto">
          {tasks.map((t, index) => (
            <div
              key={t.id}
              className="flex justify-between items-center p-3 rounded-lg transition-colors duration-200"
              style={{ backgroundColor: "#9FC6F3" }}
            >
              <div className="flex-1">
                <p className="font-medium text-sm sm:text-base">
                  #{index + 1} — {t.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium text-sm sm:text-base">
                  {t.doneReps}/{t.totalReps}
                </span>
                <button
                  onClick={() => onDeleteTask(t.id)}
                  className="p-1 rounded hover:bg-gray-200 transition-colors hover:rounded-full"
                  title="Delete task"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center italic mb-6 text-white text-sm sm:text-base">
          No tasks in queue.
        </p>
      )}

      {/* ADD TASK BUTTON */}
      <button
        onClick={onShowAddForm}
        className="w-full py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
        style={{ backgroundColor: "#4169E1", color: "white" }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#3151B0"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#4169E1"}
      >
        <Plus size={20} />
        Add Task
      </button>
    </div>
  );
};

export default TaskList;