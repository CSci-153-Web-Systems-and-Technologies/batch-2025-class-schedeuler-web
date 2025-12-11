"use client";

import Sidebar, { MenuItem } from "@/app/(authenticated)/components/Sidebar";

const studentMenuData: MenuItem[] = [
  { icon: "Home", label: "Home", href: "/student/dashboard" },
  { icon: "BookOpen", label: "My Classes", href: "/student/classes" },
  { icon: "CalendarDays", label: "My Schedule", href: "/student/schedule" },
  { icon: "Calendar", label: "Calendar", href: "/student/calendar" },
  { icon: "CheckSquare", label: "Tasks", href: "/student/tasks" },
  { icon: "Clock", label: "Pomodoro", href: "/student/pomodoro" },
  { icon: "Flag", label: "Report", href: "/student/report" },
];

export default function StudentSidebar() {
  return (
    <Sidebar
      menuItems={studentMenuData}
      title="SchedEuler"
    />
  );
}