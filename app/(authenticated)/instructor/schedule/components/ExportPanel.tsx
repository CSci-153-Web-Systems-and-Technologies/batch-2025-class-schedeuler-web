"use client";

import React from 'react';
import { Button } from '@/app/components/ui/Button';
import { Download, Printer, FileText } from 'lucide-react';
import { useSubjects } from '@/app/(authenticated)/student/subjects/SubjectContext';
import { EventType, CalendarEvent } from '@/types/calendar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DAYS_MAP = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDays = (days?: number[]) => {
    if (!days || days.length === 0) return 'One-time';
    return days.sort().map(d => DAYS_MAP[d]).join(', ');
};

const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const getScheduleData = (subjects: CalendarEvent[]) => {
    const classList = subjects.filter(s => s.type === EventType.SUBJECT);
    
    return classList.map(s => ({
        code: s.subjectCode || 'N/A',
        title: s.title,
        room: s.location || 'TBD',
        days: formatDays(s.repeatDays),
        time: `${formatTime(s.start)} - ${formatTime(s.end)}`
    }));
};

const ExportPanel: React.FC = () => {
    const { subjects } = useSubjects();

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        const data = getScheduleData(subjects);
        if (data.length === 0) {
            alert("No classes to export.");
            return;
        }

        const headers = ["Class Code", "Title", "Room", "Days", "Time"];
        const rows = data.map(row => 
            [row.code, row.title, row.room, `"${row.days}"`, row.time].join(",")
        );

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "instructor_schedule.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        const data = getScheduleData(subjects);
        if (data.length === 0) {
            alert("No classes to export.");
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Instructor Schedule", 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

        autoTable(doc, {
            startY: 35,
            head: [['Code', 'Class Name', 'Room', 'Days', 'Time']],
            body: data.map(row => [
                row.code,
                row.title,
                row.room,
                row.days,
                row.time
            ]),
            headStyles: { fillColor: [65, 105, 225] },
        });

        doc.save("instructor_schedule.pdf");
    };

    return (
        <div className="p-4 rounded-xl shadow-md" style={{ backgroundColor: 'var(--color-components-bg)' }}>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Export Schedule
            </h2>
            <div className="flex flex-col gap-2">
                <Button 
                    onClick={handleExportPDF}
                    variant="outline" 
                    size="sm" 
                    className="flex items-center justify-center gap-2 w-full border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]"
                >
                    <FileText size={16} />
                    Export as PDF
                </Button>
                <Button 
                    onClick={handleExportCSV}
                    variant="outline" 
                    size="sm" 
                    className="flex items-center justify-center gap-2 w-full border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]"
                >
                    <Download size={16} />
                    Export as CSV
                </Button>
                <Button 
                    onClick={handlePrint}
                    variant="outline" 
                    size="sm" 
                    className="flex items-center justify-center gap-2 w-full border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]"
                >
                    <Printer size={16} />
                    Print Schedule
                </Button>
            </div>
        </div>
    );
};

export default ExportPanel;