"use client";
import Image from "next/image";
import { Button } from "@/app/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { SectionProps } from "@/types/sections";
import { cn } from "@/lib/utils";

const STATS = [
  { title: "Real-time", description: "Conflict detection" },
  { title: "Export", description: "PDF / CSV" },
  { title: "Role-based", description: "Student & Instructors" },
] as const;

const SCHEDULE_ITEMS = [
  { subject: "Algorithms", time: "8:00 - 9:00", color: "bg-[#8274FF]" },
  { subject: "Database Systems", time: "10:00 - 11:30", color: "bg-[#4169E1]" },
  { subject: "Discrete Structures", time: "1:30 - 3:00", color: "bg-[#06D146]" },
] as const;

const QUICK_ACTIONS = [
  { label: "Pomodoro", gradient: "from-[#EAF2FF] to-[#F6F6FF]" },
  { label: "Tasks", gradient: "from-[#E9FBE9] to-[#F6F6FF]" },
  { label: "Export", gradient: "from-[#FFF7E6] to-[#FFFBF0]" },
] as const;

const HeroSection = ({ className }: SectionProps) => {
  const renderStats = () => (
    <div className="grid grid-cols-3 gap-4 md:gap-6 text-center md:text-left">
      {STATS.map((stat, index) => (
        <div key={index}>
          <h3 className="font-semibold text-foreground font-poppins text-sm">
            {stat.title}
          </h3>
          <p className="text-muted-foreground text-xs md:text-sm font-inter">
            {stat.description}
          </p>
        </div>
      ))}
    </div>
  );

  const renderScheduleItems = () => (
    <div className="flex flex-col bg-muted p-3 md:p-4 flex-1 justify-between rounded-2xl gap-3 md:gap-4">
      {SCHEDULE_ITEMS.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-sm flex-shrink-0", item.color)} />
            <p className="text-sm md:text-base">{item.subject}</p>
          </div>
          <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap ml-2">
            {item.time}
          </span>
        </div>
      ))}
    </div>
  );

  const renderQuickActions = () => (
    <div className="flex flex-col gap-3 md:gap-4 w-20 md:w-24">
      {QUICK_ACTIONS.map((action, index) => (
        <span
          key={index}
          className={cn(
            "text-center px-2 py-2 rounded-lg text-muted-foreground text-xs md:text-sm",
            `bg-gradient-to-b ${action.gradient}`
          )}
        >
          {action.label}
        </span>
      ))}
    </div>
  );

  return (
    <section className={cn(
      "w-full flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-8 py-12 md:py-16",
      className
    )}>
      <div className="flex-1 lg:max-w-2xl">
        <Badge variant="default" className="mb-4 px-2">
          Conflict-free scheduling
        </Badge>

        <h1 className="font-poppins text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground mb-4">
          Create conflict-free class schedules — effortlessly.
        </h1>

        <p className="font-inter text-muted-foreground text-base md:text-lg mb-8">
          Streamline timetables with real-time conflict detection, drag-and-drop
          plotting, role-based access, and productivity tools (Pomodoro &
          tasks). Built for students and instructors.
        </p>

        <div className="flex flex-wrap gap-4 mb-8 md:mb-12">
          <Button size="lg" className="rounded-full hover:scale-105">
            Get Started
          </Button>
          <Button variant="outline" size="lg" className="rounded-full hover:scale-105">
            Learn More
          </Button>
        </div>

        {renderStats()}
      </div>

      <Card className="w-full lg:max-w-lg p-6 shadow-[0_32px_64px_0_rgba(65,105,225,0.12),_0_8px_24px_0_rgba(65,105,225,0.0784)] hover:scale-105 duration-300">
        <CardHeader className="flex flex-row justify-between items-baseline p-0 mb-4">
          <h2 className="font-bold text-xl md:text-2xl">My Week</h2>
          <p className="text-sm md:text-base text-muted-foreground">Mon-Fri</p>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="flex gap-3 mb-4">
            {renderScheduleItems()}
            {renderQuickActions()}
          </div>
          
          <Button className="w-full rounded-full bg-gradient-to-r from-primary to-[#8274FF]">
            Create Schedule
          </Button>
        </CardContent>
      </Card>
    </section>
  );
};

export default HeroSection;