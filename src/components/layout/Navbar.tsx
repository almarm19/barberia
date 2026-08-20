'use client';

import React from 'react';
import { useBarberStore } from '../../lib/store';
import {
  Scissors,
  ShoppingCart,
  Package,
  Boxes,
  TrendingUp,
  Settings,
  AlertTriangle,
  Sparkles,
  Calendar,
} from 'lucide-react';

export type NavTab = 'POS' | 'APPOINTMENTS' | 'CATALOG' | 'SERVICES' | 'INVENTORY' | 'REPORTS' | 'SETTINGS';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function Navbar({ currentTab, onTabChange }: NavbarProps) {
  const { products, ticketConfig } = useBarberStore();
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'POS',
      label: 'Cajero / POS',
      icon: <ShoppingCart className="w-4 h-4" />,
    },
    {
      id: 'APPOINTMENTS',
      label: 'Agenda & Citas',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'CATALOG',
      label: 'Catálogo Productos',
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: 'SERVICES',
      label: 'Servicios',
      icon: <Scissors className="w-4 h-4" />,
    },
    {
      id: 'INVENTORY',
      label: 'Inventario',
      icon: <Boxes className="w-4 h-4" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
    },
    {
      id: 'REPORTS',
      label: 'Ventas & Tickets',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'SETTINGS',
      label: 'Ticket Custom',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <header className="bg-zinc-950 border-b border-zinc-800/80 sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* BRAND LOGO & TITLE */}
        <div
          onClick={() => onTabChange('POS')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 p-1 flex items-center justify-center group-hover:border-amber-500/50 transition-colors shadow-md">
            {/* eslint-disable-next-html-element-for-responsive-img */}
            <img
              src={ticketConfig.logoUrl || '/images/logo_barbas_cuts.svg'}
              alt="Barbas Cuts"
              className={`w-full h-full object-contain ${
                ticketConfig.logoUrl?.startsWith('data:') ? '' : 'filter invert'
              }`}
            />
          </div>
          <div>
            <h1 className="font-black text-base text-white tracking-wider group-hover:text-amber-400 transition-colors">
              {ticketConfig.businessName}
            </h1>
            <p className="text-[9px] font-bold text-amber-500 tracking-widest uppercase">
              {ticketConfig.subName}
            </p>
          </div>
        </div>

        {/* NAVIGATION TABS (iPad Taktil Responsive) */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 p-1 rounded-2xl">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all relative ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* RIGHT STATUS BADGE */}
        <div className="flex items-center gap-2">
          {lowStockCount > 0 && (
            <div
              onClick={() => onTabChange('INVENTORY')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold cursor-pointer hover:bg-red-500/20 transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lowStockCount} Bajo Stock</span>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE / IPAD BOTTOM TAB BAR (If screen is compact) */}
      <div className="md:hidden flex items-center justify-around bg-zinc-900 border-t border-zinc-800 p-2">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-all ${
                isActive ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-400'
              }`}
            >
              {item.icon}
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
