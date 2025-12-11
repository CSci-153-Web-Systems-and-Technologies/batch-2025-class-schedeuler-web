"use client";

import Sidebar, { MenuItem } from "@/app/(authenticated)/components/Sidebar"; 

const instructorMenuData: MenuItem[] = [
  { icon: "Home", label: "Dashboard", href: "/instructor/dashboard" },
  { icon: "BookOpen", label: "My Classes", href: "/instructor/classes" },
  { icon: "CalendarDays", label: "My Schedule", href: "/instructor/schedule" },
  { icon: "Calendar", label: "Calendar", href: "/instructor/calendar" },
  { icon: "CheckSquare", label: "Tasks", href: "/instructor/tasks" },
  { icon: "Flag", label: "Report", href: "/instructor/report" },
];

export default function InstructorSidebar() {
  return (
    <Sidebar
      menuItems={instructorMenuData}
      title="SchedEuler"
    />
  );
}