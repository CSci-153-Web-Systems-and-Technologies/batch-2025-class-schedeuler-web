// app/(authenticated)/student/layout.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import StudentClientLayout from "./StudentClientLayout";

export default async function StudentLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .single();

  if (profile?.account_type !== "student") {
    redirect("/instructor/dashboard");
  }

  return <StudentClientLayout>{children}</StudentClientLayout>;
}