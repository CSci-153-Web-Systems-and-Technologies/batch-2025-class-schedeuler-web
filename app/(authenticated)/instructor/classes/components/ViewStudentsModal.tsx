"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { X, Loader2, User, Check, Ban } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/Avatar";
import { Badge } from "@/app/components/ui/Badge";
import { useToast } from '@/app/context/ToastContext';
import { useThemeContext } from "@/app/(authenticated)/components/ThemeContext";

interface ViewStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
  // [NEW] Callback to notify parent (InstructorClassesPage) to refresh stats
  onStatusChange?: () => void; 
}

interface StudentEnrollment {
  enrollment_id: string;
  student_id: string;
  name: string;
  email: string;
  avatar_url: string;
  status: 'pending' | 'approved' | 'rejected';
  enrolled_at: string;
}

export default function ViewStudentsModal({ isOpen, onClose, classId, className, onStatusChange }: ViewStudentsModalProps) {
  const [students, setStudents] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const supabase = createClient();
  const { showToast } = useToast();
  const { theme } = useThemeContext();

  const fetchStudents = useCallback(async () => {
    if (!classId) return;
    setLoading(true);

    try {
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('class_id', classId)
        .order('enrolled_at', { ascending: false });

      if (enrollError) throw enrollError;
      if (!enrollments || enrollments.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      const studentIds = enrollments.map(e => e.student_id);
      
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .in('id', studentIds);

      if (profileError) throw profileError;

      const mergedData: StudentEnrollment[] = enrollments.map(enrollment => {
        const profile = profiles?.find(p => p.id === enrollment.student_id);
        return {
          enrollment_id: enrollment.id,
          student_id: enrollment.student_id,
          name: profile?.name || 'Unknown Student',
          email: profile?.email || 'No email',
          avatar_url: profile?.avatar_url || '',
          status: enrollment.status,
          enrolled_at: enrollment.enrolled_at
        };
      });

      setStudents(mergedData);

    } catch (error) {
      console.error("Error fetching students:", error);
      showToast("Error", "Failed to load student list", "error");
    } finally {
      setLoading(false);
    }
  }, [classId, supabase, showToast]);

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
    }
  }, [isOpen, fetchStudents]);

  const updateStatus = async (enrollmentId: string, newStatus: 'approved' | 'rejected') => {
    setProcessingId(enrollmentId);
    
    const { error } = await supabase
      .from('enrollments')
      .update({ status: newStatus })
      .eq('id', enrollmentId);

    setProcessingId(null);

    if (error) {
      showToast("Error", "Failed to update status", "error");
    } else {
      showToast("Success", `Student ${newStatus}`, "success");
      
      // Optimistic update locally
      setStudents(prev => prev.map(s => 
        s.enrollment_id === enrollmentId ? { ...s, status: newStatus } : s
      ));

      // [NEW] Notify parent page to refresh "Total Students" or "Enrolled" counts
      if (onStatusChange) {
        onStatusChange();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-components-bg)] w-full max-w-2xl rounded-2xl shadow-xl border border-[var(--color-border)] flex flex-col max-h-[85vh]">
        
        <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Student Roster</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">{className}</p>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-10 text-[var(--color-text-secondary)]">
              <p className="text-lg font-medium">No students yet.</p>
              <p className="text-sm">Share the class code to invite students!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <div 
                  key={student.enrollment_id} 
                  className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bar-bg)]"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={student.avatar_url} />
                      <AvatarFallback><User size={16} /></AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-[var(--color-text-primary)]">{student.name}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{student.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {student.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(student.enrollment_id, 'approved')}
                          disabled={!!processingId}
                          className="p-1.5 rounded-full bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 transition-colors"
                          title="Approve"
                        >
                          {processingId === student.enrollment_id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        </button>
                        <button
                          onClick={() => updateStatus(student.enrollment_id, 'rejected')}
                          disabled={!!processingId}
                          className="p-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                          title="Reject"
                        >
                          <Ban size={16} />
                        </button>
                      </div>
                    ) : (
                      <Badge 
                        variant="secondary" 
                        className="capitalize"
                        style={{
                          backgroundColor: theme === 'dark' 
                            ? (student.status === 'approved' ? 'rgba(20, 83, 45, 0.3)' : 'rgba(127, 29, 29, 0.3)')
                            : (student.status === 'approved' ? '#DCFCE7' : '#FEE2E2'),
                          color: theme === 'dark'
                            ? (student.status === 'approved' ? '#4ade80' : '#f87171')
                            : (student.status === 'approved' ? '#166534' : '#991B1B')
                        }}
                      >
                        {student.status}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}