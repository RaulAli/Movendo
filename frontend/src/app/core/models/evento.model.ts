export interface Evento {
  _id?: string;     // MongoDB id
  nombre: string;
  fecha: string;
  ciudad: string;
  category?: string;
  slug?: string;
  image?: string;
  price?: number;
  favorited?: boolean;
  favouritesCount?: number;
  startDate?: string;
  endDate?: string;
}

export interface EventosResponse {
  data: Evento[];
  total: number;
}
