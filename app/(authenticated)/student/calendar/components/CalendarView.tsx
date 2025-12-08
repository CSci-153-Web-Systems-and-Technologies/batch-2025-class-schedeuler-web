// components/Calendar/CalendarView.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer, View, SlotInfo, EventProps } from 'react-big-calendar';
import moment from 'moment';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CalendarEvent, EventType, RepeatPattern } from '@/types/calendar';
import { generateRecurringEvents, checkForConflicts } from '@/utils/calendarUtils';
import CalendarToolbar from './CalendarToolbar';
import EventComponent from './EventComponent';
import EventModal from './EventModal';
import DeleteEventModal from './DeleteEventModal';
import '@/styles/CalendarStyles.css';
import { useTasks } from '../../tasks/TaskContext'; 
import { useSubjects } from '../../subjects/SubjectContext';
import { useToast } from '@/app/context/ToastContext';
import { isSameDay } from 'date-fns';

import { Calendar as MobileCalendar, CalendarMarker } from '@/app/components/ui/Calendar';

moment.updateLocale('en', {
  week: { dow: 1, doy: 1 },
});
const localizer = momentLocalizer(moment);

const DnDCalendar = withDragAndDrop(BigCalendar as any) as React.ComponentType<any>;

interface CalendarViewProps {
  initialDate?: Date;
  isScheduleOnly?: boolean; 
  readOnly?: boolean; 
  onSlotSelect?: (slotInfo: SlotInfo) => void;
  // [NEW] Custom handler for selecting an event (to edit classes in instructor view)
  onEventSelect?: (event: CalendarEvent) => void; 
}

const FIVE_AM = moment().hours(5).minutes(0).toDate();

