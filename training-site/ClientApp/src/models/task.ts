export interface TrainingTask {
  title: string;
  summary: string;
  details?: string;
  category: 'online'|'paperwork'|'session'|'personal';
  hours?: number;
  prereqs?: string[];
}