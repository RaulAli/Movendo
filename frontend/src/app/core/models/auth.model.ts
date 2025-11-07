
export interface User {
  email: string;
  token: string;
  username: string;
  image?: string;
  isActive: boolean;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
}