import { Profile } from './profile.model';
import { Evento } from './evento.model';

export interface Comment {
  id: number;
  body: string;
  createdAt: string;
  author: Profile;
  evento?: Evento;
}