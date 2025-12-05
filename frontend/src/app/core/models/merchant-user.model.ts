export interface MerchantUser {
    id: string;
    username: string;
    email: string;
    isActive: boolean;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    refreshToken?: string;
}
