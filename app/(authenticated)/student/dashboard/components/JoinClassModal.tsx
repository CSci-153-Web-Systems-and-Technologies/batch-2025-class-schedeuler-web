"use client";

import React, { useState } from 'react';
import { X, Search, Loader2, ShieldAlert } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/app/context/ToastContext';

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinClassModal({ isOpen, onClose }: JoinClassModalProps) {
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundClass, setFoundClass] = useState<any | null>(null);
  const supabase = createClient();
  const { showToast } = useToast();

  const handleSearch = async () => {
    if (!classCode.trim()) return;
    setLoading(true);
    setFoundClass(null);

    const { data, error } = await supabase
      .from('classes')
      .select('id, name, instructor_id, profiles(name)') 
      .eq('code', classCode.trim())
      .single();

    setLoading(false);

    if (error || !data) {
      showToast('Error', 'Class not found. Check the code.', 'error');
    } else {
      setFoundClass(data);
    }
  };

  const handleJoin = async () => {
    if (!foundClass) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('enrollments')
      .insert([
        {
          student_id: user.id,
          class_id: foundClass.id,
          status: 'pending' 
        }
      ]);

    setLoading(false);

    if (error) {
      if (error.code === '23505') { 
        showToast('Info', 'You have already requested to join this class.', 'info');
      } else {
        showToast('Error', 'Failed to join class.', 'error');
      }
    } else {
      showToast('Success', 'Request sent! Waiting for approval.', 'success');
      onClose();
      setClassCode('');
      setFoundClass(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-components-bg)] w-full max-w-md rounded-2xl shadow-xl border border-[var(--color-border)] flex flex-col overflow-hidden">
        
        <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Join a Class</h2>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">Class Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                placeholder="e.g. WEB-123"
                className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-bar-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <button
                onClick={handleSearch}
                disabled={loading || !classCode}
                className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
              </button>
            </div>
          </div>

          {foundClass && (
            <div className="bg-[var(--color-hover)] p-4 rounded-xl border border-[var(--color-border)]">
              <h3 className="font-bold text-lg text-[var(--color-text-primary)]">{foundClass.name}</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Instructor: {Array.isArray(foundClass.profiles) ? foundClass.profiles[0]?.name : foundClass.profiles?.name || 'Unknown'}
              </p>
              
              {/* [NEW] Privacy Notice in Modal */}
              <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-xs text-blue-800 dark:text-blue-300">
                <ShieldAlert size={14} className="mt-0.5 flex-shrink-0" />
                <p>
                  <span className="font-bold">Privacy Note:</span> Joining this class allows the instructor to view your schedule for conflict detection.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                <button
                  onClick={handleJoin}
                  disabled={loading}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Sending Request...' : 'Send Join Request'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}