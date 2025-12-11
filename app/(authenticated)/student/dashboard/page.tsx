import React from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import StudentDashboardClient from "./components/StudentDashboardClient";

export default async function StudentDashboard() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Optimize: Fetch profile on server to prevent loading flicker
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  const userName = profile?.name ? profile.name.split(" ")[0] : "Student";

  return <StudentDashboardClient userName={userName} />;
}