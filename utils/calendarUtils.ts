// utils/calendarUtils.ts
import { CalendarEvent, EventType, RepeatPattern } from '@/types/calendar';
import { 
  addDays, 
  addMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  startOfDay, 
  endOfDay,
  eachDayOfInterval,
  isWithinInterval,
  isSameDay,
  areIntervalsOverlapping
} from 'date-fns';

export const generateRecurringEvents = (
  baseEvents: CalendarEvent[],
  currentDate: Date,
  view: string
): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  
  let viewStartDate: Date;
  let viewEndDate: Date;

  switch(view) {
    case 'month':
      viewStartDate = startOfMonth(currentDate);
      viewEndDate = endOfMonth(currentDate);
      break;
    case 'week':
      viewStartDate = startOfWeek(currentDate, { weekStartsOn: 1 });
      viewEndDate = endOfWeek(currentDate, { weekStartsOn: 1 });
      break;
    case 'day':
      viewStartDate = startOfDay(currentDate);
      viewEndDate = endOfDay(currentDate);
      break;
    case 'agenda':
      viewStartDate = startOfDay(currentDate);
      viewEndDate = endOfDay(addDays(viewStartDate, 30));
      break;
    default:
      viewStartDate = startOfMonth(currentDate);
      viewEndDate = endOfMonth(currentDate);
  }

  baseEvents.forEach(baseEvent => {
    const isRecurring = baseEvent.type === EventType.SUBJECT && baseEvent.repeatPattern !== RepeatPattern.NONE;
    
    if (!isRecurring) {
      if (isWithinInterval(baseEvent.start, { start: viewStartDate, end: viewEndDate }) ||
          isWithinInterval(baseEvent.end, { start: viewStartDate, end: viewEndDate })) {
        events.push(baseEvent);
      }
      return;
    }

    const eventStartDate = baseEvent.start;
    const repeatPattern = baseEvent.repeatPattern || RepeatPattern.NONE;
    const eventRepeatUntil = baseEvent.repeatUntil || viewEndDate;
    const recurrenceEnd = eventRepeatUntil < viewEndDate ? eventRepeatUntil : viewEndDate;

    const isExcluded = (date: Date) => {
      if (!baseEvent.excludeDates) return false;
      return baseEvent.excludeDates.some(excludeDate => 
        isSameDay(excludeDate, date)
      );
    };

    if (repeatPattern === RepeatPattern.WEEKLY && baseEvent.repeatDays) {
      const days = eachDayOfInterval({ start: viewStartDate, end: recurrenceEnd });
      days.forEach(day => {
        const dayOfWeek = day.getDay();
        if (baseEvent.repeatDays && baseEvent.repeatDays.includes(dayOfWeek)) {
          const eventDate = new Date(day);
          eventDate.setHours(eventStartDate.getHours(), eventStartDate.getMinutes(), 0, 0);
          
          if (eventDate >= eventStartDate && eventDate <= eventRepeatUntil && !isExcluded(eventDate)) {
            const endTime = new Date(eventDate);
            const durationMs = baseEvent.end.getTime() - baseEvent.start.getTime();
            endTime.setTime(eventDate.getTime() + durationMs);

            events.push({
              ...baseEvent,
              id: `${baseEvent.id}_${eventDate.getTime()}`, 
              start: eventDate,
              end: endTime,
            });
          }
        }
      });
    } else if (repeatPattern === RepeatPattern.DAILY) {
      let currentEventDate = eventStartDate;
      const maxIterations = 365;
      for (let i = 0; i < maxIterations && currentEventDate <= recurrenceEnd; i++) {
        if (currentEventDate >= viewStartDate && !isExcluded(currentEventDate)) {
          const eventDate = new Date(currentEventDate);
          eventDate.setHours(eventStartDate.getHours(), eventStartDate.getMinutes(), 0, 0);
          const endTime = new Date(eventDate);
          const durationMs = baseEvent.end.getTime() - baseEvent.start.getTime();
          endTime.setTime(eventDate.getTime() + durationMs);
          events.push({
            ...baseEvent,
            id: `${baseEvent.id}_${eventDate.getTime()}`,
            start: eventDate,
            end: endTime,
          });
        }
        currentEventDate = addDays(currentEventDate, 1);
      }
    } else if (repeatPattern === RepeatPattern.MONTHLY) {
      let currentEventDate = eventStartDate;
      const maxIterations = 12;
      for (let i = 0; i < maxIterations && currentEventDate <= recurrenceEnd; i++) {
        if (currentEventDate >= viewStartDate && !isExcluded(currentEventDate)) {
          const eventDate = new Date(currentEventDate);
          eventDate.setHours(eventStartDate.getHours(), eventStartDate.getMinutes(), 0, 0);
          const endTime = new Date(eventDate);
          const durationMs = baseEvent.end.getTime() - baseEvent.start.getTime();
          endTime.setTime(eventDate.getTime() + durationMs);
          events.push({
            ...baseEvent,
            id: `${baseEvent.id}_${eventDate.getTime()}`,
            start: eventDate,
            end: endTime,
          });
        }
        currentEventDate = addMonths(currentEventDate, 1);
      }
    }
  });

  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
};

