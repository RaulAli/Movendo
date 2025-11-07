export interface Category {
  _id?: string;
  nombre: string;
  descripcion?: string;
  slug?: string;
  image?: string[];
  isActive: boolean;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
}