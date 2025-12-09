// app/error/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Home, LogOut, ArrowLeft } from 'lucide-react';
import { Button } from '@/app/components/ui/Button';
import { logout } from '@/app/(unauthenticated)/(auth)/actions';
import { createClient } from '@/utils/supabase/client';
import { ThemeProvider, useThemeContext } from '@/app/(authenticated)/components/ThemeContext';

function ErrorPageContent() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<'student' | 'instructor' | null>(null);
    const supabase = createClient();
    
    const { theme } = useThemeContext();
    const isDark = theme === 'dark';

    const [isPrimaryHovered, setIsPrimaryHovered] = useState(false);
    const [isSecondaryHovered, setIsSecondaryHovered] = useState(false);
    const [isLogoutHovered, setIsLogoutHovered] = useState(false);

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

    return (
        <div 
            className={`min-h-screen flex flex-col items-center justify-center p-8 text-center transition-colors duration-200 ${isDark ? 'authenticated dark' : 'authenticated'}`}
            style={{ 
                backgroundColor: 'var(--color-main-bg)', 
                color: 'var(--color-text-primary)'
            }}
        >
            <div 
                className="p-12 rounded-2xl border shadow-xl w-full max-w-lg flex flex-col items-center"
                style={{ 
                    backgroundColor: 'var(--color-components-bg)', 
                    borderColor: 'var(--color-border)'
                }}
            >
                <div 
                    className="w-fit p-4 mb-6 rounded-full"
                    style={{
                        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2', 
                        color: isDark ? '#F87171' : '#DC2626' 
                    }}
                >
                    <ShieldAlert size={64} strokeWidth={1.5} />
                </div>
                
                <h1 
                    className="text-6xl font-extrabold mb-2" 
                    style={{ color: isDark ? '#F87171' : '#DC2626' }}
                >
                    403
                </h1>
                <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                
                <p className="text-base mb-8 max-w-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    You do not have permission to view this page. Please return to your dashboard or log in with a different account.
                </p>

                {loading ? (
                    <p className="text-sm animate-pulse" style={{ color: 'var(--color-text-secondary)' }}>Checking permissions...</p>
                ) : (
                    <div className="flex flex-col w-full gap-3">
                        
                        <Button 
                            onClick={handleGoHome}
                            onMouseEnter={() => setIsPrimaryHovered(true)}
                            onMouseLeave={() => setIsPrimaryHovered(false)}
                            className="w-full py-6 text-base shadow-lg transition-all"
                            style={{ 
                                backgroundColor: 'var(--color-primary)', 
                                color: '#ffffff',
                                border: 'none',
                                opacity: isPrimaryHovered ? 0.9 : 1,
                                transform: isPrimaryHovered ? 'scale(1.02)' : 'scale(1)'
                            }}
                        >
                            <Home size={18} className="mr-2" />
                            Return to Dashboard
                        </Button>
                        
                        <div className="flex gap-3 mt-2">
                            <Button 
                                onClick={() => router.back()}
                                onMouseEnter={() => setIsSecondaryHovered(true)}
                                onMouseLeave={() => setIsSecondaryHovered(false)}
                                variant="outline"
                                className="flex-1 transition-colors"
                                style={{ 
                                    backgroundColor: isSecondaryHovered ? 'var(--color-hover)' : 'transparent',
                                    borderColor: 'var(--color-border)',
                                    color: 'var(--color-text-primary)'
                                }}
                            >
                                <ArrowLeft size={18} className="mr-2" />
                                Go Back
                            </Button>
                            
                            <Button 
                                onClick={handleLogout}
                                onMouseEnter={() => setIsLogoutHovered(true)}
                                onMouseLeave={() => setIsLogoutHovered(false)}
                                variant="outline"
                                className="flex-1 transition-colors"
                                style={{ 
                                    backgroundColor: isLogoutHovered ? (isDark ? 'rgba(127, 29, 29, 0.2)' : '#FEF2F2') : 'transparent',
                                    borderColor: 'var(--color-border)',
                                    color: '#EF4444'
                                }}
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

export default function ErrorPage() {
    return (
        <ThemeProvider>
            <ErrorPageContent />
        </ThemeProvider>
    );
}