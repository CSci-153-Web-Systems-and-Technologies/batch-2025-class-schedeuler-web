// app/(authenticated)/student/dashboard/components/StudentVoteCard.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/app/context/ToastContext';
import { Button } from "@/components/ui/Button";
import { Vote, Check, X, Clock, AlertCircle } from 'lucide-react';

interface Proposal {
    id: string;
    class_id: string;
    display_string: string;
    classes: {
        name: string;
        subject_code: string;
    };
}

export default function StudentVoteCard() {
    const [pendingProposals, setPendingProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const { showToast } = useToast();

    const fetchProposals = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Get IDs of classes the student is enrolled in
            const { data: enrollments } = await supabase
                .from('enrollments')
                .select('class_id')
                .eq('student_id', user.id)
                .eq('status', 'approved');

            if (!enrollments || enrollments.length === 0) {
                setLoading(false);
                return;
            }

            const classIds = enrollments.map(e => e.class_id);

            // 2. Fetch Pending Proposals for these classes
            const { data: proposals, error } = await supabase
                .from('proposals')
                .select(`
                    id, class_id, display_string,
                    classes ( name, subject_code )
                `)
                .in('class_id', classIds)
                .eq('status', 'pending');

            if (error) throw error;

            // 3. Filter out proposals the user has ALREADY voted on
            const { data: myVotes } = await supabase
                .from('votes')
                .select('proposal_id')
                .eq('student_id', user.id);

            const votedProposalIds = new Set(myVotes?.map(v => v.proposal_id));
            
            const rawProposals = (proposals || []).filter(p => !votedProposalIds.has(p.id));

            // [FIX] Map the raw data to match the Interface (Handle Supabase array return)
            const formattedProposals: Proposal[] = rawProposals.map((p: any) => ({
                id: p.id,
                class_id: p.class_id,
                display_string: p.display_string,
                // Supabase returns an array for joins, we take the first item
                classes: Array.isArray(p.classes) ? p.classes[0] : p.classes
            }));

            setPendingProposals(formattedProposals);

        } catch (err) {
            console.error("Error fetching vote tasks:", err);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchProposals();

        // Realtime: Update if a new proposal is created
        const channel = supabase
            .channel('student_proposal_updates')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'proposals' }, () => {
                fetchProposals();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [fetchProposals, supabase]);

    const handleVote = async (proposalId: string, vote: boolean) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Optimistic UI update: Remove card immediately
        setPendingProposals(prev => prev.filter(p => p.id !== proposalId));

        const { error } = await supabase
            .from('votes')
            .insert({
                proposal_id: proposalId,
                student_id: user.id,
                vote: vote
            });

        if (error) {
            showToast("Error", "Vote failed to submit.", "error");
            fetchProposals(); // Revert on error
        } else {
            showToast("Voted", vote ? "You voted YES." : "You voted NO.", vote ? "success" : "info");
        }
    };

    if (loading || pendingProposals.length === 0) return null;

    return (
        <div className="mb-6 p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-full text-amber-700 dark:text-amber-200">
                    <Vote size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-amber-900 dark:text-amber-100 text-lg">Action Required</h3>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                        Instructors have proposed schedule changes. Please vote.
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {pendingProposals.map(proposal => (
                    <div 
                        key={proposal.id} 
                        className="bg-white dark:bg-[#16182C] p-4 rounded-xl border border-[var(--color-border)] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-[var(--color-text-primary)]">{proposal.classes.subject_code}</span>
                                <span className="text-xs text-[var(--color-text-secondary)] hidden sm:inline">•</span>
                                <span className="text-xs text-[var(--color-text-secondary)]">{proposal.classes.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 text-sm font-semibold text-[var(--color-primary)]">
                                <Clock size={14} />
                                {proposal.display_string}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button 
                                onClick={() => handleVote(proposal.id, false)}
                                variant="outline"
                                className="border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-900/20 text-xs h-9"
                            >
                                <X size={14} className="mr-1.5" /> No
                            </Button>
                            <Button 
                                onClick={() => handleVote(proposal.id, true)}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs h-9"
                            >
                                <Check size={14} className="mr-1.5" /> Yes, I can
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}