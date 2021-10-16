import { Moment } from 'moment';

export interface TaskProgress {
  completed?: boolean | Moment;
  expires?: Moment;
  status?: string;
  available: boolean;
  blocked?: string[];
}