// app/(authenticated)/instructor/schedule/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState } from 'react';
import AppBreadcrumb from '@/app/components/ui/AppBreadCrumb';
import InstructorTodayClasses from './components/InstructorTodayClasses'; 
import ExportPanel from './components/ExportPanel'; 
import CreateClassModal from '../dashboard/components/CreateClassModal';
import EditClassModal from '../classes/components/EditClassModal'; // [NEW] Import Edit Modal
import { useSubjects } from '@/app/(authenticated)/student/subjects/SubjectContext'; 
import moment from 'moment';
import { SlotInfo } from 'react-big-calendar';
import { CalendarEvent } from '@/types/calendar';

// Dynamic import of the Calendar View
const ScheduleView = dynamic(() => import('@/app/(authenticated)/student/calendar/components/CalendarView'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center bg-[var(--color-main-bg)]">
      <div className="text-lg text-[var(--color-text-primary)]">Loading schedule...</div> 
    </div>
  ),
});

export default function InstructorSchedulePage() {
    const { refreshSubjects } = useSubjects();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedClassToEdit, setSelectedClassToEdit] = useState<any | null>(null);

    const [preFilledData, setPreFilledData] = useState<{
        startTime: string;
        endTime: string;
        repeatDays: number[];
    } | null>(null);

    // Handle slot selection to open Create Class Modal
    const handleSlotSelect = (slotInfo: SlotInfo) => {
        const start = slotInfo.start;
        const end = slotInfo.end;
        
        const startTime = moment(start).format('HH:mm');
        const endTime = moment(end).format('HH:mm');
        const day = start.getDay(); 

        setPreFilledData({
            startTime,
            endTime,
            repeatDays: [day]
        });
        
        setIsCreateModalOpen(true);
    };

    // [NEW] Handle clicking an event to open Edit Class Modal
    const handleEventSelect = (event: CalendarEvent) => {
        // We need to map the CalendarEvent back to the structure EditClassModal expects.
        // The event ID is "class_{UUID}". We strip the prefix.
        const originalId = event.id.replace('class_', '').split('_')[0]; // Remove prefix and recurrence suffix

        const classData = {
            id: originalId,
            name: event.title,
            subjectCode: event.subjectCode,
            description: event.description,
            location: event.location,
            color: event.color,
            type: event.classType || 'Lecture', // Uses the new type field
            startTime: moment(event.start).format('HH:mm'),
            endTime: moment(event.end).format('HH:mm'),
            repeatDays: event.repeatDays,
            code: event.subjectCode // Fallback if needed
        };

        setSelectedClassToEdit(classData);
        setIsEditModalOpen(true);
    };

    return (
        <div 
            className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden" 
            style={{ backgroundColor: "var(--color-main-bg)" }}
        >
            <AppBreadcrumb />
            
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Calendar Area */}
                <div className="w-full lg:w-3/4 min-w-0"> 
                    <Suspense fallback={
                        <div className="h-full flex items-center justify-center min-h-[500px]">
                            <div className="text-lg text-[var(--color-text-primary)]">Loading...</div>
                        </div>
                    }> 
                        <ScheduleView 
                            isScheduleOnly={true} 
                            readOnly={true} // Keeps generic events disabled
                            onSlotSelect={handleSlotSelect} // Overrides slot clicking
                            onEventSelect={handleEventSelect} // Overrides event clicking
                        />
                    </Suspense>
                </div>

                {/* Sidebar Area */}
                <div className="w-full lg:w-1/4 space-y-6 flex-shrink-0 min-w-0">
                    <InstructorTodayClasses /> 
                    <ExportPanel />
                </div>
            </div>

            {/* Create Class Modal */}
            <CreateClassModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                initialData={preFilledData}
                onClassCreated={() => {
                    refreshSubjects(); // Update calendar instantly
                }}
            />

            {/* Edit Class Modal */}
            <EditClassModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                classData={selectedClassToEdit}
                onClassUpdated={() => {
                    refreshSubjects(); // Update calendar instantly
                }}
            />
        </div>
    );
}