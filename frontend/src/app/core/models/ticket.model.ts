import { Evento } from './evento.model';
import { Product } from './merch-prods.model';

export interface PopulatedMerchant extends Product {
  quantity: number; // This is the quantity from the OrderItem's merchant array
}

export interface OrderMerchantItem {
  id_merchant: string;
  cantidad: number;
}

export interface OrderItem {
  id_evento: string; // The ID of the event
  cantidad: number; // Quantity of tickets for this event
  merchant: OrderMerchantItem[]; // Array of merchant products for this event
  populatedMerchants?: PopulatedMerchant[]; // This is the new field I added in frontend
}

export interface Order {
  _id: string;
  username: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'PUBLISHED' | 'SHAVED';
  items: OrderItem[]; // Each item in the order
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  _id: string;
  orderId: Order; // This will be the populated Order object
  eventId: Evento; // This will be the populated Evento object
  username: string;
  status: string; // The Ticket status
  type: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
