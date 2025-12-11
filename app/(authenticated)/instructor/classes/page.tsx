"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import dynamic from "next/dynamic";
import { 
  Search, Filter, MoreHorizontal, BookOpen, Users, AlertCircle, 
  Calendar, MapPin, Edit, Clock, Trash2, Plus, Copy, ChevronRight
} from "lucide-react";
import AppBreadcrumb from "@/app/components/ui/AppBreadCrumb";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Badge } from "@/app/components/ui/Badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/app/components/ui/Table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from "@/app/components/ui/Dropdown-menu";
import { useToast } from "@/app/context/ToastContext";
import { useThemeContext } from "@/app/(authenticated)/components/ThemeContext";
import { useSubjects } from "@/app/(authenticated)/student/subjects/SubjectContext";

// Lazy load heavy modals and components
const CreateClassModal = dynamic(() => import("../dashboard/components/CreateClassModal"), { ssr: false });
const EditClassModal = dynamic(() => import("./components/EditClassModal"), { ssr: false });
const ViewStudentsModal = dynamic(() => import("./components/ViewStudentsModal"), { ssr: false });
const SuggestTimeModal = dynamic(() => import("./components/SuggestTimeModal"), { ssr: false });
const ProposalManager = dynamic(() => import("./components/ProposalManager"), { ssr: false });

interface ClassItem {
  id: string;
  name: string;
  code: string; 
  subjectCode?: string; 
  schedule: string;
  startTime?: string;
  endTime?: string;
  repeatDays?: number[];
  repeatUntil?: string; 
  location: string;
  enrolled: number;
  capacity: number;
  type: "Lecture" | "Lab";
  status: "Active" | "Conflict" | "Archived"; 
  description?: string;
  color?: string;
  conflictingStudents: number;
}

