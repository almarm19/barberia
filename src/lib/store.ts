'use client';

import { useState, useEffect, useCallback } from 'react';
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
  UserRole,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SERVICES,
  INITIAL_BARBERS,
  INITIAL_SALES,
  INITIAL_TICKET_CONFIG,
  INITIAL_APPOINTMENTS,
} from './mockData';
import {
  supabase,
  isSupabaseConfigured,
  mapProductFromDb,
  mapProductToDb,
  mapServiceFromDb,
  mapServiceToDb,
  mapBarberFromDb,
  mapBarberToDb,
  mapSaleFromDb,
  mapSaleToDb,
  mapInventoryLogFromDb,
  mapInventoryLogToDb,
  mapAppointmentFromDb,
  mapAppointmentToDb,
  mapTicketConfigFromDb,
  mapTicketConfigToDb,
} from './supabase';

const LOCAL_STORAGE_KEY = 'BARBAS_CUTS_POS_DATA_V1';
const LOCAL_STORAGE_ROLE_KEY = 'BARBAS_CUTS_POS_ROLE_V1';
const LOCAL_STORAGE_PASS_KEY = 'BARBAS_CUTS_ADMIN_PASS_V1';
const LOCAL_STORAGE_CLEARED_MOCK_KEY = 'BARBAS_CUTS_POS_CLEARED_MOCK_V1';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [ticketConfig, setTicketConfig] = useState<TicketConfig>(INITIAL_TICKET_CONFIG);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentRole, setCurrentRoleState] = useState<UserRole>('ADMIN');
  const [adminPassword, setAdminPasswordState] = useState<string>('1234');
  
  // POS State
  const [selectedBarberId, setSelectedBarberId] = useState<string>('b1');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(false);

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    try {
      localStorage.setItem(LOCAL_STORAGE_ROLE_KEY, role);
    } catch (e) {
      console.error('Error saving role to localStorage', e);
    }
  };

  const setAdminPassword = (newPass: string) => {
    setAdminPasswordState(newPass);
    try {
      localStorage.setItem(LOCAL_STORAGE_PASS_KEY, newPass);
    } catch (e) {
      console.error('Error saving admin password to localStorage', e);
    }
  };

  const validateAdminPassword = (pass: string): boolean => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_PASS_KEY) : null;
    const effectivePass = saved || adminPassword || '1234';
    return pass.trim() === effectivePass.trim();
  };

  // Helper function to fetch from Supabase
  const fetchFromSupabase = useCallback(async (): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const [resProds, resServs, resBarbers, resSales, resLogs, resApts, resCfg] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('services').select('*'),
        supabase.from('barbers').select('*'),
        supabase.from('sales').select('*').order('created_at', { ascending: false }),
        supabase.from('inventory_logs').select('*').order('created_at', { ascending: false }),
        supabase.from('appointments').select('*').order('created_at', { ascending: false }),
        supabase.from('ticket_config').select('*').limit(1),
      ]);

      let hasData = false;

      if (!resProds.error && resProds.data) {
        setProducts(resProds.data.map(mapProductFromDb));
        if (resProds.data.length > 0) hasData = true;
      }
      if (!resServs.error && resServs.data) {
        setServices(resServs.data.map(mapServiceFromDb));
        if (resServs.data.length > 0) hasData = true;
      }
      if (!resBarbers.error && resBarbers.data) {
        const mappedBarbers = resBarbers.data.map(mapBarberFromDb);
        setBarbers(mappedBarbers);
        if (mappedBarbers.length > 0) {
          hasData = true;
          setSelectedBarberId((prev) => (mappedBarbers.some((b) => b.id === prev) ? prev : mappedBarbers[0].id));
        }
      }
      if (!resSales.error && resSales.data) {
        setSales(resSales.data.map(mapSaleFromDb));
        if (resSales.data.length > 0) hasData = true;
      }
      if (!resLogs.error && resLogs.data) {
        setInventoryLogs(resLogs.data.map(mapInventoryLogFromDb));
      }
      if (!resApts.error && resApts.data) {
        setAppointments(resApts.data.map(mapAppointmentFromDb));
      }
      if (!resCfg.error && resCfg.data && resCfg.data.length > 0) {
        setTicketConfig(mapTicketConfigFromDb(resCfg.data[0]));
      }

      return hasData;
    } catch (e) {
      console.error('Error fetching from Supabase', e);
      return false;
    }
  }, []);

  // Initialize state from LocalStorage & Supabase
  useEffect(() => {
    let isMounted = true;

    async function initStore() {
      // 1. Roles & Passwords
      try {
        const savedRole = localStorage.getItem(LOCAL_STORAGE_ROLE_KEY);
        if (savedRole === 'ADMIN' || savedRole === 'BARBER') {
          setCurrentRoleState(savedRole);
        }
        const savedPass = localStorage.getItem(LOCAL_STORAGE_PASS_KEY);
        if (savedPass) {
          setAdminPasswordState(savedPass);
        }
      } catch (e) {}

      const clearedMock = typeof window !== 'undefined'
        ? localStorage.getItem(LOCAL_STORAGE_CLEARED_MOCK_KEY) === 'true'
        : false;

      // 2. Load Local Cache first
      let hasLocalData = false;
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed: StoreData = JSON.parse(saved);
          if (parsed.products && parsed.products.length > 0) {
            setProducts(parsed.products);
            hasLocalData = true;
          }
          if (parsed.services && parsed.services.length > 0) {
            setServices(parsed.services);
            hasLocalData = true;
          }
          if (parsed.barbers && parsed.barbers.length > 0) {
            setBarbers(parsed.barbers);
            hasLocalData = true;
            setSelectedBarberId(parsed.barbers[0].id);
          }
          if (parsed.sales) setSales(parsed.sales);
          if (parsed.inventoryLogs) setInventoryLogs(parsed.inventoryLogs);
          if (parsed.ticketConfig) setTicketConfig(parsed.ticketConfig);
          if (parsed.appointments) setAppointments(parsed.appointments);
        }
      } catch (e) {}

      // 3. Connect Supabase or Fallback
      if (isSupabaseConfigured) {
        await fetchFromSupabase();
        if (isMounted) setIsRealtimeActive(true);
      } else if (!hasLocalData && !clearedMock) {
        // Only load mock data if user hasn't explicitly cleared mock data
        setProducts(INITIAL_PRODUCTS);
        setServices(INITIAL_SERVICES);
        setBarbers(INITIAL_BARBERS);
        setSales(INITIAL_SALES);
        setTicketConfig(INITIAL_TICKET_CONFIG);
        setAppointments(INITIAL_APPOINTMENTS);
        setSelectedBarberId(INITIAL_BARBERS[0]?.id || 'b1');
      }

      if (isMounted) setIsLoaded(true);
    }

    initStore();

    // Setup Supabase Realtime channel subscription
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel('public:pos_realtime')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          fetchFromSupabase();
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED' && isMounted) {
            setIsRealtimeActive(true);
          }
        });
    }

    // Setup Cross-tab / Window Storage Event Listener
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
        try {
          const parsed: StoreData = JSON.parse(e.newValue);
          setProducts(parsed.products || []);
          setServices(parsed.services || []);
          setBarbers(parsed.barbers || []);
          setSales(parsed.sales || []);
          setInventoryLogs(parsed.inventoryLogs || []);
          setTicketConfig(parsed.ticketConfig || INITIAL_TICKET_CONFIG);
          setAppointments(parsed.appointments || []);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorage);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchFromSupabase]);

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

  // HELPER TO CLEAR ALL MOCK DATA & START CLEAN
  const clearAllMockData = async () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CLEARED_MOCK_KEY, 'true');
      setProducts([]);
      setServices([]);
      setSales([]);
      setInventoryLogs([]);
      setAppointments([]);
      setCart([]);
      setCustomerNotes('');
      setDiscountAmount(0);

      const defaultBarbers: Barber[] = [
        { id: 'b1', name: 'Carlos "Barbas"', avatar: '🧔🏻‍♂️', role: 'Barbero Principal', active: true },
      ];
      setBarbers(defaultBarbers);
      setSelectedBarberId('b1');

      persist({
        products: [],
        services: [],
        barbers: defaultBarbers,
        sales: [],
        inventoryLogs: [],
        appointments: [],
      });

      if (isSupabaseConfigured && supabase) {
        await Promise.all([
          supabase.from('products').delete().neq('id', ''),
          supabase.from('services').delete().neq('id', ''),
          supabase.from('sales').delete().neq('id', ''),
          supabase.from('inventory_logs').delete().neq('id', ''),
          supabase.from('appointments').delete().neq('id', ''),
        ]);
        await supabase.from('barbers').upsert(defaultBarbers.map(mapBarberToDb));
      }
    } catch (e) {
      console.error('Failed to clear mock data', e);
    }
  };

  // HELPER TO CALCULATE ITEM BARBER COMMISSION UNIT
  const getItemCommissionUnit = (
    type: ItemType,
    itemId: string,
    unitPrice: number,
    isCourtesy: boolean = false
  ): number => {
    if (isCourtesy) return 0;
    if (type === 'SERVICE') {
      const s = services.find((serv) => serv.id === itemId);
      if (s && s.barberCommissionValue !== undefined && s.barberCommissionValue !== null) {
        if (s.barberCommissionType === 'FIXED') {
          return s.barberCommissionValue;
        }
        return (unitPrice * s.barberCommissionValue) / 100;
      }
      return unitPrice * 0.5; // Default 50% for service if unconfigured
    } else {
      const p = products.find((prod) => prod.id === itemId);
      if (p && p.barberCommissionValue !== undefined && p.barberCommissionValue !== null) {
        if (p.barberCommissionType === 'PERCENTAGE') {
          return (unitPrice * p.barberCommissionValue) / 100;
        }
        return p.barberCommissionValue;
      }
      return 0; // Default 0 for product
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

    const commissionUnit = getItemCommissionUnit(
      item.type,
      item.id,
      isCourtesy ? 0 : item.price,
      isCourtesy
    );

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      updatedCart[existingIndex].barberCommissionUnit = commissionUnit;
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
        barberCommissionUnit: commissionUnit,
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
          const newUnitPrice = newCourtesy ? 0 : item.originalPrice;
          const commissionUnit = getItemCommissionUnit(
            item.type,
            item.itemId,
            newUnitPrice,
            newCourtesy
          );
          return {
            ...item,
            isCourtesy: newCourtesy,
            unitPrice: newUnitPrice,
            barberCommissionUnit: commissionUnit,
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
    amountPaid: number,
    tipAmount: number = 0
  ): Sale => {
    const defaultBarber = { id: 'b1', name: 'Carlos "Barbas"', avatar: '🧔🏻‍♂️', active: true };
    const selectedBarber = barbers.find((b) => b.id === selectedBarberId) || barbers[0] || defaultBarber;
    const ticketNum = `T-${1000 + sales.length + 1}`;
    const now = new Date().toISOString();

    const itemsWithCommissions = cart.map((ci) => {
      const commUnit = getItemCommissionUnit(ci.type, ci.itemId, ci.unitPrice, ci.isCourtesy);
      return {
        ...ci,
        barberCommissionUnit: commUnit,
      };
    });

    const totalBarberCommission = itemsWithCommissions.reduce(
      (sum, item) => sum + (item.barberCommissionUnit || 0) * item.quantity,
      0
    );

    const grandTotalPaidByClient = cartTotal + tipAmount;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      ticketNumber: ticketNum,
      barberId: selectedBarber.id,
      barberName: selectedBarber.name,
      items: itemsWithCommissions,
      subtotal: cartSubtotal,
      discount: discountAmount,
      tip: tipAmount,
      total: cartTotal,
      paymentMethod,
      amountPaid: paymentMethod === 'EFECTIVO' ? amountPaid : grandTotalPaidByClient,
      changeDue: paymentMethod === 'EFECTIVO' ? Math.max(0, amountPaid - grandTotalPaidByClient) : 0,
      createdAt: now,
      customerNotes: customerNotes.trim() || undefined,
      totalBarberCommission,
    };

    // Deduct stock for Products and Beverages
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

    // Write to Supabase in background
    if (isSupabaseConfigured && supabase) {
      const db = supabase;
      db.from('sales').insert(mapSaleToDb(newSale)).then(({ error }) => {
        if (error) console.error('Error persisting sale to Supabase', error);
      });
      if (newLogs.length > 0) {
        db.from('inventory_logs').insert(newLogs.map(mapInventoryLogToDb)).then();
      }
      updatedProducts.forEach((p) => {
        db.from('products').upsert(mapProductToDb(p)).then();
      });
    }

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

    let logToSave: InventoryLog | null = null;
    if (newProd.stock > 0) {
      logToSave = {
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
      const updatedLogs = [logToSave, ...inventoryLogs];
      setInventoryLogs(updatedLogs);
      persist({ products: updated, inventoryLogs: updatedLogs });
    }

    if (isSupabaseConfigured && supabase) {
      supabase.from('products').insert(mapProductToDb(newProd)).then();
      if (logToSave) {
        supabase.from('inventory_logs').insert(mapInventoryLogToDb(logToSave)).then();
      }
    }
  };

  const updateProduct = (updated: Product) => {
    const list = products.map((p) => (p.id === updated.id ? updated : p));
    setProducts(list);
    persist({ products: list });

    if (isSupabaseConfigured && supabase) {
      supabase.from('products').upsert(mapProductToDb(updated)).then();
    }
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

    if (isSupabaseConfigured && supabase) {
      const p = list.find((item) => item.id === productId);
      if (p) supabase.from('products').upsert(mapProductToDb(p)).then();
      if (logToSave) supabase.from('inventory_logs').insert(mapInventoryLogToDb(logToSave)).then();
    }
  };

  const deleteProduct = (id: string) => {
    const list = products.filter((p) => p.id !== id);
    setProducts(list);
    persist({ products: list });

    if (isSupabaseConfigured && supabase) {
      supabase.from('products').delete().eq('id', id).then();
    }
  };

  // SERVICE MANAGEMENT ACTIONS
  const addService = (service: Omit<Service, 'id'>) => {
    const newServ: Service = { ...service, id: `s-${Date.now()}` };
    const updated = [...services, newServ];
    setServices(updated);
    persist({ services: updated });

    if (isSupabaseConfigured && supabase) {
      supabase.from('services').insert(mapServiceToDb(newServ)).then();
    }
  };

  const updateService = (updated: Service) => {
    const list = services.map((s) => (s.id === updated.id ? updated : s));
    setServices(list);
    persist({ services: list });

    if (isSupabaseConfigured && supabase) {
      supabase.from('services').upsert(mapServiceToDb(updated)).then();
    }
  };

  const deleteService = (id: string) => {
    const list = services.filter((s) => s.id !== id);
    setServices(list);
    persist({ services: list });

    if (isSupabaseConfigured && supabase) {
      supabase.from('services').delete().eq('id', id).then();
    }
  };

  // BARBER MANAGEMENT ACTIONS
  const addBarber = (barber: Omit<Barber, 'id'>) => {
    const newBarber: Barber = { ...barber, id: `b-${Date.now()}` };
    const updated = [...barbers, newBarber];
    setBarbers(updated);
    persist({ barbers: updated });

    if (isSupabaseConfigured && supabase) {
      supabase.from('barbers').insert(mapBarberToDb(newBarber)).then();
    }
  };

  const updateBarber = (updated: Barber) => {
    const list = barbers.map((b) => (b.id === updated.id ? updated : b));
    setBarbers(list);
    persist({ barbers: list });

    if (isSupabaseConfigured && supabase) {
      supabase.from('barbers').upsert(mapBarberToDb(updated)).then();
    }
  };

  const deleteBarber = (id: string) => {
    const list = barbers.filter((b) => b.id !== id);
    setBarbers(list);
    if (selectedBarberId === id && list.length > 0) {
      setSelectedBarberId(list[0].id);
    }
    persist({ barbers: list });

    if (isSupabaseConfigured && supabase) {
      supabase.from('barbers').delete().eq('id', id).then();
    }
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

    if (isSupabaseConfigured && supabase) {
      supabase.from('appointments').insert(mapAppointmentToDb(newApt)).then();
    }
  };

  const updateAppointment = (updated: Appointment) => {
    const list = appointments.map((a) => (a.id === updated.id ? updated : a));
    setAppointments(list);
    persist({ appointments: list });

    if (isSupabaseConfigured && supabase) {
      supabase.from('appointments').upsert(mapAppointmentToDb(updated)).then();
    }
  };

  const deleteAppointment = (id: string) => {
    const list = appointments.filter((a) => a.id !== id);
    setAppointments(list);
    persist({ appointments: list });

    if (isSupabaseConfigured && supabase) {
      supabase.from('appointments').delete().eq('id', id).then();
    }
  };

  // Convert appointment directly to POS cashier cart
  const convertAppointmentToCart = (apt: Appointment) => {
    setSelectedBarberId(apt.barberId);
    
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

    updateAppointment({
      ...apt,
      status: 'COMPLETADA',
    });
  };

  // TICKET CONFIG ACTIONS
  const updateTicketConfig = (config: TicketConfig) => {
    setTicketConfig(config);
    persist({ ticketConfig: config });

    if (isSupabaseConfigured && supabase) {
      supabase.from('ticket_config').upsert(mapTicketConfigToDb(config)).then();
    }
  };

  return {
    isLoaded,
    isSupabaseConfigured,
    isRealtimeActive,
    currentRole,
    setCurrentRole,
    adminPassword,
    setAdminPassword,
    validateAdminPassword,
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
    clearAllMockData,
    fetchFromSupabase,
  };
}
