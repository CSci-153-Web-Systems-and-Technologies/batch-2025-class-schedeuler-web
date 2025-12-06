// components/dashboard/calendar-display.tsx
"use client";

import * as React from "react";
import { Calendar } from "@/app/components/ui/Calendar";

export default function CalendarDisplay() {
  const [month, setMonth] = React.useState<Date>(new Date());
  const [selected, setSelected] = React.useState<Date | undefined>(new Date());

  const handleSelect = (date: Date | undefined) => {
    setSelected(date);
    if (date) console.log("Selected date:", date.toDateString());
  };

  return (
    <div className="w-full">
      <Calendar
        mode="single"
        selected={selected}
        onSelect={handleSelect}
        month={month}
        onMonthChange={setMonth}
        captionLayout="dropdown"
        showOutsideDays={true}
        fixedWeeks={true}
        fromYear={1900}
        toYear={2100}
        className="w-full"
      />
    </div>
  );
} 