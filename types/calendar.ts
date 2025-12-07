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
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  repeatPattern?: RepeatPattern; 
  repeatUntil?: Date;
  repeatDays?: number[]; 
  excludeDates?: Date[];
  priority?: 'low' | 'medium' | 'high';
  taskEstimate?: string;
  completed?: boolean;
  subjectCode?: string;
  instructor?: string;
  location?: string;
}