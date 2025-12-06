"use client";

import * as React from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/Button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "dropdown",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-3 [--cell-size:--spacing(8)] rounded-xl",
        "bg-[var(--color-components-bg)] text-[var(--color-text-primary)]",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          "text-[var(--color-text-primary)] hover:bg-transparent",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          "text-[var(--color-text-primary)] hover:bg-transparent",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5 text-[var(--color-text-primary)]",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative has-focus:border-ring shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
          "bg-[var(--color-components-bg)] text-[var(--color-text-primary)]",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-[var(--color-components-bg)] inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium text-[var(--color-text-primary)]",
          captionLayout === "label"
            ? "text-sm"
            : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-[var(--color-text-primary)] opacity-70 rounded-md flex-1 font-normal text-[0.8rem] select-none",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-(--cell-size)",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] select-none text-[var(--color-text-primary)] opacity-50",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0 text-center group/day aspect-square select-none",
          defaultClassNames.day
        ),
        range_start: "rounded-full",
        range_middle: "rounded-none",
        range_end: "rounded-full",
        today: cn(
          "bg-transparent text-[var(--color-text-primary)] font-semibold",
          defaultClassNames.today
        ),
        outside: cn(
          "text-[var(--color-text-primary)] opacity-40",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-[var(--color-text-primary)] opacity-30 cursor-default",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            );
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const isSelected = modifiers.selected &&
    !modifiers.range_start &&
    !modifiers.range_end &&
    !modifiers.range_middle;

  const isOutsideDay = modifiers.outside;
  const isDisabled = modifiers.disabled;
  const isInteractive = !isOutsideDay && !isDisabled;

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={isSelected}
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        // Base styles - ALWAYS rounded-full
        "flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal rounded-full",
        "text-[var(--color-text-primary)] transition-all duration-200",
        
        // Default state
        "bg-transparent",
        
        // HOVER: Force #2F437F background and white text
        // Only for interactive, non-selected days
        isInteractive && !isSelected && [
          "hover:!bg-[#2F437F]",
          "hover:!text-white",
          "hover:!border-transparent"
        ],
        
        // SELECTED: Force #4169E1 background and white text
        // Only for interactive days
        isInteractive && isSelected && [
          "!bg-[#4169E1]",
          "!text-white",
          "!border-transparent"
        ],
        
        // Range states
        modifiers.range_start && [
          "!bg-[#4169E1]",
          "!text-white"
        ],
        modifiers.range_end && [
          "!bg-[#4169E1]", 
          "!text-white"
        ],
        modifiers.range_middle && [
          "!bg-[#2F437F]",
          "!text-white"
        ],
        
        // Today indicator
        modifiers.today && !isSelected && isInteractive && [
          "border",
          "border-[#4169E1]"
        ],
        
        // Outside days (muted) - no hover, no selection, adjusted opacity
        isOutsideDay && [
          "!opacity-40",
          "!text-[var(--color-text-primary)]",
          "cursor-default",
          "hover:!bg-transparent",
          "hover:!text-[var(--color-text-primary)]"
        ],
        
        // Disabled days - no hover, no selection
        isDisabled && [
          "!opacity-30",
          "!text-[var(--color-text-primary)]",
          "cursor-default",
          "hover:!bg-transparent",
          "hover:!text-[var(--color-text-primary)]"
        ],
        
        defaultClassNames.day,
        className
      )}
      style={{ 
        pointerEvents: isInteractive ? 'auto' : 'none'
      }}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };