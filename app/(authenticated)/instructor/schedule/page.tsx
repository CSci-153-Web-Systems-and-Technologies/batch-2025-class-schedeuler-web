'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState } from 'react';
import AppBreadcrumb from '@/app/components/ui/AppBreadCrumb';
import InstructorTodayClasses from './components/InstructorTodayClasses'; 
import ExportPanel from './components/ExportPanel'; 
import CreateClassModal from '../dashboard/components/CreateClassModal';
import EditClassModal from '../classes/components/EditClassModal';
import { useSubjects } from '@/app/(authenticated)/student/subjects/SubjectContext'; 
import moment from 'moment';
import { SlotInfo } from 'react-big-calendar';
import { CalendarEvent } from '@/types/calendar';
import { createClient } from '@/utils/supabase/client';

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
    const supabase = createClient(); 
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedClassToEdit, setSelectedClassToEdit] = useState<any | null>(null);

    const [preFilledData, setPreFilledData] = useState<{
        startTime: string;
        endTime: string;
        repeatDays: number[];
    } | null>(null);

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

    const handleEventSelect = async (event: CalendarEvent) => { 
        const originalId = event.id.replace('class_', '').split('_')[0]; 

        const { data: classDetails, error } = await supabase
            .from('classes')
            .select('id, name, subject_code, description, location, color, class_type, start_time, end_time, repeat_days, code')
            .eq('id', originalId)
            .single();

        if (error || !classDetails) {
            console.error("Error fetching class details for edit:", error);
            return;
        }

        const classData = {
            id: classDetails.id,
            name: classDetails.name,
            subjectCode: classDetails.subject_code,
            description: classDetails.description,
            location: classDetails.location,
            color: classDetails.color,
            type: classDetails.class_type || 'Lecture', 
            startTime: moment(event.start).format('HH:mm'),
            endTime: moment(event.end).format('HH:mm'),
            repeatDays: classDetails.repeat_days,
            code: classDetails.code,
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
                <div className="w-full lg:w-3/4 min-w-0"> 
                    <Suspense fallback={
                        <div className="h-full flex items-center justify-center min-h-[500px]">
                            <div className="text-lg text-[var(--color-text-primary)]">Loading...</div>
                        </div>
                    }> 
                        <ScheduleView 
                            isScheduleOnly={true} 
                            readOnly={true}
                            onSlotSelect={handleSlotSelect}
                            onEventSelect={handleEventSelect}
                        />
                    </Suspense>
                </div>

                <div className="w-full lg:w-1/4 space-y-6 flex-shrink-0 min-w-0">
                    <InstructorTodayClasses /> 
                    <ExportPanel />
                </div>
            </div>

            <CreateClassModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                initialData={preFilledData}
                onClassCreated={() => {
                    refreshSubjects();
                }}
            />

            <EditClassModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                classData={selectedClassToEdit}
                onClassUpdated={() => {
                    refreshSubjects();
                }}
            />
        </div>
    );
}