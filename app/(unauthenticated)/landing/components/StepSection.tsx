"use client";
import React, { useEffect, useRef, useState } from "react";
import CustomCard from "@/components/ui/CustomCard";
import { SectionProps } from "@/types/sections";
import { cn } from "@/lib/utils";

interface Step {
  iconText: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    iconText: "1",
    title: "Sign up & choose role",
    description: "Create an account and pick student or instructor for tailored features",
  },
  {
    iconText: "2",
    title: "Input Classes",
    description: "Add subjects using dropdowns or drag-and-drop, edit times, rooms, and instructors easily.",
  },
  {
    iconText: "3",
    title: "Instant Feedback",
    description: "Alert users when there are conflicts between schedules.",
  },
  {
    iconText: "4",
    title: "Export & Share",
    description: "Export schedules to PDF/CSV or share them with classmates and faculty",
  },
];

const StepSection = ({ id, className }: SectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [lines, setLines] = useState<{ left: number; width: number; top: number }[]>([]);

  const computeLines = () => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newLines: { left: number; width: number; top: number }[] = [];

    for (let i = 0; i < STEPS.length - 1; i++) {
      const current = cardRefs.current[i];
      const next = cardRefs.current[i + 1];
      if (!current || !next) continue;

      const currRect = current.getBoundingClientRect();
      const nextRect = next.getBoundingClientRect();

      const left = currRect.right - containerRect.left;
      const right = nextRect.left - containerRect.left;
      const width = Math.max(0, right - left);
      const top = currRect.top + currRect.height / 2 - containerRect.top;

      newLines.push({ left, width, top });
    }

    setLines(newLines);
  };

  useEffect(() => {
    computeLines();
    window.addEventListener("resize", computeLines);
    return () => window.removeEventListener("resize", computeLines);
  }, []);

  const renderStepCard = (step: Step, index: number) => (
    <CustomCard
      key={index}
      variant="step"
      iconText={step.iconText}
      iconBgColor="bg-gradient-to-br from-primary to-[#6a5acd]"
      iconShape="rounded-2xl"
      title={step.title}
      description={step.description}
      className="flex-col"
    />
  );

  const renderMobileView = () => (
    <div className="flex flex-col items-center relative md:hidden">
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 to-[#6a5acd]/40" />
      <div className="flex flex-col gap-8 items-center w-full">
        {STEPS.map((step, index) => (
          <div key={index} className="relative z-10">
            {renderStepCard(step, index)}
          </div>
        ))}
      </div>
    </div>
  );

  const renderTabletView = () => (
    <div className="hidden md:flex lg:hidden flex-col items-center relative">
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 to-[#6a5acd]/40" />
      {STEPS.map((step, index) => {
        const isEven = index % 2 === 0;
        return (
          <div
            key={index}
            className={cn(
              "relative flex items-center w-full",
              "min-h-[290px]",
              isEven ? "justify-start" : "justify-end"
            )}
          >
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 h-0.5 z-0",
                isEven
                  ? "right-1/2 bg-gradient-to-r from-primary/30 to-[#6a5acd]/40"
                  : "left-1/2 bg-gradient-to-l from-primary/30 to-[#6a5acd]/40"
              )}
              style={{
                width: "calc(50% - 130px)",
              }}
            />
            <div className="z-10">{renderStepCard(step, index)}</div>
          </div>
        );
      })}
    </div>
  );

  const renderDesktopView = () => (
    <div
      ref={containerRef}
      className="hidden lg:flex w-full justify-between items-center relative px-0"
    >
      {STEPS.map((step, index) => (
        <div
          key={index}
          ref={(el) => {
            cardRefs.current[index] = el;
          }}
          className="relative flex flex-col items-center max-w-[280px] flex-shrink-0"
        >
          <div className="relative z-10">{renderStepCard(step, index)}</div>
        </div>
      ))}

      {lines.map((line, i) => (
        <div
          key={i}
          className="absolute h-0.5 bg-gradient-to-r from-primary/30 to-[#6a5acd]/40 z-0"
          style={{
            left: line.left,
            width: line.width,
            top: line.top,
            transform: "translateY(-50%)",
          }}
        />
      ))}
    </div>
  );

  return (
    <section id={id} className={className}>
      <h2 className="text-2xl font-bold mb-8">How it Works</h2>
      {renderMobileView()}
      {renderTabletView()}
      {renderDesktopView()}
    </section>
  );
};

export default StepSection;
