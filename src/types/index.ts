export type UserRole = 'ADMIN' | 'BARBER';

export type ItemType = 'SERVICE' | 'PRODUCT' | 'BEVERAGE';

export type CommissionType = 'FIXED' | 'PERCENTAGE';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Precio de venta
  cost: number;  // Costo de compra
  stock: number; // Existencia
  minStock: number; // Stock mínimo para alerta
  imageUrl: string;
  category: string;
  isBeverage: boolean;
  active: boolean;
  createdAt: string;
  barberCommissionType?: CommissionType; // 'FIXED' | 'PERCENTAGE'
  barberCommissionValue?: number;        // Monto en $ o Porcentaje %
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  imageUrl: string;
  category: string;
  active: boolean;
  barberCommissionType?: CommissionType; // 'FIXED' | 'PERCENTAGE'
  barberCommissionValue?: number;        // Monto en $ o Porcentaje %
}

export interface Barber {
  id: string;
  name: string;
  avatar: string;
  role?: string;
  active: boolean;
}

export interface CartItem {
  id: string; // unique cart item id
  itemId: string;
  type: ItemType;
  name: string;
  unitPrice: number; // 0 if isCourtesy is true
  originalPrice: number;
  quantity: number;
  isCourtesy?: boolean; // Only for beverages or special courtesy items
  imageUrl?: string;
  barberCommissionUnit?: number; // Comisión por unidad para el barbero
}

export type PaymentMethod = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';

export interface SaleItem {
  id: string;
  saleId: string;
  itemType: ItemType;
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  isCourtesy: boolean;
  totalPrice: number;
  barberCommissionUnit?: number;
}

export interface Sale {
  id: string;
  ticketNumber: string;
  barberId: string;
  barberName: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tip?: number; // Propina para el barbero
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeDue: number;
  createdAt: string;
  customerNotes?: string;
  totalBarberCommission?: number; // Suma total de comisiones de esta venta para el barbero
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  changeType: 'VENTA' | 'ENTRADA' | 'AJUSTE' | 'CORTESIA';
  quantityChange: number;
  previousStock: number;
  newStock: number;
  note: string;
  createdAt: string;
}

export interface TicketConfig {
  businessName: string;
  subName: string;
  address: string;
  phone: string;
  instagram: string;
  footerMessage: string;
  logoUrl: string;
  showCourtesyOnTicket: boolean;
  showBarberName: boolean;
  adminPassword?: string;
}

export type AppointmentStatus = 'CONFIRMADA' | 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA';

export interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}
