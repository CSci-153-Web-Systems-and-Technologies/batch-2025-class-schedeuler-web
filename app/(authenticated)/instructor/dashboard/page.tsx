import React from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import InstructorDashboardClient from "./components/InstructorDashboardClient";

export default async function InstructorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  const userName = profile?.name ? profile.name.split(" ")[0] : "Instructor";

  let totalStudents = 0;
  let conflictCount = 0;

  const { data: classes } = await supabase.from('classes').select('id').eq('instructor_id', user.id);
    
  if (classes && classes.length > 0) {
    const classIds = classes.map(c => c.id);
    
    const { count } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .in('class_id', classIds)
      .eq('status', 'approved');
    
    totalStudents = count || 0;

    const { data: conflictingEnrollments } = await supabase
        .from('enrollments')
        .select('conflict_report')
        .in('class_id', classIds)
        .eq('status', 'approved')
        .not('conflict_report', 'is', null); 

    if (conflictingEnrollments) {
        conflictCount = conflictingEnrollments.filter(e => 
            e.conflict_report && 
            Array.isArray(e.conflict_report) && 
            e.conflict_report.length > 0
        ).length;
    }
  }

  return (
    <InstructorDashboardClient 
      userName={userName} 
      initialStats={{ totalStudents, conflictCount }} 
    />
  );
}