export const checkForConflicts = (newEvent: CalendarEvent, existingEvents: CalendarEvent[]): boolean => {
  const candidates = existingEvents.filter(e =>
    (e.type === EventType.SUBJECT || e.type === EventType.EXAM) && 
    e.id !== newEvent.id
  );

  const getDayMinutes = (d: Date) => d.getHours() * 60 + d.getMinutes();
  
  const toMidnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const newStartMins = getDayMinutes(newEvent.start);
  const newEndMins = getDayMinutes(newEvent.end);

  for (const existing of candidates) {
    const exStartMins = getDayMinutes(existing.start);
    const exEndMins = getDayMinutes(existing.end);

    const hasTimeOverlap = (newStartMins < exEndMins) && (newEndMins > exStartMins);

    if (!hasTimeOverlap) continue;

    const newIsRecurring = newEvent.repeatPattern !== RepeatPattern.NONE;
    const exIsRecurring = existing.repeatPattern !== RepeatPattern.NONE;

    if (!newIsRecurring && !exIsRecurring) {
        if (isSameDay(newEvent.start, existing.start)) return true;
    }

    else if (newIsRecurring && exIsRecurring) {
        const newStart = toMidnight(newEvent.start);
        const newUntil = newEvent.repeatUntil ? toMidnight(newEvent.repeatUntil) : new Date(2100, 0, 1);
        
        const exStart = toMidnight(existing.start);
        const exUntil = existing.repeatUntil ? toMidnight(existing.repeatUntil) : new Date(2100, 0, 1);

        const rangesOverlap = (newStart <= exUntil) && (newUntil >= exStart);

        if (rangesOverlap) {
            const newDays = newEvent.repeatDays || [];
            const exDays = existing.repeatDays || [];
            if (newDays.some(day => exDays.includes(day))) return true;
        }
    }

    else {
        const recurring = newIsRecurring ? newEvent : existing;
        const single = newIsRecurring ? existing : newEvent;
        
        const singleDate = toMidnight(single.start);
        const recurStart = toMidnight(recurring.start);
        const recurUntil = recurring.repeatUntil ? toMidnight(recurring.repeatUntil) : new Date(2100, 0, 1);

        if (singleDate >= recurStart && singleDate <= recurUntil) {
            const dayOfWeek = single.start.getDay();
            if ((recurring.repeatDays || []).includes(dayOfWeek)) {
                const isExcluded = recurring.excludeDates?.some(d => isSameDay(d, single.start));
                if (!isExcluded) return true;
            }
        }
    }
  }

  return false;
};