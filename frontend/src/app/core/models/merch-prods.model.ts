// merch-prods.model.ts

export interface Product {
  id: string;
  brand: string;
  name: string;
  slug: string;
  desc?: string;
  price: number;
  stock: number;
  images?: string[];       // <-- campo principal ahora es un array
  categoryId?: string;
  isActive: boolean;
  authorId?: string;
  status: string;

  // campo temporal para UI (puede mapearse a images[0])
  image?: string;
}

// Interface para crear un producto (sin ID)
export interface CreateProduct {
  brand: string;
  name: string;
  slug: string;
  desc?: string;
  price: number;
  stock: number;
  images?: string[];       // <-- ahora array
  categoryId?: string;
  isActive?: boolean;
  authorId?: string;
  status?: string;

  // campo temporal UI
  image?: string;
}

// Interface para actualizar un producto (todos los campos opcionales)
export interface UpdateProduct {
  brand?: string;
  name?: string;
  slug?: string;
  desc?: string;
  price?: number;
  stock?: number;
  images?: string[];       // <-- ahora array
  categoryId?: string;
  isActive?: boolean;
  authorId?: string;
  status?: string;

  // campo temporal UI
  image?: string;
}

// Interface para la respuesta del API (puede incluir campos adicionales)
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Tipo para el estado del producto
export type ProductStatus = 'draft' | 'published' | 'archived';

// Clase opcional para instancias con métodos
export class ProductModel implements Product {
  constructor(
    public id: string,
    public brand: string,
    public name: string,
    public slug: string,
    public price: number,
    public stock: number,
    public isActive: boolean,
    public status: string,
    public desc?: string,
    public images?: string[],   // <-- actualizado
    public categoryId?: string,
    public authorId?: string,
    public image?: string       // <-- UI temporal
  ) { }

  // Método para verificar si el producto está disponible
  isAvailable(): boolean {
    return this.isActive && this.stock > 0 && this.status === 'published';
  }

  // Método para formatear el precio
  getFormattedPrice(): string {
    return `$${this.price.toFixed(2)}`;
  }

  // Método estático para crear instancia desde objeto
  static fromObject(obj: Product): ProductModel {
    return new ProductModel(
      obj.id,
      obj.brand,
      obj.name,
      obj.slug,
      obj.price,
      obj.stock,
      obj.isActive,
      obj.status,
      obj.desc,
      obj.images,
      obj.categoryId,
      obj.authorId,
      obj.image
    );
  }
}
