"use client";

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/app/context/ToastContext';
import { Loader2 } from 'lucide-react';

const JoinClassCard: React.FC<{ onJoinSuccess?: () => void }> = ({ onJoinSuccess }) => {
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const { showToast } = useToast();

  const handleJoin = async () => {
    if (!classCode.trim()) {
      showToast('Error', 'Please enter a class code', 'error');
      return;
    }
    
    setLoading(true);

    try {
      // 1. Find the class ID from the code
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, name')
        .eq('code', classCode.trim())
        .single();

      if (classError || !classData) {
        showToast('Error', 'Invalid Class Code. Please check and try again.', 'error');
        setLoading(false);
        return;
      }

      // 2. Get User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 3. Insert Enrollment
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert([{
          student_id: user.id,
          class_id: classData.id,
          status: 'pending'
        }]);

      if (enrollError) {
        if (enrollError.code === '23505') { // Duplicate key error
          showToast('Info', `You have already requested to join "${classData.name}"`, 'info');
        } else {
          console.error(enrollError);
          showToast('Error', 'Failed to join class.', 'error');
        }
      } else {
        showToast('Success', `Request sent to join "${classData.name}"`, 'success');
        setClassCode(''); // Clear input
        if (onJoinSuccess) onJoinSuccess(); // Refresh list
      }

    } catch (err) {
      console.error(err);
      showToast('Error', 'An unexpected error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="p-6 md:p-8 rounded-2xl shadow-sm border border-[var(--color-border)] mb-8"
      style={{ backgroundColor: 'var(--color-components-bg)' }}
    >
      <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
        + Join a Class
      </h2>
      <p className="mb-6 text-sm md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
        Enter the class code provided by your instructor
      </p>

      <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
        <input
          type="text"
          value={classCode}
          onChange={(e) => setClassCode(e.target.value.toUpperCase())}
          placeholder="Enter Class Code"
          className="flex-1 px-4 py-3 rounded-lg border text-base outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
          style={{ 
            backgroundColor: 'var(--color-bar-bg)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)'
          }}
        />
        <button
          onClick={handleJoin}
          disabled={loading}
          className="px-8 py-3 rounded-lg font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'JOIN'}
        </button>
      </div>
    </div>
  );
};

export default JoinClassCard;