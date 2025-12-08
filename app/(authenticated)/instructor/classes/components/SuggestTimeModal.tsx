// app/(authenticated)/instructor/classes/components/SuggestTimeModal.tsx
"use client";

import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/app/context/ToastContext';
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";

interface SuggestTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: any;
  onScheduleUpdated: () => void;
}

export default function SuggestTimeModal({ isOpen, onClose, classData, onScheduleUpdated }: SuggestTimeModalProps) {
  const [scheduleText, setScheduleText] = useState(classData?.schedule || '');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const { showToast } = useToast();

  const handleUpdate = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('classes')
      .update({
        schedule_settings: { displayString: scheduleText } 
      })
      .eq('id', classData.id);

    setLoading(false);

    if (error) {
      showToast('Error', 'Failed to update schedule.', 'error');
    } else {
      showToast('Success', 'Schedule updated.', 'success');
      onScheduleUpdated();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-components-bg)] w-full max-w-md rounded-2xl shadow-xl border border-[var(--color-border)] p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Clock size={20} /> Manage Schedule
          </h2>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-[var(--color-text-primary)]">Current Schedule Display</Label>
            <Input 
              value={scheduleText}
              onChange={(e) => setScheduleText(e.target.value)}
              placeholder="e.g. Mon, Wed 10:00 AM - 11:30 AM"
              className="mt-1 bg-[var(--color-bar-bg)] text-[var(--color-text-primary)]"
            />
            <p className="text-xs text-[var(--color-text-secondary)] mt-2">
              Enter the schedule as you want it to appear to students.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="text-[var(--color-text-primary)]">Cancel</Button>
            <Button onClick={handleUpdate} disabled={loading} className="bg-[var(--color-primary)] text-white">
              {loading ? 'Saving...' : 'Update Schedule'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}