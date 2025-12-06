// components/Calendar/CalendarView.tsx
import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer, View, SlotInfo, EventProps, CalendarProps } from 'react-big-calendar';
import moment from 'moment';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CalendarEvent, EventType, RepeatPattern } from '@/types/calendar';
import { generateRecurringEvents } from '@/utils/calendarUtils';
import CalendarToolbar from './CalendarToolbar';
import EventComponent from './EventComponent';
import EventModal from './EventModal';
import DeleteEventModal from './DeleteEventModal';
import '@/styles/CalendarStyles.css'; // Add custom styles

const localizer = momentLocalizer(moment);

// Create a typed Calendar component
type CalendarPropsType = CalendarProps<CalendarEvent, object>;
type DnDCalendarProps = CalendarPropsType & {
  onEventDrop?: (args: { event: CalendarEvent; start: Date; end: Date }) => void;
  onEventResize?: (args: { event: CalendarEvent; start: Date; end: Date }) => void;
  resizable?: boolean;
};

// Cast to any to bypass TypeScript errors with the HOC
const DnDCalendar = withDragAndDrop(Calendar as any) as React.ComponentType<DnDCalendarProps>;

interface CalendarViewProps {
  initialDate?: Date;
}

// Helper to get the current year and month
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();

// FIX: Define the scroll time constant for 5:00 AM
const FIVE_AM = moment().hours(5).minutes(0).toDate();


