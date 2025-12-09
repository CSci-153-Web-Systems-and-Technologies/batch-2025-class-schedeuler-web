// app/(authenticated)/instructor/classes/components/ProposalManager.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/app/context/ToastContext';
import { Button } from "@/app/components/ui/Button";
import { Vote, Check, X, AlertTriangle, Gavel } from 'lucide-react';
import { useSubjects } from '@/app/(authenticated)/student/subjects/SubjectContext';

interface Proposal {
    id: string;
    class_id: string;
    display_string: string;
    threshold_percent: number;
    status: 'pending' | 'applied' | 'cancelled';
    new_start_time: string;
    new_end_time: string;
    new_repeat_days: number[];
    classes: {
        name: string;
        subject_code: string;
    };
    votes_for: number;
    votes_total: number;
}

export default function ProposalManager() {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const { showToast } = useToast();
    const { refreshSubjects } = useSubjects();

    const fetchProposals = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: rawProposals, error } = await supabase
                .from('proposals')
                .select(`
                    *,
                    classes!inner (
                        id, name, subject_code, instructor_id
                    )
                `)
                .eq('classes.instructor_id', user.id)
                .eq('status', 'pending');

            if (error) throw error;

            const enhancedProposals: Proposal[] = [];

            for (const p of rawProposals || []) {
                const { count: yesVotes } = await supabase
                    .from('votes')
                    .select('*', { count: 'exact', head: true })
                    .eq('proposal_id', p.id)
                    .eq('vote', true);

                const { count: totalStudents } = await supabase
                    .from('enrollments')
                    .select('*', { count: 'exact', head: true })
                    .eq('class_id', p.class_id)
                    .eq('status', 'approved');

                enhancedProposals.push({
                    ...p,
                    votes_for: yesVotes || 0,
                    votes_total: totalStudents || 0
                });
            }

            setProposals(enhancedProposals);

        } catch (err) {
            console.error("Error fetching proposals:", err);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchProposals();

        const channel = supabase
            .channel('proposal_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => {
                fetchProposals();
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'proposals' }, () => {
                fetchProposals(); 
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [fetchProposals, supabase]);



    const handleFinalize = async (proposal: Proposal, force: boolean = false) => {
        const { error: classError } = await supabase
            .from('classes')
            .update({
                start_time: proposal.new_start_time,
                end_time: proposal.new_end_time,
                repeat_days: proposal.new_repeat_days,
                schedule_settings: { displayString: proposal.display_string }
            })
            .eq('id', proposal.class_id);

        if (classError) {
            showToast("Error", "Failed to update class schedule.", "error");
            return;
        }

        await supabase
            .from('proposals')
            .update({ status: 'applied' })
            .eq('id', proposal.id);

        const { data: enrollments } = await supabase
            .from('enrollments')
            .select('student_id')
            .eq('class_id', proposal.class_id)
            .eq('status', 'approved');

        if (enrollments && enrollments.length > 0) {
            const notifications = enrollments.map(e => ({
                user_id: e.student_id,
                title: 'Schedule Changed',
                message: `The schedule for ${proposal.classes.name} has been updated to: ${proposal.display_string}.`,
                type: 'info',
                link: '/student/classes',
                is_read: false
            }));

            await supabase.from('notifications').insert(notifications);
        }

        if (force) {
            showToast("Force Applied", "Schedule updated by instructor override.", "warning");
        } else {
            showToast("Success", "Proposal passed and schedule updated!", "success");
        }

        setProposals(prev => prev.filter(p => p.id !== proposal.id));
        refreshSubjects();
    };

    const handleCancel = async (id: string) => {
        const { error } = await supabase
            .from('proposals')
            .update({ status: 'cancelled' })
            .eq('id', id);

        if (!error) {
            showToast("Cancelled", "Proposal cancelled.", "info");
            setProposals(prev => prev.filter(p => p.id !== id));
        }
    };

    if (loading) return <div className="p-4 text-sm text-[var(--color-text-secondary)]">Loading active votes...</div>;
    if (proposals.length === 0) return null;

    return (
        <div className="mb-8 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--color-text-primary)]">
                <Vote className="text-[var(--color-primary)]" /> 
                Active Schedule Proposals
            </h2>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {proposals.map(p => {
                    const percentage = p.votes_total > 0 ? Math.round((p.votes_for / p.votes_total) * 100) : 0;
                    const passed = percentage >= p.threshold_percent;
                    const remaining = p.votes_total - p.votes_for;

                    return (
                        <div 
                            key={p.id} 
                            className="p-5 rounded-xl border border-[var(--color-border)] shadow-sm bg-[var(--color-components-bg)] flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-[var(--color-text-primary)]">{p.classes.subject_code}</h3>
                                        <p className="text-xs text-[var(--color-text-secondary)]">{p.classes.name}</p>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                        Voting Live
                                    </span>
                                </div>

                                <div className="mb-4 p-3 rounded-lg bg-[var(--color-hover)] border border-[var(--color-border)]">
                                    <p className="text-xs text-[var(--color-text-secondary)] uppercase font-bold mb-1">Proposed Change</p>
                                    <p className="text-sm font-semibold text-[var(--color-primary)]">{p.display_string}</p>
                                </div>

                                <div className="mb-1 flex justify-between text-xs font-medium text-[var(--color-text-primary)]">
                                    <span>Approval: {percentage}%</span>
                                    <span className="text-[var(--color-text-secondary)]">Target: {p.threshold_percent}%</span>
                                </div>
                                <div className="w-full h-2.5 bg-[var(--color-border)] rounded-full overflow-hidden mb-4 relative">
                                    <div 
                                        className={`h-full transition-all duration-500 ${passed ? 'bg-green-500' : 'bg-[var(--color-primary)]'}`} 
                                        style={{ width: `${percentage}%` }}
                                    />
                                    <div 
                                        className="absolute top-0 bottom-0 w-0.5 bg-black/30 dark:bg-white/50 z-10"
                                        style={{ left: `${p.threshold_percent}%` }}
                                    />
                                </div>
                                <p className="text-xs text-[var(--color-text-secondary)] mb-4 text-center">
                                    {p.votes_for} voted Yes out of {p.votes_total} students
                                </p>
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-[var(--color-border)]">
                                {passed ? (
                                    <Button 
                                        onClick={() => handleFinalize(p)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white h-9 text-xs"
                                    >
                                        <Check size={14} className="mr-1.5" /> Finalize
                                    </Button>
                                ) : (
                                    <Button 
                                        onClick={() => handleFinalize(p, true)}
                                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white h-9 text-xs"
                                        title="Override voting and apply immediately"
                                    >
                                        <Gavel size={14} className="mr-1.5" /> Force Apply
                                    </Button>
                                )}
                                
                                <Button 
                                    variant="outline"
                                    onClick={() => handleCancel(p.id)}
                                    className="h-9 text-xs border-[var(--color-border)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}