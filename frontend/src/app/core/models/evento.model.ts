export interface Evento {
  _id?: string;     // MongoDB id
  nombre: string;
  fecha: string;
  ciudad: string;
  category?: string;
  slug?: string;
  image?: string;
  price?: number;
}
