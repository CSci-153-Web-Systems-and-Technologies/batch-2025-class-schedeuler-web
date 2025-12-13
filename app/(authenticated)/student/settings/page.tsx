// app/(authenticated)/student/settings/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import AppBreadcrumb from '@/app/components/ui/AppBreadCrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/Card";
import { Label } from "@/app/components/ui/Label";
import { Switch } from "@/app/components/ui/Switch"; 
import { useThemeContext } from '@/app/(authenticated)/components/ThemeContext';
import { useUser } from '@/app/context/UserContext'; 
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/app/context/ToastContext';
import { Moon, Sun, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { theme, toggleTheme } = useThemeContext();
  const { profile, refreshProfile } = useUser();
  const supabase = createClient();
  const { showToast } = useToast();

  const [taskReminders, setTaskReminders] = useState(true);
  const [classAlerts, setClassAlerts] = useState(true);

  useEffect(() => {
    if (profile) {
      setTaskReminders(profile.notify_task_reminders ?? true);
      setClassAlerts(profile.notify_class_alerts ?? true);
    }
  }, [profile]);

  const handleToggleSetting = async (key: 'notify_task_reminders' | 'notify_class_alerts', value: boolean) => {
    if (key === 'notify_task_reminders') setTaskReminders(value);
    if (key === 'notify_class_alerts') setClassAlerts(value);

    if (!profile) return;

    const { error } = await supabase
        .from('profiles')
        .update({ [key]: value })
        .eq('id', profile.id);

    if (error) {
        showToast("Error", "Failed to save setting", "error");
        await refreshProfile(); 
    } else {
        refreshProfile();
    }
  };

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-12" style={{ backgroundColor: "var(--color-main-bg)" }}>
      <AppBreadcrumb />
      
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>Settings</h1>

        <Card className="bg-[var(--color-components-bg)] border-[var(--color-border)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}>
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              Appearance
            </CardTitle>
            <CardDescription>Customize how SchedEuler looks on your device.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bar-bg)]">
              <div className="space-y-0.5">
                <Label className="text-base" style={{ color: "var(--color-text-primary)" }}>Dark Mode</Label>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Switch between light and dark themes.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--color-components-bg)] border-[var(--color-border)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}>
              <Bell size={20} />
              Notifications
            </CardTitle>
            <CardDescription>Manage your alert preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bar-bg)]">
              <div className="space-y-0.5">
                <Label className="text-base" style={{ color: "var(--color-text-primary)" }}>Task Reminders</Label>
                <p className="text-sm text-[var(--color-text-secondary)]">Get notified for tasks due within 24 hours.</p>
              </div>
              <Switch 
                checked={taskReminders} 
                onCheckedChange={(val) => handleToggleSetting('notify_task_reminders', val)}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bar-bg)]">
              <div className="space-y-0.5">
                <Label className="text-base" style={{ color: "var(--color-text-primary)" }}>Class Alerts</Label>
                <p className="text-sm text-[var(--color-text-secondary)]">Notify me 15 mins before class starts.</p>
              </div>
              <Switch 
                checked={classAlerts}
                onCheckedChange={(val) => handleToggleSetting('notify_class_alerts', val)}
              />
            </div>

          </CardContent>
        </Card>

        <Card className="bg-[var(--color-components-bg)] border-[var(--color-border)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}>
              <Shield size={20} />
              Privacy & Data
            </CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                  Your data is stored securely. You can request a data export or account deletion by contacting support.
              </p>
              
              <div 
                className="p-3 rounded-md text-sm border font-medium"
                style={{
                    backgroundColor: 'var(--color-hover)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                }}
              >
                  Current Version: 1.0.3
              </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}