// src/app/models/category.model.ts
export interface merch_Category {
  id: string;
  name: string;
  slug: string;
  desc?: string;
  isActive: boolean;
  authorId: string;
  status: string;
  _id?: string;
}

export interface Createmerch_Category {
  name: string;
  slug: string;
  desc?: string;
  isActive?: boolean;
  authorId: string;
  status?: string;
}

export interface Updatemerch_Category {
  name?: string;
  slug?: string;
  desc?: string;
  isActive?: boolean;
  authorId?: string;
  status?: string;
}

export interface merch_CategoriesResponse {
  data: merch_Category[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface merch_CategoryResponse {
  data: merch_Category;
  message?: string;
}

export interface merch_CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  isActive?: boolean;
}

export enum merch_CategoryStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}