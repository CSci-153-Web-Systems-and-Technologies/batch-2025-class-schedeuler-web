import { addMinutes, format, set, addDays, isBefore, isAfter, differenceInMinutes } from "date-fns";
import { CalendarEvent } from "@/types/calendar";
import { generateRecurringEvents } from "@/utils/calendarUtils";

export interface Suggestion {
  days: number[];
  startTime: string;
  endTime: string;
  busyCount: number;
  busyStudentNames: string[];
  isMerged?: boolean;
  totalDuration?: number;
}

export const getCombinations = (pool: number[], k: number): number[][] => {
  const result: number[][] = [];
  const f = (start: number, current: number[]) => {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < pool.length; i++) {
      current.push(pool[i]);
      f(i + 1, current);
      current.pop();
    }
  };
  f(0, []);
  return result;
};

export const findPatternSlots = (
  allBusyEvents: { event: CalendarEvent; isInstructor: boolean; studentId?: string }[],
  durationMinutes: number,
  poolDays: number[],
  sessionsPerWeek: number,
  timePreference: "any" | "morning" | "afternoon"
): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  const intervalMinutes = 30;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  // [OPTIMIZATION] Replaced moment.add(7, 'days') with date-fns addDays
  const searchWindowEnd = addDays(now, 7);

  const busyInstances: { start: Date; end: Date }[] = [];
  allBusyEvents.forEach((busyEvent) => {
    const instances = generateRecurringEvents([busyEvent.event], now, "week").filter(
      (instance) => instance.start >= now && instance.start <= searchWindowEnd
    );

    instances.forEach((ins) => {
      busyInstances.push({ start: ins.start, end: ins.end });
    });
  });

  const dayCombinations = getCombinations(poolDays, sessionsPerWeek);

  let startHour = 7;
  let endHour = 20;

  if (timePreference === "morning") {
    startHour = 7;
    endHour = 12;
  } else if (timePreference === "afternoon") {
    startHour = 13;
    endHour = 20;
  }

  let baseTime = set(now, { hours: startHour, minutes: 0, seconds: 0, milliseconds: 0 });
  const endTimeLimit = set(now, { hours: endHour, minutes: 0 });

  while (addMinutes(baseTime, durationMinutes) <= endTimeLimit) {
    const timeSlotStartStr = format(baseTime, "HH:mm");
    const slotDurationEnd = addMinutes(baseTime, durationMinutes);

    for (const combination of dayCombinations) {
      let comboConflict = false;

      for (const dayIndex of combination) {
        let checkDate = new Date(now);
        const todayIndex = checkDate.getDay();
        const daysUntil = (dayIndex + 7 - todayIndex) % 7;
        checkDate.setDate(checkDate.getDate() + daysUntil);

        const [h, m] = timeSlotStartStr.split(":").map(Number);
        const specificStart = set(checkDate, { hours: h, minutes: m });
        const specificEnd = addMinutes(specificStart, durationMinutes);

        // [OPTIMIZATION] Replaced moment comparisons with date-fns
        const isBlocked = busyInstances.some((busy) =>
          isBefore(specificStart, busy.end) && isAfter(specificEnd, busy.start)
        );

        if (isBlocked) {
          comboConflict = true;
          break;
        }
      }

      if (!comboConflict) {
        suggestions.push({
          days: combination,
          startTime: format(baseTime, "h:mm a"),
          endTime: format(slotDurationEnd, "h:mm a"),
          busyCount: 0,
          busyStudentNames: [],
          totalDuration: durationMinutes,
        });
      }

      if (suggestions.length >= 5) break;
    }

    baseTime = addMinutes(baseTime, intervalMinutes);
    if (suggestions.length >= 5) break;
  }

  return suggestions;
};