const DAYS_MAP = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getBadgeStyle = (type: string, isDark: boolean = false) => {
  if (isDark) {
      switch (type) {
        case 'Lecture': return { backgroundColor: 'rgba(59, 130, 246, 0.3)', color: '#93C5FD', border: '1px solid transparent' }; 
        case 'Lab': return { backgroundColor: 'rgba(192, 132, 252, 0.3)', color: '#D8B4FE', border: '1px solid transparent' }; 
        case 'Active': return { backgroundColor: 'rgba(20, 83, 45, 0.3)', color: '#4ade80', border: '1px solid transparent' }; 
        case 'Conflict': return { backgroundColor: 'rgba(127, 29, 29, 0.3)', color: '#f87171', border: '1px solid transparent' }; 
        case 'Archived': return { backgroundColor: 'rgba(55, 65, 81, 0.3)', color: '#9CA3AF', border: '1px solid transparent' }; 
        default: return { backgroundColor: '#374151', color: '#9CA3AF' };
      }
  } else {
      switch (type) {
        case 'Lecture': return { backgroundColor: '#DBEAFE', color: '#1E40AF', border: '1px solid #BFDBFE' }; 
        case 'Lab': return { backgroundColor: '#F3E8FF', color: '#6B21A8', border: '1px solid #E9D5FF' }; 
        case 'Active': return { backgroundColor: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0' }; 
        case 'Conflict': return { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' }; 
        case 'Archived': return { backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }; 
        default: return { backgroundColor: '#F3F4F6', color: '#374151', border: 'none' };
      }
  }
};

export default function InstructorClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("All");
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewStudentsModalOpen, setIsViewStudentsModalOpen] = useState(false);
  const [isSuggestTimeModalOpen, setIsSuggestTimeModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    conflicts: 0
  });

  const supabase = createClient();
  const { showToast } = useToast();
  const { theme } = useThemeContext();
  
  const { refreshSubjects } = useSubjects();

  const fetchClasses = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
        const { data: classesData, error } = await supabase
        .from("classes")
        .select("id, name, code, subject_code, location, start_time, end_time, repeat_days, repeat_until, description, color, class_type, status")
        .eq("instructor_id", user.id);

        if (error) throw error;

        const safeClasses = classesData || [];
        const classIds = safeClasses.map(c => c.id);
        
        let enrollmentDetails: Record<string, { count: number, conflicts: number }> = {};
        let totalStudentsCount = 0;
        let totalConflictCount = 0; 

        if (classIds.length > 0) {
            const { data: enrollments } = await supabase
                .from('enrollments')
                .select('class_id, conflict_report')
                .in('class_id', classIds)
                .eq('status', 'approved');
            
            enrollments?.forEach(e => {
                const classId = e.class_id;
                const hasConflict = e.conflict_report && Array.isArray(e.conflict_report) && e.conflict_report.length > 0;
                
                enrollmentDetails[classId] = enrollmentDetails[classId] || { count: 0, conflicts: 0 };
                enrollmentDetails[classId].count++;
                if (hasConflict) {
                    enrollmentDetails[classId].conflicts++;
                    totalConflictCount++; 
                }
            });
        }

        const items: ClassItem[] = [];
        
        for (const cls of safeClasses) {
            const classEnrollmentStats = enrollmentDetails[cls.id] || { count: 0, conflicts: 0 };
            const enrolledCount = classEnrollmentStats.count;
            
            totalStudentsCount += enrolledCount;

            let scheduleStr = "Schedule TBD";
            if (cls.repeat_days && cls.repeat_days.length > 0 && cls.start_time && cls.end_time) {
                const days = cls.repeat_days.sort().map((d: number) => DAYS_MAP[d]).join(', ');
                const tStart = cls.start_time.slice(0, 5); 
                const tEnd = cls.end_time.slice(0, 5);
                scheduleStr = `${days} ${tStart} - ${tEnd}`;
            }
            
            items.push({
                id: cls.id,
                name: cls.name,
                code: cls.code,
                subjectCode: cls.subject_code, 
                schedule: scheduleStr,
                startTime: cls.start_time,
                endTime: cls.end_time,
                repeatDays: cls.repeat_days,
                repeatUntil: cls.repeat_until,
                location: cls.location || "TBD",
                enrolled: enrolledCount,
                capacity: 50, 
                type: (cls.class_type === 'Lab' ? 'Lab' : 'Lecture'), 
                status: classEnrollmentStats.conflicts > 0 ? "Conflict" : (cls.status as any) || "Active", 
                description: cls.description,
                color: cls.color,
                conflictingStudents: classEnrollmentStats.conflicts
            });
        }

        setClasses(items);
        setStats({
            totalClasses: items.length,
            totalStudents: totalStudentsCount,
            conflicts: totalConflictCount
        });

    } catch (error: any) {
        console.error("Error fetching classes:", error);
        if (error.code !== 'PGRST116') {
            showToast("Error", "Failed to load classes.", "error");
        }
    } finally {
        setLoading(false);
    }
  }, [supabase, showToast]);


  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    let channel: any;
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('instructor_classes_list_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'classes', filter: `instructor_id=eq.${user.id}` },
          () => fetchClasses()
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'enrollments' },
          () => fetchClasses()
        )
        .subscribe();
    };
    setupRealtime();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase, fetchClasses]);

  const handleDataChange = () => {
      fetchClasses(); 
      refreshSubjects(); 
  };

  const handleDeleteClass = async (id: string) => {
    if(!confirm("Are you sure you want to delete this class?")) return;
    
    setClasses(prev => prev.filter(c => c.id !== id));

    const { error } = await supabase.from("classes").delete().eq("id", id);
    if(error) {
        showToast("Error", "Failed to delete class", "error");
        fetchClasses();
    }
    else { 
        showToast("Success", "Class deleted", "success"); 
        refreshSubjects(); 
    }
  };

  const handleArchiveClass = async (cls: ClassItem) => {
    const newStatus = cls.status === 'Archived' ? 'Active' : 'Archived';
    
    setClasses(prev => prev.map(c => c.id === cls.id ? { ...c, status: newStatus } : c));

    const { error } = await supabase.from('classes').update({ status: newStatus }).eq('id', cls.id);
    
    if (error) {
        showToast("Error", "Failed to update status", "error");
        setClasses(prev => prev.map(c => c.id === cls.id ? { ...c, status: cls.status } : c));
    } else { 
        showToast("Success", `Class ${newStatus === 'Active' ? 'restored' : 'archived'}`, "success"); 
        refreshSubjects();
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast("Copied", `Join code ${code} copied to clipboard`, "success");
  };

  const handleEditClick = (cls: ClassItem) => { setSelectedClass(cls); setIsEditModalOpen(true); };
  const handleSuggestTimeClick = (cls: ClassItem) => { setSelectedClass(cls); setIsSuggestTimeModalOpen(true); };
  const handleViewStudentsClick = (cls: ClassItem) => { setSelectedClass(cls); setIsViewStudentsModalOpen(true); };

  const filteredClasses = classes.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.subjectCode && c.subjectCode.toLowerCase().includes(searchQuery.toLowerCase())); 
    const matchesType = filterType === "All" || c.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTextColor = (variant: 'primary' | 'secondary') => {
    if (theme === 'dark') {
      return variant === 'primary' ? '#FFFFFF' : '#9CA3AF'; 
    }
    return variant === 'primary' ? '#111827' : '#6B7280'; 
  };
  
  const isDark = theme === 'dark';

  const ClassActions = ({ cls }: { cls: ClassItem }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[var(--color-hover)]" style={{ color: 'var(--color-text-secondary)' }}><MoreHorizontal size={16} /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
            align="end" 
            className={`w-48 border-[var(--color-border)] ${theme === 'dark' ? 'authenticated dark' : 'authenticated'}`} 
            style={{ backgroundColor: 'var(--color-components-bg)' }}
        >
            <DropdownMenuLabel style={{ color: 'var(--color-text-primary)' }}>Actions</DropdownMenuLabel>
            
            <DropdownMenuItem 
                className="cursor-pointer focus:bg-[var(--color-hover)] outline-none" 
                style={{ color: 'var(--color-text-primary)' }}
                onClick={() => handleCopyCode(cls.code)}
            >
                <Copy size={14} className="mr-2"/> Copy Join Code
            </DropdownMenuItem>

            <DropdownMenuItem 
                className="cursor-pointer focus:bg-[var(--color-hover)] outline-none" 
                style={{ color: 'var(--color-text-primary)' }}
                onClick={() => handleEditClick(cls)}
            >
                <Edit size={14} className="mr-2"/> Edit Class
            </DropdownMenuItem>
            
            <DropdownMenuItem 
                className="cursor-pointer focus:bg-[var(--color-hover)] outline-none" 
                style={{ color: 'var(--color-text-primary)' }}
                onClick={() => handleSuggestTimeClick(cls)}
            >
                <Clock size={14} className="mr-2"/> Manage Schedule
            </DropdownMenuItem>
            
            <DropdownMenuItem 
                className="cursor-pointer focus:bg-[var(--color-hover)] outline-none" 
                style={{ color: 'var(--color-text-primary)' }}
                onClick={() => handleViewStudentsClick(cls)}
            >
                <Users size={14} className="mr-2"/> View Students
            </DropdownMenuItem>
            
            <DropdownMenuItem 
                className="cursor-pointer focus:bg-[var(--color-hover)] outline-none" 
                style={{ color: 'var(--color-text-primary)' }}
                onClick={() => handleArchiveClass(cls)}
            >
                <AlertCircle size={14} className="mr-2"/> {cls.status === 'Archived' ? 'Restore' : 'Archive'}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-[var(--color-border)]" />
            
            <DropdownMenuItem 
                className="text-red-600 cursor-pointer focus:bg-red-50 dark:focus:bg-red-900/10 outline-none" 
                onClick={() => handleDeleteClass(cls.id)}
            >
                <Trash2 size={14} className="mr-2"/> Delete Class
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--color-main-bg)" }}>
      <AppBreadcrumb />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>Manage Classes</h1>
            <p style={{ color: "var(--color-text-secondary)" }}>Manage your courses and track student enrollment</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#4169E1] hover:bg-[#3557C5] text-white gap-2 rounded-lg">
          <Plus size={18} /> Add New Class
        </Button>
      </div>
      
      <ProposalManager />

      <div 
        className="p-4 rounded-xl shadow-sm border border-[var(--color-border)] mb-6 flex flex-col sm:flex-row gap-4"
        style={{ backgroundColor: 'var(--color-components-bg)' }}
      >
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-secondary)' }} size={18} />
            <Input 
                placeholder="Search by course number or name..." 
                className="pl-10 border-[var(--color-border)]"
                style={{ backgroundColor: 'var(--color-bar-bg)', color: 'var(--color-text-primary)' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 border-[var(--color-border)] hover:bg-[var(--color-hover)]" style={{ color: 'var(--color-text-primary)' }}>
                <Filter size={18} /> {filterType === 'All' ? 'Filter by type' : filterType}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={`w-48 ${theme === 'dark' ? 'authenticated dark' : 'authenticated'}`} style={{ backgroundColor: 'var(--color-components-bg)', borderColor: 'var(--color-border)' }}>
            <DropdownMenuLabel style={{ color: 'var(--color-text-primary)' }}>Class Type</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[var(--color-border)]" />
            <DropdownMenuRadioGroup value={filterType} onValueChange={setFilterType}>
              <DropdownMenuRadioItem className="cursor-pointer focus:bg-[var(--color-hover)] outline-none" style={{ color: 'var(--color-text-primary)' }} value="All">All Types</DropdownMenuRadioItem>
              <DropdownMenuRadioItem className="cursor-pointer focus:bg-[var(--color-hover)] outline-none" style={{ color: 'var(--color-text-primary)' }} value="Lecture">Lecture</DropdownMenuRadioItem>
              <DropdownMenuRadioItem className="cursor-pointer focus:bg-[var(--color-hover)] outline-none" style={{ color: 'var(--color-text-primary)' }} value="Lab">Lab</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden mb-8">
        {loading ? (
             <div className="col-span-full text-center py-8 text-[var(--color-text-secondary)]">Loading classes...</div>
        ) : filteredClasses.length === 0 ? (
             <div className="col-span-full text-center py-8 text-[var(--color-text-secondary)]">No classes found.</div>
        ) : (
            filteredClasses.map(cls => (
                <div 
                    key={cls.id} 
                    className="p-4 rounded-xl border border-[var(--color-border)] shadow-sm bg-[var(--color-components-bg)] flex flex-col gap-3 relative"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg text-[var(--color-text-primary)]">{cls.subjectCode || cls.code}</h3>
                            <p className="text-sm text-[var(--color-text-secondary)]">{cls.name}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <ClassActions cls={cls} />
                        </div>
                    </div>

                    <div className="flex gap-2 flex-wrap mt-1">
                        <Badge style={getBadgeStyle(cls.type, isDark)}>{cls.type}</Badge>
                        <Badge style={getBadgeStyle(cls.status, isDark)}>{cls.status}</Badge>
                        {cls.conflictingStudents > 0 && (
                            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-transparent">
                                {cls.conflictingStudents} Conflicts
                            </Badge>
                        )}
                    </div>

                    <div className="space-y-2 mt-2 text-sm text-[var(--color-text-secondary)]">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-[var(--color-primary)]" />
                            <span>{cls.schedule}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-[var(--color-primary)]" />
                            <span>{cls.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users size={14} className="text-[var(--color-primary)]" />
                            <span className={cls.enrolled >= cls.capacity ? "text-amber-600 font-bold" : ""}>
                                {cls.enrolled} / {cls.capacity} Enrolled
                            </span>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>

      <div className="hidden md:block rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden mb-8" style={{ backgroundColor: 'var(--color-components-bg)' }}>
        <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
            <h2 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Classes ({filteredClasses.length})</h2>
        </div>

        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent border-[var(--color-border)]">
                    <TableHead className="w-[250px] pl-6" style={{ color: 'var(--color-text-primary)' }}>Course</TableHead>
                    <TableHead style={{ color: 'var(--color-text-primary)' }}>Schedule</TableHead>
                    <TableHead style={{ color: 'var(--color-text-primary)' }}>Location</TableHead>
                    <TableHead style={{ color: 'var(--color-text-primary)' }}>Enrollment</TableHead>
                    <TableHead style={{ color: 'var(--color-text-primary)' }}>Type</TableHead>
                    <TableHead style={{ color: 'var(--color-text-primary)' }}>Status</TableHead>
                    <TableHead className="text-right pr-6" style={{ color: 'var(--color-text-primary)' }}>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={7} className="h-24 text-center" style={{ color: 'var(--color-text-secondary)' }}>Loading classes...</TableCell></TableRow>
                ) : filteredClasses.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="h-24 text-center" style={{ color: 'var(--color-text-secondary)' }}>No classes found.</TableCell></TableRow>
                ) : (
                    filteredClasses.map((cls) => (
                        <TableRow key={cls.id} className="border-[var(--color-border)] hover:bg-[var(--color-hover)]">
                            <TableCell className="pl-6">
                                <div>
                                    <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{cls.subjectCode || cls.code}</p>
                                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{cls.name}</p>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                    <Calendar size={14} style={{ color: 'var(--color-text-secondary)' }} />
                                    <span className="whitespace-nowrap">{cls.schedule}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                    <MapPin size={14} style={{ color: 'var(--color-text-secondary)' }} />
                                    {cls.location}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2 text-sm">
                                    <Users size={14} style={{ color: 'var(--color-text-secondary)' }} />
                                    <span className={cls.enrolled >= cls.capacity ? "text-amber-600 font-bold" : ""} style={cls.enrolled < cls.capacity ? { color: 'var(--color-text-primary)' } : {}}>
                                        {cls.enrolled}/{cls.capacity}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge style={getBadgeStyle(cls.type, isDark)}>
                                    {cls.type}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge style={getBadgeStyle(cls.status, isDark)}>
                                    {cls.status}
                                </Badge>
                                {cls.conflictingStudents > 0 && (
                                    <p className="text-xs text-red-500 dark:text-red-400 font-medium mt-1" title={`${cls.conflictingStudents} approved student(s) have conflicts.`}>
                                        ({cls.conflictingStudents} Conflict{cls.conflictingStudents > 1 ? 's' : ''})
                                    </p>
                                )}
                            </TableCell>
                            <TableCell className="text-right pr-6">
                                <ClassActions cls={cls} />
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
            className="p-6 rounded-2xl shadow-sm border border-[var(--color-border)] flex items-center gap-5"
            style={{ backgroundColor: 'var(--color-components-bg)' }}
        >
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><BookOpen size={24} /></div>
            <div>
                <h3 className="text-2xl font-bold" style={{ color: getTextColor('primary') }}>{stats.totalClasses}</h3>
                <p className="text-sm" style={{ color: getTextColor('secondary') }}>Total Classes</p>
            </div>
        </div>

        <div 
            className="p-6 rounded-2xl shadow-sm border border-[var(--color-border)] flex items-center gap-5"
            style={{ backgroundColor: 'var(--color-components-bg)' }}
        >
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600"><Users size={24} /></div>
            <div>
                <h3 className="text-2xl font-bold" style={{ color: getTextColor('primary') }}>{stats.totalStudents}</h3>
                <p className="text-sm" style={{ color: getTextColor('secondary') }}>Total Students</p>
            </div>
        </div>

        <div 
            className="p-6 rounded-2xl shadow-sm border border-[var(--color-border)] flex items-center gap-5"
            style={{ backgroundColor: 'var(--color-components-bg)' }}
        >
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600"><AlertCircle size={24} /></div>
            <div>
                <h3 className="text-2xl font-bold" style={{ color: getTextColor('primary') }}>{stats.conflicts}</h3>
                <p className="text-sm" style={{ color: getTextColor('secondary') }}>Student Conflicts</p>
            </div>
        </div>
      </div>

      {isCreateModalOpen && <CreateClassModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onClassCreated={handleDataChange} />}
      {isEditModalOpen && <EditClassModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} classData={selectedClass} onClassUpdated={handleDataChange} />}
      {isViewStudentsModalOpen && <ViewStudentsModal isOpen={isViewStudentsModalOpen} onClose={() => setIsViewStudentsModalOpen(false)} classId={selectedClass?.id || ''} className={selectedClass?.name || ''} onStatusChange={handleDataChange} />}
      {isSuggestTimeModalOpen && <SuggestTimeModal isOpen={isSuggestTimeModalOpen} onClose={() => setIsSuggestTimeModalOpen(false)} classData={selectedClass} onScheduleUpdated={handleDataChange} />}
    </div>
  );
}