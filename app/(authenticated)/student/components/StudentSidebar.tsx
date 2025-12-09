"use client";

import Sidebar, { MenuItem } from "@/app/(authenticated)/components/Sidebar"; // Import the generic Sidebar and MenuItem interface
import { usePathname } from "next/navigation";

// Define the menu items specifically for the Student Role
// Note: The 'icon' string must match a key in the iconMap in Sidebar.tsx
const studentMenuData: Omit<MenuItem, 'active'>[] = [
  { icon: "Home", label: "Home", href: "/student/dashboard" },
  { icon: "BookOpen", label: "My Classes", href: "/student/classes" },
  { icon: "CalendarDays", label: "My Schedule", href: "/student/schedule" },
  { icon: "Calendar", label: "Calendar", href: "/student/calendar" },
  { icon: "CheckSquare", label: "Tasks", href: "/student/tasks" },
  { icon: "Clock", label: "Pomodoro", href: "/student/pomodoro" }, // FIXED
  { icon: "Flag", label: "Report", href: "/student/report" },
];

export default function StudentSidebar() {
  const pathname = usePathname();

  const menuItems: MenuItem[] = studentMenuData.map((item) => {
    const isActive = 
      pathname === item.href || 
      (item.href !== "/home" && pathname.startsWith(item.href));
      
    return {
      ...item,
      active: isActive,
    };
  });

  return (
    <Sidebar
      menuItems={menuItems}
      title="SchedEuler"
    />
  );
}