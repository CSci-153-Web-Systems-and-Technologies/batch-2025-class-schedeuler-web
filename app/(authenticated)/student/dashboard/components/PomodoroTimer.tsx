// app/(authenticated)/student/dashboard/components/PomodoroTimer.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";

const modes = {
  pomodoro: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

type Mode = keyof typeof modes;

const cycle: Mode[] = [
  "pomodoro",
  "short",
  "pomodoro",
  "short",
  "pomodoro",
  "long",
];

const modeLabels: Record<Mode, string> = {
  pomodoro: "Pomodoro Session",
  short: "Short Break",
  long: "Long Break",
};

export default function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(modes["pomodoro"]);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/alarm.mp3");
  }, []);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(modes[newMode]);
    setIsRunning(false);

    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const requestPermission = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  };

  const handleToggleTimer = () => {
    if (!isRunning) {
        requestPermission();
    }
    setIsRunning((prev) => !prev);
  };

  const notifyUser = (finishedMode: Mode) => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => console.error("Audio play failed:", err));
    }

    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("SchedEuler Timer", {
          body: `${modeLabels[finishedMode]} has finished!`,
          icon: "/icons/schedule.png", 
          requireInteraction: true, 
          silent: false,
        });
      } else {
        console.warn("Notifications blocked. Current permission:", Notification.permission);
      }
    }
  };

  const goToNextMode = () => {
    const nextIndex = (cycleIndex + 1) % cycle.length;
    const nextMode = cycle[nextIndex];

    setCycleIndex(nextIndex);
    setMode(nextMode);
    setTimeLeft(modes[nextMode]);
    setIsRunning(false);
  };

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          
          notifyUser(mode);
          goToNextMode();

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [isRunning, cycleIndex, mode]); 

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(modes[mode]);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <div
      className="w-full mx-auto p-6 text-white rounded-2xl shadow-lg"
      style={{ backgroundColor: "#78AFE9" }}
    >
      <div
        className="flex justify-between mb-6 p-2 rounded-xl"
        style={{ backgroundColor: "#9FC6F3" }}
      >
        {[
          { label: "Pomodoro", value: "pomodoro" },
          { label: "Short Break", value: "short" },
          { label: "Long Break", value: "long" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              handleModeChange(tab.value as Mode);
              setCycleIndex(0);
            }}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition"
            style={{
              backgroundColor: mode === tab.value ? "#4169E1" : "#9FC6F3",
              color: mode === tab.value ? "white" : "#1e293b",
            }}
            onMouseEnter={(e) => {
              if (mode !== tab.value)
                e.currentTarget.style.backgroundColor = "#78AFE9";
            }}
            onMouseLeave={(e) => {
              if (mode !== tab.value)
                e.currentTarget.style.backgroundColor = "#9FC6F3";
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="text-center text-6xl font-bold tracking-wide mb-6">
        {formatTime(timeLeft)}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={handleToggleTimer} 
          className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${
            isRunning
              ? "bg-[#4169E1]" 
              : "bg-[#78AFE9] hover:bg-[#5A9DE3]" 
          }`}
        >
          {isRunning ? "PAUSE" : "START"}
        </button>

        <button
          onClick={handleReset}
          className="px-8 py-3 rounded-xl font-semibold bg-[#78AFE9] hover:bg-[#5A9DE3] transition-colors duration-200 hover:scale-105"
        >
          RESET
        </button>
      </div>
    </div>
  );
}