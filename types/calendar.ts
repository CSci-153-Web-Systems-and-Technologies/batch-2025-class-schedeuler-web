// types/calendar.ts

export enum EventType {
  SUBJECT = 'subject',
  TASK = 'task',
  EXAM = 'exam',
}

export enum RepeatPattern {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  description?: string;
  
  // Date/Time fields
  start: Date;
  end: Date;
  color?: string;
  
  // Recurrence (for SUBJECT)
  repeatPattern?: RepeatPattern; 
  repeatUntil?: Date;
  repeatDays?: number[]; // [0-6] for days of week (0=Sunday, 1=Monday, etc.)
  excludeDates?: Date[]; // Dates to skip recurrence
  
  // Task/Exam specific fields
  priority?: 'low' | 'medium' | 'high';
  taskEstimate?: string; // e.g., "2 hours"
  completed?: boolean;

  // Subject specific fields
  subjectCode?: string;
  instructor?: string;
  location?: string;
}