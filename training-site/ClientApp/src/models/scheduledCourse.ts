export interface ScheduledCourse {
  id: number;
  when: string;
  location: string;
  capacity: number;
  current: number;
  waiting: number;
  registered?: string;
}