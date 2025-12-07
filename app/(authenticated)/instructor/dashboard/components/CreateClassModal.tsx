"use client";

import React, { useState } from 'react';
import { X, Copy, RefreshCw } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/app/context/ToastContext';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassCreated?: () => void; // Callback to refresh list
}

const COLOR_OPTIONS = ['#4169e1', '#52c41a', '#ff4d4f', '#faad14', '#8e44ad', '#2c3e50'];

export default function CreateClassModal({ isOpen, onClose, onClassCreated }: CreateClassModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: COLOR_OPTIONS[0],
  });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const { showToast } = useToast();

  // Helper: Generate random 6-char code
  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const [classCode, setClassCode] = useState(generateCode());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('classes')
      .insert([
        {
          instructor_id: user.id,
          name: formData.name,
          description: formData.description,
          color: formData.color,
          code: classCode,
        }
      ]);

    setLoading(false);

    if (error) {
      console.error(error);
      showToast('Error', 'Failed to create class. Code might be taken.', 'error');
    } else {
      showToast('Success', `Class "${formData.name}" created!`, 'success');
      if (onClassCreated) onClassCreated();
      onClose();
      // Reset form
      setFormData({ name: '', description: '', color: COLOR_OPTIONS[0] });
      setClassCode(generateCode());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-components-bg)] w-full max-w-lg rounded-2xl shadow-xl border border-[var(--color-border)] flex flex-col">
        
        <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Create New Class</h2>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Class Code Preview */}
          <div className="bg-[var(--color-hover)] p-4 rounded-xl flex items-center justify-between border border-[var(--color-primary)] border-dashed">
            <div>
              <p className="text-xs text-[var(--color-text-secondary)] uppercase font-bold tracking-wider">Class Code</p>
              <p className="text-2xl font-mono font-bold text-[var(--color-primary)] tracking-widest">{classCode}</p>
            </div>
            <button 
              type="button"
              onClick={() => setClassCode(generateCode())}
              className="p-2 hover:bg-[var(--color-border)] rounded-full transition-colors"
              title="Generate New Code"
            >
              <RefreshCw size={20} className="text-[var(--color-text-secondary)]" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Class Name</label>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Introduction to Computer Science"
                className="w-full px-4 py-2 rounded-lg bg-[var(--color-bar-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief summary of the course..."
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-[var(--color-bar-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Class Color</label>
              <div className="flex gap-3">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({...formData, color: c})}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${formData.color === c ? 'border-[var(--color-text-primary)] scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)] transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}