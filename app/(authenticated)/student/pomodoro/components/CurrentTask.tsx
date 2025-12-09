import React from "react";

type Task = {
  id: number;
  name: string;
  doneReps: number;
  totalReps: number;
};

interface CurrentTaskProps {
  tasks: Task[];
}

const CurrentTask: React.FC<CurrentTaskProps> = ({ tasks }) => {
  return (
    <>
      {tasks.length > 0 ? (
        <div className="text-center">
          <p className="text-lg sm:text-xl font-semibold" style={{ color: "#4169E1" }}>
            #1 — {tasks[0].name}
          </p>
          <p className="text-sm sm:text-base mt-1 text-[#848484]">
            {tasks[0].doneReps}/{tasks[0].totalReps}
          </p>
        </div>
      ) : (
        <h2 className="text-center italic text-base sm:text-lg" style={{ color: "#4169E1" }}>
          No current task.
        </h2>
      )}
    </>
  );
};

export default CurrentTask;