// hooks/useAlertSystem.ts
import { useEffect, useRef } from 'react';
import { useTasks } from '@/app/(authenticated)/student/tasks/TaskContext';
import { useSubjects } from '@/app/(authenticated)/student/subjects/SubjectContext';
import { useUser } from '@/app/context/UserContext';
import { createClient } from '@/utils/supabase/client';
import { generateRecurringEvents } from '@/utils/calendarUtils';
import { EventType } from '@/types/calendar';

export function useAlertSystem() {
  const { tasks } = useTasks();
  const { subjects } = useSubjects();
  const { profile } = useUser();
  const supabase = createClient();
  
  const ranOnce = useRef(false);

  useEffect(() => {
    if (!profile) return;

    const checkAlerts = async () => {
      const now = new Date();
      const notified = JSON.parse(localStorage.getItem('notified_events') || '[]');
      const newNotified = [...notified];
      let hasNew = false;

      const isInstructor = profile.account_type === 'instructor';
      const scheduleLink = isInstructor ? '/instructor/schedule' : '/student/schedule';
      const tasksLink = isInstructor ? '/instructor/tasks' : '/student/tasks';

      if (profile.notify_class_alerts) {
        const todayEvents = generateRecurringEvents(subjects, now, 'day');
        
        todayEvents.forEach(event => {
          if (event.type !== EventType.SUBJECT) return;
          
          if (/^\d{13}$/.test(event.id)) return;

          const uniqueId = `${event.id}_${event.start.getTime()}`;
          
          if (newNotified.includes(uniqueId)) return;

          const diffInMinutes = (event.start.getTime() - now.getTime()) / 1000 / 60;

          if (diffInMinutes > 0 && diffInMinutes <= 15) {
            
            createNotification(
              profile.id,
              `Upcoming Class: ${event.title}`,
              `Class starts in ${Math.ceil(diffInMinutes)} minutes at ${event.location || 'Unknown location'}.`,
              'info',
              scheduleLink
            );

            newNotified.push(uniqueId);
            hasNew = true;
          }
        });
      }

      if (profile.notify_task_reminders) {
        tasks.forEach(task => {
          if (task.completed || !task.start) return;
          
          if (/^\d{13}$/.test(task.id)) return;

          if (newNotified.includes(task.id)) return;

          const diffInHours = (task.start.getTime() - now.getTime()) / 1000 / 60 / 60;

          if (diffInHours > 0 && diffInHours <= 24) {
            
            createNotification(
              profile.id,
              `Task Due Soon: ${task.title}`,
              `This task is due in ${Math.ceil(diffInHours)} hours.`,
              'warning',
              tasksLink
            );

            newNotified.push(task.id);
            hasNew = true;
          }
        });
      }

      if (hasNew) {
        localStorage.setItem('notified_events', JSON.stringify(newNotified));
      }
    };

    const createNotification = async (userId: string, title: string, message: string, type: string, link: string) => {
        await supabase.from('notifications').insert([{
            user_id: userId,
            title,
            message,
            type,
            link,
            is_read: false
        }]);
    };

    checkAlerts();

    const interval = setInterval(checkAlerts, 60000);

    return () => clearInterval(interval);
  }, [tasks, subjects, profile, supabase]);
}