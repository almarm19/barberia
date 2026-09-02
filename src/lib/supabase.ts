import { createClient } from '@supabase/supabase-js';
import {
  Product,
  Service,
  Barber,
  Sale,
  InventoryLog,
  Appointment,
  TicketConfig,
} from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// =====================================================================
// CONVERSORES DTO (FRONTEND <-> SUPABASE)
// =====================================================================

export function mapProductFromDb(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    price: Number(row.price) || 0,
    cost: Number(row.cost) || 0,
    stock: Number(row.stock) || 0,
    minStock: Number(row.min_stock) || 5,
    imageUrl: row.image_url || '',
    category: row.category || 'General',
    isBeverage: Boolean(row.is_beverage),
    active: row.active !== false,
    createdAt: row.created_at || new Date().toISOString(),
    barberCommissionType: row.barber_commission_type || 'PERCENTAGE',
    barberCommissionValue: row.barber_commission_value !== null ? Number(row.barber_commission_value) : undefined,
  };
}

export function mapProductToDb(p: Product): any {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    cost: p.cost,
    stock: p.stock,
    min_stock: p.minStock,
    image_url: p.imageUrl,
    category: p.category,
    is_beverage: p.isBeverage,
    active: p.active,
    barber_commission_type: p.barberCommissionType,
    barber_commission_value: p.barberCommissionValue,
    created_at: p.createdAt,
  };
}

export function mapServiceFromDb(row: any): Service {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    price: Number(row.price) || 0,
    durationMinutes: Number(row.duration_minutes) || 30,
    imageUrl: row.image_url || '',
    category: row.category || 'Cortes',
    active: row.active !== false,
    barberCommissionType: row.barber_commission_type || 'PERCENTAGE',
    barberCommissionValue: row.barber_commission_value !== null ? Number(row.barber_commission_value) : 50,
  };
}

export function mapServiceToDb(s: Service): any {
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    price: s.price,
    duration_minutes: s.durationMinutes,
    image_url: s.imageUrl,
    category: s.category,
    active: s.active,
    barber_commission_type: s.barberCommissionType,
    barber_commission_value: s.barberCommissionValue,
  };
}

export function mapBarberFromDb(row: any): Barber {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar || '💈',
    role: row.role || 'Barbero Estilista',
    active: row.active !== false,
  };
}

export function mapBarberToDb(b: Barber): any {
  return {
    id: b.id,
    name: b.name,
    avatar: b.avatar,
    role: b.role,
    active: b.active,
  };
}

export function mapSaleFromDb(row: any): Sale {
  return {
    id: row.id,
    ticketNumber: row.ticket_number,
    barberId: row.barber_id,
    barberName: row.barber_name,
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal) || 0,
    discount: Number(row.discount) || 0,
    tip: Number(row.tip) || 0,
    total: Number(row.total) || 0,
    paymentMethod: row.payment_method,
    amountPaid: Number(row.amount_paid) || 0,
    changeDue: Number(row.change_due) || 0,
    customerNotes: row.customer_notes || undefined,
    totalBarberCommission: Number(row.total_barber_commission) || 0,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapSaleToDb(s: Sale): any {
  return {
    id: s.id,
    ticket_number: s.ticketNumber,
    barber_id: s.barberId,
    barber_name: s.barberName,
    items: s.items,
    subtotal: s.subtotal,
    discount: s.discount,
    tip: s.tip || 0,
    total: s.total,
    payment_method: s.paymentMethod,
    amount_paid: s.amountPaid,
    change_due: s.changeDue,
    customer_notes: s.customerNotes || null,
    total_barber_commission: s.totalBarberCommission || 0,
    created_at: s.createdAt,
  };
}

export function mapInventoryLogFromDb(row: any): InventoryLog {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    changeType: row.change_type,
    quantityChange: Number(row.quantity_change) || 0,
    previousStock: Number(row.previous_stock) || 0,
    newStock: Number(row.new_stock) || 0,
    note: row.note || '',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapInventoryLogToDb(log: InventoryLog): any {
  return {
    id: log.id,
    product_id: log.productId,
    product_name: log.productName,
    change_type: log.changeType,
    quantity_change: log.quantityChange,
    previous_stock: log.previousStock,
    new_stock: log.newStock,
    note: log.note,
    created_at: log.createdAt,
  };
}

export function mapAppointmentFromDb(row: any): Appointment {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    barberId: row.barber_id,
    barberName: row.barber_name,
    serviceId: row.service_id,
    serviceName: row.service_name,
    servicePrice: Number(row.service_price) || 0,
    date: row.date,
    time: row.time,
    status: row.status || 'CONFIRMADA',
    notes: row.notes || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapAppointmentToDb(apt: Appointment): any {
  return {
    id: apt.id,
    customer_name: apt.customerName,
    customer_phone: apt.customerPhone,
    barber_id: apt.barberId,
    barber_name: apt.barberName,
    service_id: apt.serviceId,
    service_name: apt.serviceName,
    service_price: apt.servicePrice,
    date: apt.date,
    time: apt.time,
    status: apt.status,
    notes: apt.notes || null,
    created_at: apt.createdAt,
  };
}

export function mapTicketConfigFromDb(row: any): TicketConfig {
  return {
    businessName: row.business_name || 'BARBAS CUTS',
    subName: row.sub_name || 'BARBER STUDIO',
    address: row.address || '',
    phone: row.phone || '',
    instagram: row.instagram || '',
    footerMessage: row.footer_message || '',
    logoUrl: row.logo_url || '/images/logo_barbas_cuts.svg',
    showCourtesyOnTicket: row.show_courtesy_on_ticket !== false,
    showBarberName: row.show_barber_name !== false,
  };
}

export function mapTicketConfigToDb(cfg: TicketConfig): any {
  return {
    business_name: cfg.businessName,
    sub_name: cfg.subName,
    address: cfg.address,
    phone: cfg.phone,
    instagram: cfg.instagram,
    footer_message: cfg.footerMessage,
    logo_url: cfg.logoUrl,
    show_courtesy_on_ticket: cfg.showCourtesyOnTicket,
    show_barber_name: cfg.showBarberName,
  };
}

