'use client';

import React, { useState } from 'react';
import { useBarberStore } from '../../lib/store';
import { ItemType, PaymentMethod, CartItem, Product, Service, Sale } from '../../types';
import { TicketModal } from './TicketModal';
import { BarberManagerModal } from './BarberManagerModal';
import {
  Scissors,
  Package,
  GlassWater,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Gift,
  CheckCircle2,
  DollarSign,
  UserCheck,
  CreditCard,
  Banknote,
  QrCode,
  Tag,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function POSView() {
  const {
    products,
    services,
    barbers,
    selectedBarberId,
    setSelectedBarberId,
    cart,
    cartSubtotal,
    cartTotal,
    discountAmount,
    setDiscountAmount,
    customerNotes,
    setCustomerNotes,
    addToCart,
    updateCartQuantity,
    toggleCartCourtesy,
    removeFromCart,
    clearCart,
    registerSale,
    updateBarber,
    ticketConfig,
  } = useBarberStore();

  const [activeTab, setActiveTab] = useState<'SERVICES' | 'PRODUCTS' | 'BEVERAGES'>('SERVICES');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFECTIVO');
  const [cashGiven, setCashGiven] = useState<string>('');
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [customTipInput, setCustomTipInput] = useState<string>('');
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showBarberModal, setShowBarberModal] = useState(false);

  // Beverage selection modal state
  const [selectedBeverageItem, setSelectedBeverageItem] = useState<Product | null>(null);

  const defaultBarber = { id: 'b1', name: 'Carlos "Barbas"', avatar: '🧔🏻‍♂️', active: true };
  const selectedBarber = barbers.find((b) => b.id === selectedBarberId) || barbers[0] || defaultBarber;

  const handleBeverageClick = (product: Product) => {
    setSelectedBeverageItem(product);
  };

  const confirmBeverageAdd = (isCourtesy: boolean) => {
    if (!selectedBeverageItem) return;
    addToCart(
      {
        id: selectedBeverageItem.id,
        name: selectedBeverageItem.name,
        price: selectedBeverageItem.price,
        type: 'BEVERAGE',
        imageUrl: selectedBeverageItem.imageUrl,
      },
      isCourtesy
    );
    setSelectedBeverageItem(null);
  };

  const totalWithTip = cartTotal + tipAmount;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cashNum = parseFloat(cashGiven) || totalWithTip;
    if (paymentMethod === 'EFECTIVO' && cashNum < totalWithTip) {
      alert(`El efectivo ingresado ($${cashNum}) es menor al total a cobrar ($${totalWithTip})`);
      return;
    }

    const sale = registerSale(paymentMethod, cashNum, tipAmount);
    setShowCheckoutModal(false);
    setCompletedSale(sale);
    setCashGiven('');
    setTipAmount(0);
    setCustomTipInput('');

    // Trigger celebratory confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#FFD700', '#FFFFFF', '#AA7C11'],
      });
    } catch (e) {
      // ignore
    }
  };

  // Filters
  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredProducts = products
    .filter((p) => !p.isBeverage)
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredBeverages = products
    .filter((p) => p.isBeverage)
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-4rem)] bg-zinc-950 text-white gap-4 p-4 lg:p-6 overflow-hidden">
      {/* LEFT / MAIN CATALOG AREA */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* BARBER SELECTOR STRIP (iPad Friendly Touch Target) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-amber-500" />
              Selecciona al Barbero que atendió:
            </label>
            <button
              onClick={() => setShowBarberModal(true)}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              ⚙️ Gestionar Equipo / Barberos
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {barbers.map((barber) => {
              const isSelected = barber.id === selectedBarberId;
              return (
                <button
                  key={barber.id}
                  onClick={() => setSelectedBarberId(barber.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left active:scale-95 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold shadow-md shadow-amber-500/10'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-2xl">{barber.avatar}</span>
                  <div className="truncate flex-1">
                    <p className="text-sm font-semibold truncate">{barber.name}</p>
                    <p className="text-[10px] text-zinc-500">Barbero Activo</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* TABS & SEARCH BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-3 shadow-lg">
          {/* Main category tabs */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('SERVICES')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs transition-all ${
                activeTab === 'SERVICES'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Scissors className="w-4 h-4" />
              Servicios
            </button>
            <button
              onClick={() => setActiveTab('PRODUCTS')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs transition-all ${
                activeTab === 'PRODUCTS'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Package className="w-4 h-4" />
              Productos
            </button>
            <button
              onClick={() => setActiveTab('BEVERAGES')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs transition-all relative ${
                activeTab === 'BEVERAGES'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <GlassWater className="w-4 h-4 text-amber-300" />
              Bebidas & Cortesías
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-zinc-950 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase shadow">
                Cortesia
              </span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* CATALOG GRID CONTENT */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* TAB 1: SERVICES */}
          {activeTab === 'SERVICES' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() =>
                    addToCart({
                      id: service.id,
                      name: service.name,
                      price: service.price,
                      type: 'SERVICE',
                      imageUrl: service.imageUrl,
                    })
                  }
                  className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group shadow-lg"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                      {/* eslint-disable-next-html-element-for-responsive-img */}
                      <img
                        src={service.imageUrl || '/images/corte_skin_fade.png'}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-0.5">
                        {service.category}
                      </span>
                      <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                        {service.name}
                      </h4>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                    <span className="text-xs text-zinc-500">⏱ {service.durationMinutes} min</span>
                    <span className="text-base font-extrabold text-amber-400 font-mono">
                      ${service.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'PRODUCTS' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    if (product.stock <= 0) return;
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      type: 'PRODUCT',
                      imageUrl: product.imageUrl,
                    });
                  }}
                  className={`bg-zinc-900 border rounded-2xl p-4 flex flex-col justify-between transition-all shadow-lg ${
                    product.stock > 0
                      ? 'border-zinc-800 hover:border-amber-500/50 cursor-pointer hover:scale-[1.02] active:scale-95 group'
                      : 'border-red-900/40 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                      {/* eslint-disable-next-html-element-for-responsive-img */}
                      <img
                        src={product.imageUrl || '/images/pomada_mate.png'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                          {product.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            product.stock <= product.minStock
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          Stock: {product.stock}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                    <span className="text-xs text-zinc-500">Costo almacén</span>
                    <span className="text-base font-extrabold text-amber-400 font-mono">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: BEVERAGES (WITH COURTESY vs SALE CHOICE) */}
          {activeTab === 'BEVERAGES' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredBeverages.map((beverage) => (
                <div
                  key={beverage.id}
                  className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between shadow-lg group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                      {/* eslint-disable-next-html-element-for-responsive-img */}
                      <img
                        src={beverage.imageUrl || '/images/whiskey.png'}
                        alt={beverage.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                          <GlassWater className="w-3 h-3" /> Bebida
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                          Stock: {beverage.stock}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-white line-clamp-1">
                        {beverage.name}
                      </h4>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                        {beverage.description}
                      </p>
                    </div>
                  </div>

                  {/* Dual buttons for Beverage: Sale ($) vs Courtesy (Free) */}
                  <div className="pt-2 border-t border-zinc-800 flex items-center gap-2">
                    <button
                      onClick={() =>
                        addToCart(
                          {
                            id: beverage.id,
                            name: beverage.name,
                            price: beverage.price,
                            type: 'BEVERAGE',
                            imageUrl: beverage.imageUrl,
                          },
                          false
                        )
                      }
                      className="flex-1 py-2 px-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                      Venta ${beverage.price}
                    </button>

                    <button
                      onClick={() =>
                        addToCart(
                          {
                            id: beverage.id,
                            name: beverage.name,
                            price: beverage.price,
                            type: 'BEVERAGE',
                            imageUrl: beverage.imageUrl,
                          },
                          true
                        )
                      }
                      className="flex-1 py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95"
                    >
                      <Gift className="w-3.5 h-3.5 text-emerald-400" />
                      Cortesía ($0)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR / CART PANEL (iPad Fixed Sticky) */}
      <div className="w-full lg:w-96 lg:sticky lg:top-4 lg:h-[calc(100vh-5.5rem)] bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between shadow-2xl overflow-hidden shrink-0">
        {/* Cart Header */}
        <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-white">Carrito del Ticket</h3>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Vaciar
            </button>
          )}
        </div>

        {/* Selected Barber Info Badge */}
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs">
          <span className="text-zinc-400">Atendido por:</span>
          <span className="font-bold text-amber-400 flex items-center gap-1">
            <span>{selectedBarber.avatar}</span> {selectedBarber.name}
          </span>
        </div>

        {/* Cart Line Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-3">
              <div className="w-16 h-16 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <p className="font-semibold text-sm">El carrito está vacío</p>
              <p className="text-xs text-zinc-600 max-w-[200px]">
                Selecciona servicios, productos o bebidas de cortesía para agregarlos al ticket.
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const isCourtesy = Boolean(item.isCourtesy);
              return (
                <div
                  key={item.id}
                  className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 flex flex-col gap-2 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-bold text-xs text-white truncate">{item.name}</h5>
                      </div>
                      {isCourtesy && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mt-1">
                          <Gift className="w-3 h-3" /> Cortesía ($0.00)
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Price & Quantity Control */}
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                    {/* Toggle Courtesy if item is Beverage */}
                    {item.type === 'BEVERAGE' ? (
                      <button
                        onClick={() => toggleCartCourtesy(item.id)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                          isCourtesy
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                        }`}
                      >
                        {isCourtesy ? 'Cambiar a Venta ($)' : 'Marcar Cortesía ($0)'}
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-500">
                        ${item.unitPrice.toFixed(2)} c/u
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="p-1 text-zinc-400 hover:text-white"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold font-mono">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="p-1 text-zinc-400 hover:text-white"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="font-mono text-sm font-extrabold text-amber-400">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cart Totals & Checkout Trigger */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 space-y-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal:</span>
              <span className="font-mono text-white">${cartSubtotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-red-400">
                <span>Descuento:</span>
                <span className="font-mono">-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between font-extrabold text-base text-white pt-2 border-t border-zinc-800">
              <span>Total a Cobrar:</span>
              <span className="font-mono text-amber-400 text-lg">${cartTotal.toFixed(2)} MXN</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={() => setShowCheckoutModal(true)}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-98 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Cobrar e Imprimir Ticket
          </button>
        </div>
      </div>

      {/* CHECKOUT MODAL (Payment Method & Cash Change) */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-500" />
                Registrar Pago de Ticket
              </h3>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-2 block">
                  Método de Pago:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('EFECTIVO')}
                    className={`py-3 px-2 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'EFECTIVO'
                        ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-md'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Banknote className="w-5 h-5" />
                    Efectivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('TARJETA')}
                    className={`py-3 px-2 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'TARJETA'
                        ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-md'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    Tarjeta
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('TRANSFERENCIA')}
                    className={`py-3 px-2 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'TRANSFERENCIA'
                        ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-md'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    Transferencia
                  </button>
                </div>
              </div>

              {/* Tip Selector */}
              <div className="space-y-2 bg-zinc-950/70 p-3 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <span>🎁</span>
                    <span>Propina para {selectedBarber.name}:</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    +${tipAmount.toFixed(2)} MXN
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 20, 50, Math.round(cartTotal * 0.1)].map((amt, idx) => {
                    const label = idx === 0 ? 'Sin propina' : idx === 3 ? '10%' : `$${amt}`;
                    const isSelected = tipAmount === amt && customTipInput === '';
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setTipAmount(amt);
                          setCustomTipInput('');
                        }}
                        className={`py-2 px-1 rounded-lg text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-amber-500 text-zinc-950 border-amber-500 font-extrabold'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-zinc-400">Otra cantidad:</span>
                  <input
                    type="number"
                    step="5"
                    placeholder="Monto $"
                    value={customTipInput}
                    onChange={(e) => {
                      setCustomTipInput(e.target.value);
                      const val = parseFloat(e.target.value) || 0;
                      setTipAmount(val);
                    }}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Total Summary Breakdown */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal Servicios/Productos:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                {tipAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Propina Barbero:</span>
                    <span>+${tipAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-white pt-1.5 border-t border-zinc-800">
                  <span>TOTAL A COBRAR:</span>
                  <span className="text-amber-400 text-base">${totalWithTip.toFixed(2)} MXN</span>
                </div>
              </div>

              {/* Cash given input if Efectivo */}
              {paymentMethod === 'EFECTIVO' && (
                <div className="space-y-2 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <label className="text-xs font-semibold text-zinc-400 block">
                    Monto Recibido en Efectivo:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={totalWithTip}
                    placeholder={`$${totalWithTip.toFixed(2)}`}
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-lg font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                    autoFocus
                  />
                  {cashGiven && parseFloat(cashGiven) >= totalWithTip && (
                    <div className="flex justify-between items-center text-sm font-bold text-emerald-400 pt-2 border-t border-zinc-800">
                      <span>Cambio a Entregar:</span>
                      <span className="font-mono text-base">
                        ${(parseFloat(cashGiven) - totalWithTip).toFixed(2)} MXN
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Sale Button */}
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-black text-base uppercase rounded-xl transition-all shadow-lg active:scale-95"
              >
                Completar Venta e Imprimir (${totalWithTip.toFixed(2)})
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PRINT TICKET MODAL */}
      {completedSale && (
        <TicketModal
          sale={completedSale}
          config={ticketConfig}
          onClose={() => setCompletedSale(null)}
        />
      )}

      {/* BARBER MANAGEMENT MODAL */}
      {showBarberModal && (
        <BarberManagerModal onClose={() => setShowBarberModal(false)} />
      )}
    </div>
  );
}
