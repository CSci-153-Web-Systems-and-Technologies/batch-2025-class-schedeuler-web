"use client";

import * as React from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/app/components/ui/Button"; 
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/Popover";
import { useThemeContext } from "@/app/(authenticated)/components/ThemeContext";

const darkenHex = (hex: string, percent: number): string => {
  if (!hex || hex.startsWith('var')) return hex;

  let color = hex.replace(/^#/, '');
  
  if (color.length === 3) {
    color = color.split('').map(c => c + c).join('');
  }

  const num = parseInt(color, 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  r = Math.floor(r * (100 - percent) / 100);
  g = Math.floor(g * (100 - percent) / 100);
  b = Math.floor(b * (100 - percent) / 100);

  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  const newHex = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  return `#${newHex}`;
};

export interface CalendarMarker {
  date: Date;
  events: {
    title: string;
    color: string;
    type?: string;
    time?: string;
  }[];
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "dropdown",
  buttonVariant = "ghost",
  formatters,
  components,
  markedDates = [], 
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
  markedDates?: CalendarMarker[];
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
        root: cn("w-full", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative w-full",
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
        weekdays: cn("flex w-full", defaultClassNames.weekdays),
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
          "relative w-full h-full p-0 text-center group/day aspect-square select-none flex-1", // Ensure days expand
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
        DayButton: (dayButtonProps) => (
          <CalendarDayButton {...dayButtonProps} markedDates={markedDates} />
        ),
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
  markedDates = [],
  ...props
}: React.ComponentProps<typeof DayButton> & { markedDates?: CalendarMarker[] }) {
  const defaultClassNames = getDefaultClassNames();
  const [isOpen, setIsOpen] = React.useState(false); 
  
  const { theme } = useThemeContext();
  const themeClass = theme === 'dark' ? 'authenticated dark' : 'authenticated';

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const isSelected = modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle;
  const isOutsideDay = modifiers.outside;
  const isDisabled = modifiers.disabled;
  const isInteractive = !isOutsideDay && !isDisabled;

  const marker = markedDates.find(m => 
    m.date.getDate() === day.date.getDate() &&
    m.date.getMonth() === day.date.getMonth() &&
    m.date.getFullYear() === day.date.getFullYear()
  );

  const dots = marker?.events || [];
  const hasEvents = dots.length > 0;

  const handleMouseEnter = () => {
    if (isInteractive) setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  const getDisplayColor = (baseColor: string) => {
    if (theme === 'light') {
      return darkenHex(baseColor, 30);
    }
    return baseColor;
  };

  const ButtonContent = (
    <button
      ref={ref}
      type="button"
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal rounded-full relative items-center justify-center",
        "text-[var(--color-text-primary)] transition-all duration-200 bg-transparent",
        isInteractive && !isSelected && ["hover:!bg-[#2F437F] hover:!text-white hover:!border-transparent"],
        isInteractive && isSelected && ["!bg-[#4169E1] !text-white !border-transparent"],
        modifiers.today && !isSelected && isInteractive && ["border border-[#4169E1]"],
        (isOutsideDay || isDisabled) && ["!opacity-40 cursor-default hover:!bg-transparent"],
        defaultClassNames.day,
        className
      )}
      style={{ pointerEvents: isInteractive ? 'auto' : 'none' }}
      onClick={props.onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={props.tabIndex}
    >
      <span className={cn("text-sm", dots.length > 0 ? "-mt-1" : "")}>{day.date.getDate()}</span>
      
      {dots.length > 0 && !isOutsideDay && (
        <div className="flex gap-0.5 absolute bottom-1.5 justify-center flex-wrap max-w-[70%]">
          {dots.slice(0, 3).map((evt, i) => {
            const dotColor = evt.color || 'var(--color-primary)';
            const finalColor = isSelected ? 'white' : getDisplayColor(dotColor);

            return (
              <div 
                key={i} 
                className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : "")}
                style={{ backgroundColor: finalColor }} 
              />
            );
          })}
          {dots.length > 3 && (
             <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-gray-400")} />
          )}
        </div>
      )}
    </button>
  );

  if (!isInteractive) {
    return ButtonContent;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {ButtonContent}
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
            "w-64 p-3 bg-[var(--color-components-bg)] border-[var(--color-border)] shadow-xl z-50 pointer-events-none",
            themeClass
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-2">
          <h4 className="font-semibold text-sm border-b border-[var(--color-border)] pb-1 mb-2 text-[var(--color-text-primary)]">
            {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </h4>
          <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
            {hasEvents ? (
              dots.map((evt, idx) => {
                const listDotColor = getDisplayColor(evt.color || 'var(--color-primary)');
                return (
                  <div key={idx} className="flex items-start gap-2 text-left">
                    <div 
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" 
                      style={{ backgroundColor: listDotColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate text-[var(--color-text-primary)]">
                        {evt.title}
                      </p>
                      {evt.time && (
                        <p className="text-[10px] text-[var(--color-text-secondary)]">
                          {evt.time}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[var(--color-text-secondary)] text-center py-2">
                No events scheduled for this day
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { Calendar, CalendarDayButton };