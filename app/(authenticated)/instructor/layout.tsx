// app/(authenticated)/instructor/layout.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import InstructorClientLayout from "./InstructorClientLayout";

export default async function InstructorLayout({ 
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

  if (profile?.account_type !== "instructor") {
    redirect("/student/dashboard");
  }

  return <InstructorClientLayout>{children}</InstructorClientLayout>;
}