const CalendarView: React.FC<CalendarViewProps> = ({ 
  initialDate = new Date(), 
  isScheduleOnly = false,
  readOnly = false,
  onSlotSelect,
  onEventSelect // [NEW] Destructure the new prop
}) => {
  const { tasks: taskEvents, addTask, updateTask, deleteTask: deleteTaskContext } = useTasks();
  const { 
    subjects: baseSubjectExamEvents, 
    addSubject, 
    updateSubject, 
    deleteSubject: deleteSubjectContext 
  } = useSubjects(); 
  const { showToast } = useToast();
  
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate); 
  const [view, setView] = useState<View>(isScheduleOnly ? 'week' : 'month'); 
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [filter, setFilter] = useState<'all' | EventType>(isScheduleOnly ? EventType.SUBJECT : 'all');
  const [calendarKey, setCalendarKey] = useState(0); 
  const [isMobile, setIsMobile] = useState(false);

  const availableViews: View[] = useMemo(() => {
    return isScheduleOnly ? ['week', 'day'] : ['month', 'week', 'day', 'agenda'];
  }, [isScheduleOnly]);

  const toolbarViews: View[] = useMemo(() => {
    if (isScheduleOnly) return ['week', 'day'];
    return ['month', 'week', 'day', 'agenda'];
  }, [isScheduleOnly]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const combinedBaseEvents = useMemo(() => [
    ...baseSubjectExamEvents, 
    ...taskEvents.filter(t => t.type === EventType.TASK) 
  ], [baseSubjectExamEvents, taskEvents]);

  const calendarEvents = useMemo(() => {
    const allEvents = generateRecurringEvents(combinedBaseEvents, currentDate, view);
    return allEvents.filter(event => 
      isScheduleOnly ? event.type === EventType.SUBJECT : filter === 'all' || event.type === filter
    );
  }, [combinedBaseEvents, filter, currentDate, view, isScheduleOnly]);

  const selectedDayEvents = useMemo(() => {
    const dayEvents = generateRecurringEvents(combinedBaseEvents, selectedDate, 'day');
    return dayEvents.filter(event => 
        isSameDay(event.start, selectedDate) &&
        (isScheduleOnly ? event.type === EventType.SUBJECT : filter === 'all' || event.type === filter)
    ).sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [combinedBaseEvents, selectedDate, filter, isScheduleOnly]);

  const mobileMarkers = useMemo(() => {
    const monthEvents = generateRecurringEvents(combinedBaseEvents, currentDate, 'month');
    const markerMap = new Map<string, CalendarMarker>();

    monthEvents.forEach(evt => {
        if (isScheduleOnly && evt.type !== EventType.SUBJECT) return;
        if (filter !== 'all' && evt.type !== filter) return;

        const dateKey = evt.start.toDateString();
        
        if (!markerMap.has(dateKey)) {
            markerMap.set(dateKey, {
                date: evt.start,
                events: []
            });
        }

        markerMap.get(dateKey)?.events.push({
            title: evt.title,
            color: evt.color || 'var(--color-primary)',
            type: evt.type,
            time: evt.allDay ? 'All Day' : moment(evt.start).format('h:mm A')
        });
    });

    return Array.from(markerMap.values());
  }, [combinedBaseEvents, currentDate, filter, isScheduleOnly]);


  const handleSelectEvent = (event: CalendarEvent) => {
    // [FIX] If onEventSelect is provided (Instructor Mode), call it and return
    if (onEventSelect) {
        onEventSelect(event);
        return;
    }

    if (readOnly) return; 
    if (isScheduleOnly && event.type !== EventType.SUBJECT) return; 
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    if (onSlotSelect) {
        onSlotSelect(slotInfo);
        return;
    }

    if (readOnly) return; 
    setSelectedSlot(slotInfo);
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const updateBaseEvent = (event: CalendarEvent) => {
    event.type === EventType.TASK ? updateTask(event) : updateSubject(event);
  };
  const addBaseEvent = (event: CalendarEvent) => {
    event.type === EventType.TASK ? addTask({...event, taskEstimate: event.taskEstimate || '0%'}) : addSubject(event);
  };
  
  const isRecurringSubject = (event: CalendarEvent) => {
      if (event.type === EventType.SUBJECT && event.repeatPattern !== RepeatPattern.NONE) return true;
      if (event.id.includes('_') && event.type === EventType.SUBJECT) return true;
      return false;
  };

  const handleEventSave = (event: CalendarEvent) => {
    const isRecurringInstance = event.id.includes('_') && event.type === EventType.SUBJECT;
    const actualId = isRecurringInstance ? event.id.split('_')[0] : event.id;
    const existingEvent = combinedBaseEvents.find(e => e.id === actualId);
    let eventToProcess = { ...event, id: existingEvent ? actualId : Date.now().toString() };
    
    if (existingEvent) {
       const durationMs = event.end.getTime() - event.start.getTime();
       const newBaseStart = new Date(existingEvent.start);
       newBaseStart.setHours(event.start.getHours(), event.start.getMinutes());
       eventToProcess.start = newBaseStart;
       eventToProcess.end = new Date(newBaseStart.getTime() + durationMs);
    }

    if ((event.type === EventType.SUBJECT || event.type === EventType.EXAM) && checkForConflicts(eventToProcess, combinedBaseEvents)) {
        showToast("Conflict", "Overlap detected.", "error");
        return;
    }
    existingEvent ? updateBaseEvent(eventToProcess) : addBaseEvent(eventToProcess);
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const handleEventDelete = () => selectedEvent && setShowDeleteModal(true);
  
  const handleConfirmDelete = (opt: any) => { 
      if (selectedEvent) {
        const id = selectedEvent.id.split('_')[0];
        if (selectedEvent.type === EventType.TASK) deleteTaskContext(id);
        else deleteSubjectContext(id); 
      }
      setShowDeleteModal(false); 
      setShowEventModal(false);
      setSelectedEvent(null); 
  };

  const handleEventDrop = (data: { event: CalendarEvent; start: Date; end: Date }) => {
    if (readOnly) return; 
    if (isScheduleOnly && data.event.type !== EventType.SUBJECT) return; 
    const { event, start, end } = data;
    if (isRecurringSubject(event)) return; 
    
    const baseEventId = event.id.includes('_') ? event.id.split('_')[0] : event.id;
    const originalEvent = combinedBaseEvents.find(e => e.id === baseEventId);

    if (originalEvent) {
      const duration = moment(originalEvent.end).diff(moment(originalEvent.start));
      const newEnd = moment(start).add(duration, 'milliseconds').toDate();
      const updatedEvent = { ...originalEvent, start, end: newEnd };

      if ((updatedEvent.type === EventType.SUBJECT || updatedEvent.type === EventType.EXAM) && 
          checkForConflicts(updatedEvent, combinedBaseEvents)) {
          showToast("Conflict", "Overlap detected.", "error");
          return;
      }
      updateBaseEvent(updatedEvent);
    }
  };

  const handleEventResize = (data: { event: CalendarEvent; start: Date; end: Date }) => {
    if (readOnly) return; 
    if (isScheduleOnly && data.event.type !== EventType.SUBJECT) return; 
    const { event, start, end } = data;
    const baseEventId = event.id.includes('_') ? event.id.split('_')[0] : event.id;
    const originalEvent = combinedBaseEvents.find(e => e.id === baseEventId);

    if (originalEvent) {
        const updatedEvent = { ...originalEvent, start, end };
        if ((updatedEvent.type === EventType.SUBJECT || updatedEvent.type === EventType.EXAM) && 
            checkForConflicts(updatedEvent, combinedBaseEvents)) {
            showToast("Conflict", "Overlap detected.", "error");
            return;
        }
        updateBaseEvent(updatedEvent);
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const isDraggable = !readOnly && !isScheduleOnly && !isRecurringSubject(event); 
    const backgroundColor = event.color || (event.type === EventType.EXAM ? '#52c41a' : event.type === EventType.TASK ? '#ff4d4f' : 'var(--color-primary)');
    return { 
        style: {
            backgroundColor,
            borderRadius: '4px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block',
            cursor: isDraggable ? 'grab' : 'default',
        }
    };
  };
  
  const handleNavigate = (newDate: Date) => setCurrentDate(newDate);
  const handleViewChange = (newView: View) => {
    setView(newView);
    setCalendarKey(prev => prev + 1); 
  };
  
  return (
    <div className="w-full h-full flex flex-col"> 
      {!isScheduleOnly && (
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">Academic Calendar</h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)]">Manage your assignments, exams, and class schedule</p>
        </div>
      )}

      {isMobile && view === 'month' ? (
        <div className="flex flex-col h-full gap-6">
            <div className="flex justify-between items-center mb-2 px-2 lg:hidden">
                 <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                    {moment(currentDate).format('MMMM YYYY')}
                 </h2>
                 <div className="flex bg-[var(--color-hover)] rounded-lg p-1">
                    {['month', 'week', 'day'].map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v as View)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                                view === v ? 'bg-[var(--color-components-bg)] shadow text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'
                            }`}
                        >
                            {v.charAt(0).toUpperCase() + v.slice(1)}
                        </button>
                    ))}
                 </div>
            </div>

            <div className="bg-[var(--color-components-bg)] rounded-xl border border-[var(--color-border)] p-2 shadow-sm w-full">
                <MobileCalendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    month={currentDate}
                    onMonthChange={setCurrentDate}
                    className="w-full rounded-md border-none"
                    markedDates={mobileMarkers} 
                    captionLayout="dropdown"
                    showOutsideDays={true}
                    fixedWeeks={true}
                    fromYear={1900}
                    toYear={2100}
                />
            </div>

            <div className="flex-1 bg-[var(--color-components-bg)] rounded-xl border border-[var(--color-border)] p-4 shadow-sm overflow-hidden flex flex-col min-h-[300px]">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-[var(--color-border)]">
                    <h3 className="font-bold text-[var(--color-text-primary)]">
                        {moment(selectedDate).format('MMMM D, YYYY')}
                    </h3>
                    {!readOnly && ( 
                        <button 
                            onClick={() => {
                                const start = new Date(selectedDate);
                                start.setHours(9, 0, 0, 0);
                                const end = new Date(start);
                                end.setHours(10, 0, 0, 0);
                                setSelectedEvent({ id: '', title: '', start, end, type: EventType.TASK } as CalendarEvent);
                                setShowEventModal(true);
                            }}
                            className="text-xs bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-full font-medium"
                        >
                            + Add
                        </button>
                    )}
                </div>

                <div className="overflow-y-auto flex-1 space-y-3 pr-1">
                    {selectedDayEvents.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-[var(--color-text-secondary)] text-sm italic">
                            No events for this day.
                        </div>
                    ) : (
                        selectedDayEvents.map((evt, i) => (
                            <div 
                                key={i}
                                onClick={() => handleSelectEvent(evt)}
                                className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-hover)] hover:shadow-md transition-all active:scale-[0.98]"
                            >
                                <div 
                                    className="w-1.5 h-10 rounded-full flex-shrink-0" 
                                    style={{ backgroundColor: evt.color || 'var(--color-primary)' }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-[var(--color-text-primary)] truncate">{evt.title}</p>
                                    <div className="flex justify-between items-center mt-0.5">
                                        <p className="text-xs text-[var(--color-text-secondary)]">
                                            {moment(evt.start).format('h:mm A')} - {moment(evt.end).format('h:mm A')}
                                        </p>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-border)] text-[var(--color-text-secondary)] capitalize">
                                            {evt.type}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      ) : (
        
        <div className="p-4 calendar-container" style={{ height: 'calc(100vh - 120px)' }}> 
            <DnDCalendar
                key={calendarKey}
                localizer={localizer}
                events={calendarEvents} 
                startAccessor="start"
                endAccessor="end"
                date={currentDate}
                view={view}
                onView={handleViewChange}
                onNavigate={handleNavigate}
                views={availableViews}
                style={{ height: '100%' }}
                scrollToTime={FIVE_AM}
                components={{
                    toolbar: (props: any) => (
                    <CalendarToolbar 
                        {...props}
                        onFilterChange={setFilter} 
                        filter={filter}
                        availableViews={toolbarViews} 
                    />
                    ),
                    event: (props: EventProps<CalendarEvent>) => <EventComponent {...props} view={view} />,
                }}
                eventPropGetter={eventStyleGetter}
                selectable={!readOnly || !!onSlotSelect} 
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventResize}
                resizable={!readOnly} 
                dayLayoutAlgorithm="no-overlap"
                formats={{
                    timeGutterFormat: 'HH:mm',
                    eventTimeRangeFormat: () => '',
                }}
            />
        </div>
      )}

      {/* Render generic event modal only if NOT overridden by onSlotSelect */}
      {showEventModal && !readOnly && !onSlotSelect && !onEventSelect && (
        <EventModal
          event={selectedEvent}
          slotInfo={selectedSlot}
          isScheduleOnly={isScheduleOnly}
          onSave={handleEventSave}
          onDelete={handleEventDelete}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
            setSelectedSlot(null);
          }}
        />
      )}

      {showDeleteModal && selectedEvent && !readOnly && (
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