import { Evento } from './evento.model';
import { User } from './auth.model';

export interface MerchantItem {
    id_merchant: User; // Changed to User
    cantidad: number;
}

export interface CartItem {
    id_evento: Evento; // Changed to Evento
    cantidad: number;
    merchants: MerchantItem[];
}

export interface Carrito {
    _id: string;
    id_user: string;
    status: 'active' | 'pending' | 'paid' | 'cancelled' | 'abandoned';
    items: CartItem[];
    createdAt: string;
    updatedAt: string;
}
