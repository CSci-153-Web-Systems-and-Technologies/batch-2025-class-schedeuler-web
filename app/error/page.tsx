'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TriangleAlert, Home, LogOut } from 'lucide-react';
import { Button } from '@/app/components/ui/Button';
import { logout } from '@/app/(unauthenticated)/(auth)/actions';
import { createClient } from '@/utils/supabase/client';

export default function ErrorPage() {
    const router = useRouter();
    const [userRole, setUserRole] = useState<'student' | 'instructor' | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const checkRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('account_type')
                    .eq('id', user.id)
                    .single();
                
                if (profile?.account_type === 'student' || profile?.account_type === 'instructor') {
                    setUserRole(profile.account_type);
                }
            }
            setLoading(false);
        };
        checkRole();
    }, [supabase]);

    const handleGoHome = () => {
        if (userRole) {
            router.push(`/${userRole}/dashboard`);
        } else {
            router.push('/login');
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/landing?toast=logout');
    };

    const isDarkMode = document.documentElement.classList.contains('dark');

    return (
        <div 
            className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
            style={{ 
                backgroundColor: 'var(--color-main-bg)',
                color: 'var(--color-text-primary)'
            }}
        >
            <div 
                className="p-10 rounded-2xl border shadow-xl w-full max-w-lg"
                style={{ 
                    backgroundColor: 'var(--color-components-bg)',
                    borderColor: 'var(--color-border)'
                }}
            >
                <div className="mx-auto w-fit p-3 mb-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                    <TriangleAlert size={48} />
                </div>
                
                <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
                
                <p className="text-lg mb-8 text-[var(--color-text-secondary)]">
                    You attempted to access a page outside of your authorized role.
                </p>

                {loading ? (
                    <p className="text-sm">Verifying your role...</p>
                ) : (
                    <div className="space-y-4">
                        <p className="text-lg font-medium text-[var(--color-text-primary)]">
                            Your current role: <span className="font-extrabold capitalize text-red-600 dark:text-red-400">
                                {userRole || 'Unauthorized'}
                            </span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Button 
                                onClick={handleGoHome}
                                className="bg-[var(--color-primary)] text-white hover:opacity-90"
                            >
                                <Home size={18} className="mr-2" />
                                Go To My Dashboard
                            </Button>
                            <Button 
                                onClick={handleLogout}
                                variant="outline"
                                className="border-[var(--color-border)] text-red-600 hover:bg-red-50 hover:dark:bg-red-900/20"
                            >
                                <LogOut size={18} className="mr-2" />
                                Log Out
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}