export interface TrainingRecord {
  id :string;
  completed: string|boolean;
  course: { id: string, name :string };
  eventId: string;
  eventType: string;
  expires?: string;
  fromRule: boolean;
  status: string;
}