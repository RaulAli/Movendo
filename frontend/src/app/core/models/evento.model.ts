export interface Evento {
  _id?: string;     // MongoDB id
  nombre: string;
  fecha: string;
  ciudad: string;
  genero?: string;
  slug?: string;
  image?: string;
}