const CalendarView: React.FC<CalendarViewProps> = ({ initialDate = new Date() }) => {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [view, setView] = useState<View>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [filter, setFilter] = useState<'all' | EventType>('all');
  // FIX: Add key state to force re-render/re-mount of DnDCalendar on view change
  const [calendarKey, setCalendarKey] = useState(0); 
  
  // Initial events now include a recurring Subject
  const [baseEvents, setBaseEvents] = useState<CalendarEvent[]>([
    {
      id: 'S1',
      title: 'Software Engineering',
      type: EventType.SUBJECT,
      // Recurrence Anchor: Start on the first Monday of the current month
      start: new Date(currentYear, currentMonth, 2, 13, 0), // Adjust date/day as needed for your current time
      end: new Date(currentYear, currentMonth, 2, 14, 30),
      color: '#4169e1',
      subjectCode: 'CS401',
      instructor: 'Dr. Turing',
      repeatPattern: RepeatPattern.WEEKLY,
      repeatDays: [1, 3], // Monday and Wednesday
      repeatUntil: new Date(currentYear + 1, 0, 15), // Repeats until Jan 15 of next year
    },
    {
      id: 'T1',
      title: 'Math Homework Due (4h)',
      type: EventType.TASK,
      start: new Date(currentYear, currentMonth, 10, 19, 0),
      end: new Date(currentYear, currentMonth, 10, 23, 0),
      completed: false,
      priority: 'high',
      taskEstimate: '4 hours',
      color: '#ff4d4f',
      repeatPattern: RepeatPattern.NONE,
    },
    {
      id: 'E1',
      title: 'Physics Midterm Exam',
      type: EventType.EXAM,
      start: new Date(currentYear, currentMonth, 15, 9, 0),
      end: new Date(currentYear, currentMonth, 15, 11, 0),
      color: '#52c41a',
      repeatPattern: RepeatPattern.NONE,
    },
  ]);

  // Event calculation: Use the recurrence utility now
  const calendarEvents = useMemo(() => {
    const allEvents = generateRecurringEvents(baseEvents, currentDate, view);
    
    return allEvents.filter(event => 
      filter === 'all' || event.type === filter
    );
  }, [baseEvents, filter, currentDate, view]);

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSelectedSlot(slotInfo);
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Check if an event is a recurring SUBJECT (base or instance)
  const isRecurringSubject = (event: CalendarEvent) => {
      // Check if it's a recurring base event
      if (event.type === EventType.SUBJECT && event.repeatPattern !== RepeatPattern.NONE) return true;
      // Check if it's an instance of a recurring event (has the timestamp suffix)
      if (event.id.includes('-') && event.type === EventType.SUBJECT) return true;
      return false;
  };

  // Handle drag and drop (Move Event)
  const handleEventDrop = (data: { event: CalendarEvent; start: Date; end: Date }) => {
    const { event, start, end } = data;

    // DISABLE DRAG FOR RECURRING SUBJECTS (base and instances)
    if (isRecurringSubject(event)) {
      console.log('Cannot drag recurring subject events.');
      return; 
    }
    
    // Find the original event from baseEvents to get accurate original start/end
    const originalEvent = baseEvents.find(e => e.id === event.id);

    const updatedEvents = baseEvents.map(evt => {
      if (evt.id === event.id && originalEvent) {
        // Calculate the exact duration in milliseconds
        const duration = moment(originalEvent.end).diff(moment(originalEvent.start));
        
        // Apply that duration to the new start time to get the new end time
        const newEnd = moment(start).add(duration, 'milliseconds').toDate();
        
        return { 
          ...evt, 
          start, 
          end: newEnd,
        };
      }
      return evt;
    });
    setBaseEvents(updatedEvents);
  };

  // Handle event resize (Change Duration/Date span)
  const handleEventResize = (data: { event: CalendarEvent; start: Date; end: Date }) => {
    const { event, start, end } = data;

    // Logic to identify the base event ID for Subjects
    const baseEventId = event.id.includes('-') && event.type === EventType.SUBJECT
        ? event.id.split('-')[0]
        : event.id;

    const originalBaseEvent = baseEvents.find(e => e.id === baseEventId);

    if (originalBaseEvent && originalBaseEvent.type === EventType.SUBJECT && originalBaseEvent.repeatPattern !== RepeatPattern.NONE) {
        // If it's a recurring subject (base or instance), we update the BASE event's time slots.
        
        // Only update the time component, preserving the original recurrence anchor date
        const updatedStart = new Date(originalBaseEvent.start);
        updatedStart.setHours(start.getHours(), start.getMinutes(), start.getSeconds(), 0);

        const updatedEnd = new Date(originalBaseEvent.end);
        updatedEnd.setHours(end.getHours(), end.getMinutes(), end.getSeconds(), 0);
        
        const updatedEvents = baseEvents.map(evt => {
            if (evt.id === baseEventId) {
                return { 
                    ...evt, 
                    start: updatedStart, 
                    end: updatedEnd,
                };
            }
            return evt;
        });
        setBaseEvents(updatedEvents);

    } else {
        // Non-recurring events (Tasks, Exams) are updated directly.
        const updatedEvents = baseEvents.map(evt => {
            if (evt.id === baseEventId) {
                return { 
                    ...evt, 
                    start, 
                    end,
                };
            }
            return evt;
        });
        setBaseEvents(updatedEvents);
    }
  };

  const handleEventSave = (event: CalendarEvent) => {
    console.log('Save event:', event);
    
    const isRecurringInstance = event.id.includes('-') && event.type === EventType.SUBJECT;
    
    if (event.id && !isRecurringInstance) {
      // Update existing base event (TASK, EXAM, or non-recurring SUBJECT)
      const updatedEvents = baseEvents.map(evt => 
        evt.id === event.id ? event : evt
      );
      setBaseEvents(updatedEvents);
    } else if (isRecurringInstance) {
        // Block saving recurring event instances to prevent complex state issues
        console.warn("Cannot save a recurring event instance directly. Modify the base event.");
    }
     else {
      // Create new event
      const newEvent = {
        ...event,
        id: Date.now().toString(),
      };
      setBaseEvents(prev => [...prev, newEvent]);
    }
    setShowEventModal(false);
    setSelectedEvent(null);
    setSelectedSlot(null);
  };

  // Delete handler
  const handleEventDelete = () => {
    if (selectedEvent) {
      setShowDeleteModal(true);
    }
  };

  // New: Actually delete the event - handles recurrence now
  const handleConfirmDelete = (deleteOption: 'this' | 'all' | 'future') => {
    if (!selectedEvent) return;
    
    // Get the base ID, ignoring the instance timestamp if present
    const baseEventId = selectedEvent.id.includes('-') ? selectedEvent.id.split('-')[0] : selectedEvent.id;
    const isBaseEvent = baseEventId === selectedEvent.id;
    const isRecurring = selectedEvent.type === EventType.SUBJECT && (selectedEvent.repeatPattern !== RepeatPattern.NONE || !isBaseEvent);

    if (!isRecurring || deleteOption === 'all') {
      // Delete all instances (or single non-recurring event)
      setBaseEvents(prev => prev.filter(evt => evt.id !== baseEventId));
    } else if (deleteOption === 'this') {
      // Create an exception for this specific date
      const baseEvent = baseEvents.find(evt => evt.id === baseEventId);
      
      if (baseEvent && selectedEvent.start) {
        // Add exclude date
        const updatedEvent = {
          ...baseEvent,
          excludeDates: [...(baseEvent.excludeDates || []), selectedEvent.start]
        };
        
        const updatedEvents = baseEvents.map(evt => 
          evt.id === baseEventId ? updatedEvent : evt
        );
        setBaseEvents(updatedEvents);
      }
    } else if (deleteOption === 'future') {
      // For future deletion, set repeatUntil to the day before this event
      const baseEvent = baseEvents.find(evt => evt.id === baseEventId);
      
      if (baseEvent && selectedEvent.start) {
        const dayBefore = new Date(selectedEvent.start);
        dayBefore.setDate(dayBefore.getDate() - 1);
        
        const updatedEvent = {
          ...baseEvent,
          repeatUntil: dayBefore
        };
        
        const updatedEvents = baseEvents.map(evt => 
          evt.id === baseEventId ? updatedEvent : evt
        );
        setBaseEvents(updatedEvents);
      }
    }

    setShowDeleteModal(false);
    setShowEventModal(false);
    setSelectedEvent(null);
    setSelectedSlot(null);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    // Non-recurring events are draggable. Recurring subjects are NOT draggable.
    const isDraggable = !isRecurringSubject(event); 
    
    // All events are RESIZABLE.
    const isResizable = true; 

    // Ensure the event color is used correctly
    const backgroundColor = event.color || 
      (event.type === EventType.EXAM ? '#52c41a' : 
       event.type === EventType.TASK ? '#ff4d4f' : 'var(--color-primary)');
    
    const style = {
      backgroundColor,
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
      cursor: isDraggable ? 'grab' : 'default', // Change cursor for non-draggable events
    };
    
    return { style, draggable: isDraggable, resizable: isResizable };
  };

  // Handle navigation
  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  // Handle view change
  const handleViewChange = (newView: View) => {
    setView(newView);
    // FIX: Force re-render/re-mount of the calendar component when the view changes.
    // This is a common and reliable workaround for synchronization issues where 
    // react-big-calendar fails to display recurring events after the initial view switch.
    setCalendarKey(prev => prev + 1); 
  };

  return (
    <div className="calendar-view">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Academic Calendar</h1>
        <p className="text-[var(--color-text-secondary)]">Manage your assignments, exams, and class schedule</p>
      </div>

      <div className="calendar-container">
        <DnDCalendar
          key={calendarKey} // Apply the key here to force re-mount on view change
          localizer={localizer}
          events={calendarEvents} 
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          view={view}
          onView={handleViewChange}
          onNavigate={handleNavigate}
          style={{ height: '100%' }}
          // FIX: Added scrollToTime to default scroll to 5:00 AM in Week/Day views
          scrollToTime={FIVE_AM}
          components={{
            toolbar: (props: any) => (
              <CalendarToolbar 
                {...props}
                onFilterChange={setFilter}
                filter={filter}
              />
            ),
            event: (props: EventProps<CalendarEvent>) => <EventComponent {...props} />,
          }}
          eventPropGetter={eventStyleGetter}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          resizable
          dayLayoutAlgorithm="no-overlap"
          formats={{
            timeGutterFormat: 'HH:mm',
            eventTimeRangeFormat: ({ start, end }) => 
              `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
          }}
        />
      </div>

      {showEventModal && (
        <EventModal
          event={selectedEvent}
          slotInfo={selectedSlot}
          onSave={handleEventSave}
          onDelete={handleEventDelete}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
            setSelectedSlot(null);
          }}
        />
      )}

      {showDeleteModal && selectedEvent && (
        <DeleteEventModal
          event={selectedEvent}
          onConfirm={handleConfirmDelete} 
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default CalendarView;