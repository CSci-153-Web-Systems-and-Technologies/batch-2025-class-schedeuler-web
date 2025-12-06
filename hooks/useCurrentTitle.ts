// hooks/useCurrentTitle.ts
import { usePathname } from "next/navigation";

const roleTitleMappings: Record<string, Record<string, string>> = {
  student: {
    "/student/dashboard": "Dashboard",
    "/student/classes": "My Classes",
    "/student/schedule": "My Schedule", 
    "/student/calendar": "Calendar",
    "/student/tasks": "Tasks",
    "/student/pomodoro": "Pomodoro Timer",
    "/student/report": "Report",
    "/student/profile": "Profile",
    "/student/settings": "Settings",
  },
  instructor: {
    "/instructor/dashboard": "Dashboard",
    "/instructor/classes": "My Classes",
    "/instructor/schedule": "My Schedule",
    "/instructor/calendar": "Calendar", 
    "/instructor/tasks": "Tasks",
    "/instructor/report": "Report",
    "/instructor/profile": "Profile",
    "/instructor/settings": "Settings",
  },
};

export function useCurrentTitle(): string {
  const pathname = usePathname();
  let role: string = 'student'; 
  
  if (pathname.startsWith('/instructor')) {
    role = 'instructor';
  }
  const titleMapping = roleTitleMappings[role];


  if (titleMapping[pathname]) {
    return titleMapping[pathname];
  }

  for (const [path, title] of Object.entries(titleMapping)) {
    if (pathname.startsWith(path) && path !== `/${role}/dashboard`) {
      return title;
    }
  }

  return "Dashboard"; 
}