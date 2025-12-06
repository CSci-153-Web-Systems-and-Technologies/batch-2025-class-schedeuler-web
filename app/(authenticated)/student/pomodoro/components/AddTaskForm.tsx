import React from "react";
import { X } from "lucide-react";

interface AddTaskFormProps {
  isOpen: boolean;
  taskName: string;
  taskReps: number;
  onTaskNameChange: (name: string) => void;
  onTaskRepsChange: (reps: number) => void;
  onAddTask: () => void;
  onCancel: () => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({
  isOpen,
  taskName,
  taskReps,
  onTaskNameChange,
  onTaskRepsChange,
  onAddTask,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-md p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg transform transition-all duration-300 border-2"
        style={{ backgroundColor: "#9FC6F3", borderColor: "#4169E1" }}
      >
        {/* HEADER WITH CLOSE BUTTON */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl font-bold">Add New Task</h3>
          <button
            onClick={onCancel}
            className="p-1 rounded-full hover:bg-[#78AFE9] transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM CONTENT */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Task Name
            </label>
            <input
              value={taskName}
              onChange={(e) => onTaskNameChange(e.target.value)}
              placeholder="Enter task name..."
              className="w-full px-4 py-2 rounded-lg border-2 outline-none transition-colors duration-200"
              style={{ backgroundColor: "#78AFE9", borderColor: "#4169E1", color: "white" }}
              onFocus={(e) => e.target.style.borderColor = "#3151B0"}
              onBlur={(e) => e.target.style.borderColor = "#4169E1"}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Pomodoro Sessions
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={taskReps}
              onChange={(e) => onTaskRepsChange(Number(e.target.value))}
              placeholder="Number of sessions"
              className="w-full px-4 py-2 rounded-lg border-2 outline-none transition-colors duration-200"
              style={{ backgroundColor: "#78AFE9", borderColor: "#4169E1", color: "white" }}
              onFocus={(e) => e.target.style.borderColor = "#3151B0"}
              onBlur={(e) => e.target.style.borderColor = "#4169E1"}
            />
            <p className="text-xs mt-1 text-[#4169E1]">
              Number of times this task will be in pomodoro sessions
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onAddTask}
              className="flex-1 py-3 rounded-lg font-medium transition-colors duration-200"
              style={{ backgroundColor: "#4169E1", color: "white" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#3151B0"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#4169E1"}
            >
              Add Task
            </button>
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-lg font-medium transition-colors duration-200"
              style={{ backgroundColor: "#78AFE9", color: "#4169E1" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#5A9DE3"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#78AFE9"}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTaskForm;