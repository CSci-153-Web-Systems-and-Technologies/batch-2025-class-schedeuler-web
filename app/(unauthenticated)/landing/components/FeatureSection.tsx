"use client";
import { Clock, GripVertical, CalendarRange, ListTodo } from "lucide-react";
import CustomCard from "@/components/ui/CustomCard";
import { SectionProps } from "@/types/sections";
import { cn } from "@/lib/utils";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: <Clock size={24} className="text-primary" />,
    title: "Real-time Conflict Detection",
    description: "Instant alerts for time overlaps, room double-booking, and instructor clashes so you never schedule wrongly."
  },
  {
    icon: <GripVertical size={24} className="text-primary" />,
    title: "Drag & Drop Interface",
    description: "Easily rearrange classes with intuitive drag-and-drop functionality for quick schedule adjustments."
  },
  {
    icon: <CalendarRange size={24} className="text-primary" />,
    title: "Multiple Views",
    description: "Switch between daily, weekly, and monthly views to manage your schedule from different perspectives."
  },
  {
    icon: <ListTodo size={24} className="text-primary" />,
    title: "Productivity Tools",
    description: "Integrated Pomodoro timer and task management to keep you focused and organized throughout your day."
  }
];

const FeatureSection = ({ id, className }: SectionProps) => {
  const renderFeatureCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {FEATURES.map((feature, index) => (
        <CustomCard
          key={index}
          variant="feature"
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          className="hover:scale-[1.01] hover:shadow-sm"
        />
      ))}
    </div>
  );

  return (
    <section id={id} className={cn("mb-8", className)}>
      <div className="bg-white px-5 pt-5 pb-8 rounded-2xl flex flex-col gap-3 lg:px-16">
        <h2 className="text-2xl font-bold">Key Features</h2>
        {renderFeatureCards()}
      </div>
    </section>
  );
};

export default FeatureSection;