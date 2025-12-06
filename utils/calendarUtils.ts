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
  isSameDay
} from 'date-fns';

export const generateRecurringEvents = (
  baseEvents: CalendarEvent[],
  currentDate: Date,
  view: string
): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  
  // Calculate date range based on current view
  let viewStartDate: Date;
  let viewEndDate: Date;

  switch(view) {
    case 'month':
      viewStartDate = startOfMonth(currentDate);
      viewEndDate = endOfMonth(currentDate);
      break;
    case 'week':
      viewStartDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
      viewEndDate = endOfWeek(currentDate, { weekStartsOn: 1 });
      break;
    case 'day':
      viewStartDate = startOfDay(currentDate);
      viewEndDate = endOfDay(currentDate);
      break;
    case 'agenda':
      // Show events for the next 30 days - NOTE: This view is not used in CalendarToolbar.tsx, but kept here for completeness.
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
      // Handle single events (TASK, EXAM, or non-recurring SUBJECT)
      if (isWithinInterval(baseEvent.start, { start: viewStartDate, end: viewEndDate }) ||
          isWithinInterval(baseEvent.end, { start: viewStartDate, end: viewEndDate })) {
        events.push(baseEvent);
      }
      return;
    }

    // --- Recurrence Logic for SUBJECT events ---
    
    const eventStartDate = baseEvent.start;
    const repeatPattern = baseEvent.repeatPattern || RepeatPattern.NONE;
    const eventRepeatUntil = baseEvent.repeatUntil || viewEndDate;

    // Use the earliest of the view end date or the event's repeatUntil date
    const recurrenceEnd = eventRepeatUntil < viewEndDate ? eventRepeatUntil : viewEndDate;

    // Check if date is excluded
    const isExcluded = (date: Date) => {
      if (!baseEvent.excludeDates) return false;
      return baseEvent.excludeDates.some(excludeDate => 
        isSameDay(excludeDate, date)
      );
    };

    if (repeatPattern === RepeatPattern.WEEKLY && baseEvent.repeatDays) {
      // Iterate through days in the effective view range
      const days = eachDayOfInterval({ start: viewStartDate, end: recurrenceEnd });
      
      days.forEach(day => {
        const dayOfWeek = day.getDay();
        
        if (baseEvent.repeatDays && baseEvent.repeatDays.includes(dayOfWeek)) {
          const eventDate = new Date(day);
          
          // Apply original time to the recurring date
          eventDate.setHours(
            eventStartDate.getHours(),
            eventStartDate.getMinutes(),
            eventStartDate.getSeconds(),
            0
          );

          if (eventDate >= eventStartDate && eventDate <= eventRepeatUntil && !isExcluded(eventDate)) {
            const endTime = new Date(eventDate);
            
            // Calculate duration difference in milliseconds
            const durationMs = baseEvent.end.getTime() - baseEvent.start.getTime();
            endTime.setTime(eventDate.getTime() + durationMs);

            events.push({
              ...baseEvent,
              id: `${baseEvent.id}-${eventDate.getTime()}`, // Unique ID for instance
              start: eventDate,
              end: endTime,
            });
          }
        }
      });
    } else if (repeatPattern === RepeatPattern.DAILY) {
      let currentEventDate = eventStartDate;
      const maxIterations = 365; // Safety limit

      for (let i = 0; i < maxIterations && currentEventDate <= recurrenceEnd; i++) {
        if (currentEventDate >= viewStartDate && !isExcluded(currentEventDate)) {
          const eventDate = new Date(currentEventDate);
          
          // Apply original time to the recurring date
          eventDate.setHours(
            eventStartDate.getHours(),
            eventStartDate.getMinutes(),
            eventStartDate.getSeconds(),
            0
          );

          const endTime = new Date(eventDate);
          const durationMs = baseEvent.end.getTime() - baseEvent.start.getTime();
          endTime.setTime(eventDate.getTime() + durationMs);

          events.push({
            ...baseEvent,
            id: `${baseEvent.id}-${eventDate.getTime()}`,
            start: eventDate,
            end: endTime,
          });
        }

        currentEventDate = addDays(currentEventDate, 1);
      }
    } else if (repeatPattern === RepeatPattern.MONTHLY) {
      // Simple monthly logic
      let currentEventDate = eventStartDate;
      const maxIterations = 12; // Safety limit

      for (let i = 0; i < maxIterations && currentEventDate <= recurrenceEnd; i++) {
        if (currentEventDate >= viewStartDate && !isExcluded(currentEventDate)) {
          const eventDate = new Date(currentEventDate);
          
          // Apply original time
          eventDate.setHours(
            eventStartDate.getHours(),
            eventStartDate.getMinutes(),
            eventStartDate.getSeconds(),
            0
          );

          const endTime = new Date(eventDate);
          const durationMs = baseEvent.end.getTime() - baseEvent.start.getTime();
          endTime.setTime(eventDate.getTime() + durationMs);

          events.push({
            ...baseEvent,
            id: `${baseEvent.id}-${eventDate.getTime()}`,
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