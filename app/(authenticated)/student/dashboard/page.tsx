import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AppBreadcrumb from "@/app/components/ui/AppBreadCrumb";
import Greeting from "@/app/(authenticated)/components/Greeting";
import CalendarDisplay from "@/app/(authenticated)/components/CalendarDisplay";
import SubjectsList from "./components/SubjectsList";
import PomodoroTimer from "./components/PomodoroTimer";
import StudentOverview from "./components/StudentOverview";
import { ClassCardProps } from "../../components/ClassCard";
import TasksDeadline from "./components/TasksDeadline";
import JoinClassButton from "./components/JoinClassButton";

export default async function StudentDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  const firstName = profile?.name?.split(" ")[0] || "Student";
  const subjectsData = [
    { name: "Math", color: "#FF6B6B" },
    { name: "Science", color: "#4D96FF" },
    { name: "History", color: "#FFD93D" },
    { name: "English", color: "#6BCB77" },
  ];

  const studentScheduleData: ClassCardProps[] = [
    {
      subject: "History 101",
      type: "Lecture Hall",
      time: "M/W/F 9:00 AM",
      bgColor: "#D1FAE5",
      borderColor: "#34D399",
    },
    {
      subject: "Calculus II",
      type: "Discussion",
      time: "T/Th 1:00 PM",
      bgColor: "#E0F2FE",
      borderColor: "#7DD3FC",
    },
    {
      subject: "Art History",
      type: "Studio",
      time: "W 3:00 PM",
      bgColor: "#FFEDD5",
      borderColor: "#FB923C",
    },
  ];
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const tasksData = [
    {
      date: today,
      tasks: [
        { id: 1, title: "Finish Figma on project website", completed: true },
        { id: 2, title: "Finish Figma on project website", completed: false },
      ],
    },
    {
      date: tomorrow,
      tasks: [
        { id: 3, title: "Finish Figma on project website", completed: false },
      ],
    },
  ];
  return (
    <div
      className="min-h-screen py-6 px-12"
      style={{ backgroundColor: "var(--color-main-bg)" }}
    >
      <AppBreadcrumb />
      <div className="flex justify-between">
        <Greeting userName={firstName} />
        <JoinClassButton />
      </div>

      <div className="mb-3"></div>
      
      <div className="flex flex-col md:flex-row justify-between lg:gap-10 gap-5 mb-6 nd:w-2/3 ">
        <StudentOverview subjects={studentScheduleData} />
        <div className="flex flex-col justify-center align-center min-w-xs gap-3">
          <CalendarDisplay />
          <PomodoroTimer />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between gap-3">
        <div className="flex-1 min-w-0">

          <TasksDeadline initialTasks={tasksData} />
        </div>

        <div className="flex-1 min-w-0">


          <div
            className="px-8 py-4 rounded-xl"
            style={{ backgroundColor: "var(--color-components-bg)" }}
          >
            <h1
              className="text-2xl font-bold border-b-2 mb-2.5"
              style={{ color: "var(--color-text-primary)" }}
            >
              Subjects
            </h1>
            <SubjectsList subjects={subjectsData} />
          </div>
        </div>  
      </div>
    </div>
  );
}
