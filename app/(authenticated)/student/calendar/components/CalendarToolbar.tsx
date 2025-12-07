// components/Calendar/CalendarToolbar.tsx
import React from 'react';
import { ToolbarProps, View } from 'react-big-calendar'; 
import { ChevronLeft, ChevronRight, Filter, BookOpen, GraduationCap, School, ChevronDown } from 'lucide-react';
import { CalendarEvent, EventType } from '@/types/calendar';
import { Button } from '@/app/components/ui/Button'; 
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger,
    DropdownMenuGroup
} from '@/app/components/ui/Dropdown-menu'; 

interface CalendarToolbarProps extends ToolbarProps<CalendarEvent, object> {
  onFilterChange?: (filter: 'all' | EventType) => void;
  filter?: 'all' | EventType;
  availableViews?: View[]; 
}

const allViewOptions: { value: View; label: string }[] = [
    { value: 'month', label: 'Month' },
    { value: 'week', label: 'Week' },
    { value: 'day', label: 'Day' },
];

const filterOptions: { value: 'all' | EventType; label: string; Icon: React.ElementType }[] = [
    { value: 'all', label: 'All Events', Icon: Filter },
    { value: EventType.SUBJECT, label: 'Subjects', Icon: School },
    { value: EventType.EXAM, label: 'Exams', Icon: GraduationCap },
    { value: EventType.TASK, label: 'Tasks', Icon: BookOpen },
];

const getCurrentFilterViewLabel = (view: View, filter: 'all' | EventType) => {
    const viewLabel = allViewOptions.find(o => o.value === view)?.label || 'View';
    const filterLabel = filterOptions.find(o => o.value === filter)?.label || 'Filter';
    return `${viewLabel} (${filterLabel})`;
};

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({ 
  date, 
  onNavigate, 
  onView,
  onFilterChange,
  filter = 'all',
  label,
  view,
  availableViews = ['month', 'week', 'day']
}) => {
  
  const visibleViewOptions = allViewOptions.filter(opt => availableViews.includes(opt.value));

  const goToBack = () => onNavigate('PREV');
  const goToNext = () => onNavigate('NEXT');
  const goToToday = () => onNavigate('TODAY');

  const handleViewChange = (newView: View) => {
    if (onView) onView(newView);
  };
  
  const handleFilterChange = (newFilter: 'all' | EventType) => {
    if (onFilterChange) onFilterChange(newFilter);
  };

  const renderViewControls = () => (
    <div className="flex bg-[var(--color-hover)] rounded-lg p-1">
        {visibleViewOptions.map((option) => (
            <button
                key={option.value}
                onClick={() => handleViewChange(option.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    view === option.value
                        ? 'bg-[var(--color-components-bg)] shadow text-[var(--color-text-primary)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
            >
                {option.label}
            </button>
        ))}
    </div>
  );

  const renderFilterControls = () => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 text-[var(--color-text-primary)]"
            >
                {filterOptions.find(o => o.value === filter)?.label || 'Filter'}
                <ChevronDown size={16} />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
            <DropdownMenuGroup>
                {filterOptions.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onSelect={() => handleFilterChange(option.value)}
                        className={filter === option.value ? 'bg-accent font-medium' : ''}
                    >
                        <option.Icon size={14} className="mr-2" />
                        {option.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuGroup>
        </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderCombinedControls = () => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 text-[var(--color-text-primary)]"
            >
                {getCurrentFilterViewLabel(view, filter)}
                <ChevronDown size={16} />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
            
            <DropdownMenuLabel>View</DropdownMenuLabel>
            <DropdownMenuGroup>
                {visibleViewOptions.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onSelect={() => handleViewChange(option.value)}
                        className={view === option.value ? 'bg-accent font-medium' : ''}
                    >
                        {option.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuLabel>Filter</DropdownMenuLabel>
            <DropdownMenuGroup>
                {filterOptions.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onSelect={() => handleFilterChange(option.value)}
                        className={filter === option.value ? 'bg-accent font-medium' : ''}
                    >
                        <option.Icon size={14} className="mr-2" />
                        {option.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuGroup>
        </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex items-center justify-between mb-4">
      
      <div className="flex items-center gap-2">
        <Button
          onClick={goToToday}
          variant="default"
          size="sm"
          className="bg-[var(--color-primary)] text-white hover:opacity-90 transition-colors"
        >
          Today
        </Button>
        <div className="flex items-center">
          <Button 
            onClick={goToBack} 
            variant="ghost"
            size="icon-sm"
            className="text-[var(--color-text-primary)]"
          >
            <ChevronLeft size={20} />
          </Button>
          <span className="mx-2 text-lg font-semibold text-[var(--color-text-primary)] whitespace-nowrap">
            {label}
          </span>
          <Button 
            onClick={goToNext} 
            variant="ghost"
            size="icon-sm"
            className="text-[var(--color-text-primary)]"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        
        <div className="lg:hidden">
            {renderCombinedControls()}
        </div>

        <div className="hidden lg:flex items-center gap-4">
            {renderFilterControls()}
            {renderViewControls()}
        </div>
      </div>
    </div>
  );
};

export default CalendarToolbar;