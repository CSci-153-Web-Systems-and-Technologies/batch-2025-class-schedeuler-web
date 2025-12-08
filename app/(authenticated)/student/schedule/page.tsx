'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState } from 'react';
import AppBreadcrumb from '@/app/components/ui/AppBreadCrumb';
import TodaySubjectsPanel from './components/TodaySubjectsPanel'; 
import ExportPanel from './components/ExportPanel'; 
import EventModal from '../calendar/components/EventModal'; 
import { CalendarEvent, EventType, RepeatPattern } from '@/types/calendar'; 
import { useSubjects } from '../subjects/SubjectContext'; 
import { useToast } from '@/app/context/ToastContext'; 
import { checkForConflicts } from '@/utils/calendarUtils'; 

const ScheduleView = dynamic(() => import('../calendar/components/CalendarView'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center bg-[var(--color-main-bg)]">
      <div className="text-lg text-[var(--color-text-primary)]">Loading schedule...</div> 
    </div>
  ),
});

export default function SchedulePage() {
    const { subjects, addSubject, updateSubject } = useSubjects(); 
    const { showToast } = useToast(); 
    
    const [showEventModal, setShowEventModal] = useState(false);
    const [localEventToEdit, setLocalEventToEdit] = useState<CalendarEvent | null>(null);

    const handleAddSubjectClick = () => {
        const now = new Date();
        const newSubject: CalendarEvent = {
            id: Date.now().toString(),
            title: "",
            type: EventType.SUBJECT,
            start: new Date(now.setHours(now.getHours() + 1, 0, 0, 0)),
            end: new Date(now.setHours(now.getHours() + 2, 0, 0, 0)),
            color: '#4169e1',
            subjectCode: '',
            location: '',
            repeatPattern: RepeatPattern.WEEKLY,
            repeatDays: [new Date().getDay()],
        };
        setLocalEventToEdit(newSubject);
        setShowEventModal(true);
    };
    
    const handleSaveEvent = (event: CalendarEvent) => {
        if (event.type === EventType.SUBJECT) {
            if (checkForConflicts(event, subjects)) {
                showToast("Conflict Detected", "This time slot overlaps with another subject.", "error");
                return; 
            }
        }

        if (localEventToEdit && event.id === localEventToEdit.id) {
            addSubject(event);
            showToast("Success", "Subject added successfully.", "success");
        } else {
            updateSubject(event); 
            showToast("Success", "Subject updated.", "success");
        }
        
        setShowEventModal(false);
        setLocalEventToEdit(null);
    };

    const handleCloseModal = () => {
        setShowEventModal(false);
        setLocalEventToEdit(null);
    };
    
    const handleDeletePlaceholder = () => {
        handleCloseModal();
    };

    return (
        <div 
            className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden" 
            style={{ backgroundColor: "var(--color-main-bg)" }}
        >
            <AppBreadcrumb />
            
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-3/4 min-w-0"> 
                    <Suspense fallback={
                        <div className="h-full flex items-center justify-center min-h-[500px]">
                            <div className="text-lg text-[var(--color-text-primary)]">Loading...</div>
                        </div>
                    }> 
                        <ScheduleView isScheduleOnly={true} />
                    </Suspense>
                </div>

                <div className="w-full lg:w-1/4 space-y-6 flex-shrink-0 min-w-0">
                    <TodaySubjectsPanel onAddSubject={handleAddSubjectClick} /> 
                    <ExportPanel />
                </div>
            </div>
            
            {showEventModal && (
                <EventModal
                    event={localEventToEdit}
                    slotInfo={null} 
                    isScheduleOnly={true} 
                    onSave={handleSaveEvent}
                    onDelete={handleDeletePlaceholder} 
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}