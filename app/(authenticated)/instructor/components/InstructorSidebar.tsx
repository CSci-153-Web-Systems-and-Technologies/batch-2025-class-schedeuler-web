"use client";

import Sidebar, { MenuItem } from "@/app/(authenticated)/components/Sidebar"; 
import { usePathname } from "next/navigation";

const instructorMenuData: Omit<MenuItem, 'active'>[] = [
  { icon: "Home", label: "Dashboard", href: "/instructor/dashboard" },
  { icon: "BookOpen", label: "My Classes", href: "/instructor/classes" },
  { icon: "CalendarDays", label: "My Schedule", href: "/instructor/schedule" },
  { icon: "Calendar", label: "Calendar", href: "/instructor/calendar" },
  { icon: "CheckSquare", label: "Tasks", href: "/instructor/tasks" },
  { icon: "Flag", label: "Report", href: "/instructor/report" },
];

export default function InstructorSidebar() {
  const pathname = usePathname();

  const menuItems: MenuItem[] = instructorMenuData.map((item) => {
    const isActive = 
      pathname === item.href || 
      (pathname.startsWith(item.href) && item.href !== "/instructor/dashboard");
      
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