'use client';

import { useState, useEffect } from 'react';
import {
  Product,
  Service,
  Barber,
  CartItem,
  Sale,
  InventoryLog,
  TicketConfig,
  ItemType,
  PaymentMethod,
  Appointment,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SERVICES,
  INITIAL_BARBERS,
  INITIAL_SALES,
  INITIAL_TICKET_CONFIG,
  INITIAL_APPOINTMENTS,
} from './mockData';

const LOCAL_STORAGE_KEY = 'BARBAS_CUTS_POS_DATA_V1';

interface StoreData {
  products: Product[];
  services: Service[];
  barbers: Barber[];
  sales: Sale[];
  inventoryLogs: InventoryLog[];
  ticketConfig: TicketConfig;
  appointments: Appointment[];
}

export function useBarberStore() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [barbers, setBarbers] = useState<Barber[]>(INITIAL_BARBERS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [ticketConfig, setTicketConfig] = useState<TicketConfig>(INITIAL_TICKET_CONFIG);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  
  // POS State
  const [selectedBarberId, setSelectedBarberId] = useState<string>('b1');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed: StoreData = JSON.parse(saved);
        setProducts(parsed.products || INITIAL_PRODUCTS);
        setServices(parsed.services || INITIAL_SERVICES);
        setBarbers(parsed.barbers || INITIAL_BARBERS);
        setSales(parsed.sales || INITIAL_SALES);
        setInventoryLogs(parsed.inventoryLogs || []);
        setTicketConfig(parsed.ticketConfig || INITIAL_TICKET_CONFIG);
        setAppointments(parsed.appointments || INITIAL_APPOINTMENTS);
      } else {
        setProducts(INITIAL_PRODUCTS);
        setServices(INITIAL_SERVICES);
        setBarbers(INITIAL_BARBERS);
        setSales(INITIAL_SALES);
        setInventoryLogs([]);
        setTicketConfig(INITIAL_TICKET_CONFIG);
        setAppointments(INITIAL_APPOINTMENTS);
      }
    } catch (e) {
      console.error('Failed to load local storage', e);
      setProducts(INITIAL_PRODUCTS);
      setServices(INITIAL_SERVICES);
      setBarbers(INITIAL_BARBERS);
      setSales(INITIAL_SALES);
      setTicketConfig(INITIAL_TICKET_CONFIG);
      setAppointments(INITIAL_APPOINTMENTS);
    }
    setIsLoaded(true);
  }, []);

  // Save changes to LocalStorage
  const persist = (dataToSave: Partial<StoreData>) => {
    try {
      const current: StoreData = {
        products: dataToSave.products ?? products,
        services: dataToSave.services ?? services,
        barbers: dataToSave.barbers ?? barbers,
        sales: dataToSave.sales ?? sales,
        inventoryLogs: dataToSave.inventoryLogs ?? inventoryLogs,
        ticketConfig: dataToSave.ticketConfig ?? ticketConfig,
        appointments: dataToSave.appointments ?? appointments,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.error('Failed to persist store state', e);
    }
  };

  // CART ACTIONS
  const addToCart = (
    item: { id: string; name: string; price: number; type: ItemType; isBeverage?: boolean; imageUrl?: string },
    isCourtesy: boolean = false
  ) => {
    const existingIndex = cart.findIndex(
      (ci) => ci.itemId === item.id && Boolean(ci.isCourtesy) === isCourtesy
    );

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        itemId: item.id,
        type: item.type,
        name: item.name,
        unitPrice: isCourtesy ? 0 : item.price,
        originalPrice: item.price,
        quantity: 1,
        isCourtesy: isCourtesy,
        imageUrl: item.imageUrl,
      };
      setCart([...cart, newItem]);
    }
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const toggleCartCourtesy = (cartItemId: string) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const newCourtesy = !item.isCourtesy;
          return {
            ...item,
            isCourtesy: newCourtesy,
            unitPrice: newCourtesy ? 0 : item.originalPrice,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerNotes('');
    setDiscountAmount(0);
  };

  // CALCULATIONS
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const cartTotal = Math.max(0, cartSubtotal - discountAmount);

  // CHECKOUT SALE REGISTRATION
  const registerSale = (
    paymentMethod: PaymentMethod,
    amountPaid: number
  ): Sale => {
    const defaultBarber = { id: 'b1', name: 'Carlos "Barbas"', avatar: '🧔🏻‍♂️', active: true };
    const selectedBarber = barbers.find((b) => b.id === selectedBarberId) || barbers[0] || defaultBarber;
    const ticketNum = `T-${1000 + sales.length + 1}`;
    const now = new Date().toISOString();

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      ticketNumber: ticketNum,
      barberId: selectedBarber.id,
      barberName: selectedBarber.name,
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discountAmount,
      total: cartTotal,
      paymentMethod,
      amountPaid: paymentMethod === 'EFECTIVO' ? amountPaid : cartTotal,
      changeDue: paymentMethod === 'EFECTIVO' ? Math.max(0, amountPaid - cartTotal) : 0,
      createdAt: now,
      customerNotes: customerNotes.trim() || undefined,
    };

    // Deduct stock for Products and Beverages (Whether paid or courtesy)
    const newLogs: InventoryLog[] = [];
    const updatedProducts = products.map((prod) => {
      const cartItemsForProd = cart.filter(
        (ci) => ci.itemId === prod.id && (ci.type === 'PRODUCT' || ci.type === 'BEVERAGE')
      );

      if (cartItemsForProd.length === 0) return prod;

      const totalQtyDeducted = cartItemsForProd.reduce(
        (sum, ci) => sum + ci.quantity,
        0
      );

      const hasCourtesy = cartItemsForProd.some((ci) => ci.isCourtesy);

      const previousStock = prod.stock;
      const newStock = Math.max(0, prod.stock - totalQtyDeducted);

      newLogs.push({
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: prod.id,
        productName: prod.name,
        changeType: hasCourtesy ? 'CORTESIA' : 'VENTA',
        quantityChange: -totalQtyDeducted,
        previousStock,
        newStock,
        note: `Venta Ticket #${ticketNum} (${selectedBarber.name})`,
        createdAt: now,
      });

      return {
        ...prod,
        stock: newStock,
      };
    });

    const updatedSales = [newSale, ...sales];
    const updatedLogs = [...newLogs, ...inventoryLogs];

    setProducts(updatedProducts);
    setSales(updatedSales);
    setInventoryLogs(updatedLogs);

    persist({
      products: updatedProducts,
      sales: updatedSales,
      inventoryLogs: updatedLogs,
    });

    clearCart();
    return newSale;
  };

  // PRODUCT MANAGEMENT ACTIONS
  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = {
      ...product,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newProd, ...products];
    setProducts(updated);
    persist({ products: updated });

    // Log initial stock entry
    if (newProd.stock > 0) {
      const log: InventoryLog = {
        id: `log-${Date.now()}`,
        productId: newProd.id,
        productName: newProd.name,
        changeType: 'ENTRADA',
        quantityChange: newProd.stock,
        previousStock: 0,
        newStock: newProd.stock,
        note: 'Stock inicial de creación de producto',
        createdAt: new Date().toISOString(),
      };
      const updatedLogs = [log, ...inventoryLogs];
      setInventoryLogs(updatedLogs);
      persist({ inventoryLogs: updatedLogs });
    }
  };

  const updateProduct = (updated: Product) => {
    const list = products.map((p) => (p.id === updated.id ? updated : p));
    setProducts(list);
    persist({ products: list });
  };

  const adjustStock = (productId: string, delta: number, note: string) => {
    let logToSave: InventoryLog | null = null;

    const list = products.map((p) => {
      if (p.id === productId) {
        const prev = p.stock;
        const newStock = Math.max(0, p.stock + delta);

        logToSave = {
          id: `log-${Date.now()}`,
          productId: p.id,
          productName: p.name,
          changeType: delta > 0 ? 'ENTRADA' : 'AJUSTE',
          quantityChange: delta,
          previousStock: prev,
          newStock,
          note: note || 'Ajuste manual de inventario',
          createdAt: new Date().toISOString(),
        };

        return { ...p, stock: newStock };
      }
      return p;
    });

    setProducts(list);
    let updatedLogs = inventoryLogs;
    if (logToSave) {
      updatedLogs = [logToSave, ...inventoryLogs];
      setInventoryLogs(updatedLogs);
    }
    persist({ products: list, inventoryLogs: updatedLogs });
  };

  const deleteProduct = (id: string) => {
    const list = products.filter((p) => p.id !== id);
    setProducts(list);
    persist({ products: list });
  };

  // SERVICE MANAGEMENT ACTIONS
  const addService = (service: Omit<Service, 'id'>) => {
    const newServ: Service = { ...service, id: `s-${Date.now()}` };
    const updated = [...services, newServ];
    setServices(updated);
    persist({ services: updated });
  };

  const updateService = (updated: Service) => {
    const list = services.map((s) => (s.id === updated.id ? updated : s));
    setServices(list);
    persist({ services: list });
  };

  const deleteService = (id: string) => {
    const list = services.filter((s) => s.id !== id);
    setServices(list);
    persist({ services: list });
  };

  // BARBER MANAGEMENT ACTIONS
  const addBarber = (barber: Omit<Barber, 'id'>) => {
    const newBarber: Barber = { ...barber, id: `b-${Date.now()}` };
    const updated = [...barbers, newBarber];
    setBarbers(updated);
    persist({ barbers: updated });
  };

  const updateBarber = (updated: Barber) => {
    const list = barbers.map((b) => (b.id === updated.id ? updated : b));
    setBarbers(list);
    persist({ barbers: list });
  };

  const deleteBarber = (id: string) => {
    const list = barbers.filter((b) => b.id !== id);
    setBarbers(list);
    if (selectedBarberId === id && list.length > 0) {
      setSelectedBarberId(list[0].id);
    }
    persist({ barbers: list });
  };

  // APPOINTMENT MANAGEMENT ACTIONS
  const addAppointment = (appointment: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newApt: Appointment = {
      ...appointment,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newApt, ...appointments];
    setAppointments(updated);
    persist({ appointments: updated });
  };

  const updateAppointment = (updated: Appointment) => {
    const list = appointments.map((a) => (a.id === updated.id ? updated : a));
    setAppointments(list);
    persist({ appointments: list });
  };

  const deleteAppointment = (id: string) => {
    const list = appointments.filter((a) => a.id !== id);
    setAppointments(list);
    persist({ appointments: list });
  };

  // Convert appointment directly to POS cashier cart
  const convertAppointmentToCart = (apt: Appointment) => {
    setSelectedBarberId(apt.barberId);
    
    // Check if service exists
    const matchingService = services.find((s) => s.id === apt.serviceId);
    
    const cartItem: CartItem = {
      id: `cart-apt-${Date.now()}`,
      itemId: apt.serviceId,
      type: 'SERVICE',
      name: apt.serviceName,
      unitPrice: apt.servicePrice,
      originalPrice: apt.servicePrice,
      quantity: 1,
      imageUrl: matchingService?.imageUrl,
    };

    setCart([cartItem]);
    if (apt.customerName) {
      setCustomerNotes(`Cita de ${apt.customerName} (${apt.customerPhone})`);
    }

    // Mark appointment as COMPLETED
    updateAppointment({
      ...apt,
      status: 'COMPLETADA',
    });
  };

  // TICKET CONFIG ACTIONS
  const updateTicketConfig = (config: TicketConfig) => {
    setTicketConfig(config);
    persist({ ticketConfig: config });
  };

  return {
    isLoaded,
    products,
    services,
    barbers,
    sales,
    inventoryLogs,
    ticketConfig,
    appointments,
    // POS State
    selectedBarberId,
    setSelectedBarberId,
    cart,
    cartSubtotal,
    cartTotal,
    discountAmount,
    setDiscountAmount,
    customerNotes,
    setCustomerNotes,
    // Actions
    addToCart,
    updateCartQuantity,
    toggleCartCourtesy,
    removeFromCart,
    clearCart,
    registerSale,
    // Management
    addProduct,
    updateProduct,
    adjustStock,
    deleteProduct,
    addService,
    updateService,
    deleteService,
    addBarber,
    updateBarber,
    deleteBarber,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    convertAppointmentToCart,
    updateTicketConfig,
  };
}
