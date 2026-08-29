'use client';

import React, { useState } from 'react';
import { useBarberStore } from '../../lib/store';
import { AdminPasswordModal } from '../auth/AdminPasswordModal';
import {
  Scissors,
  ShoppingCart,
  Package,
  Boxes,
  TrendingUp,
  Settings,
  AlertTriangle,
  Calendar,
  Lock,
  ShieldCheck,
} from 'lucide-react';

export type NavTab = 'POS' | 'APPOINTMENTS' | 'CATALOG' | 'SERVICES' | 'INVENTORY' | 'REPORTS' | 'SETTINGS';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function Navbar({ currentTab, onTabChange }: NavbarProps) {
  const { products, ticketConfig, currentRole, setCurrentRole } = useBarberStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  const handleRoleToggle = () => {
    if (currentRole === 'ADMIN') {
      setCurrentRole('BARBER');
      if (currentTab !== 'POS' && currentTab !== 'APPOINTMENTS') {
        onTabChange('POS');
      }
    } else {
      setShowAuthModal(true);
    }
  };

  const allNavItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number; adminOnly?: boolean }[] = [
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
      adminOnly: true,
    },
    {
      id: 'SERVICES',
      label: 'Servicios',
      icon: <Scissors className="w-4 h-4" />,
      adminOnly: true,
    },
    {
      id: 'INVENTORY',
      label: 'Inventario',
      icon: <Boxes className="w-4 h-4" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      adminOnly: true,
    },
    {
      id: 'REPORTS',
      label: 'Ventas & Reportes',
      icon: <TrendingUp className="w-4 h-4" />,
      adminOnly: true,
    },
    {
      id: 'SETTINGS',
      label: 'Ticket Custom',
      icon: <Settings className="w-4 h-4" />,
      adminOnly: true,
    },
  ];

  const navItems = allNavItems.filter(
    (item) => currentRole === 'ADMIN' || !item.adminOnly
  );

  return (
    <header className="bg-zinc-950 border-b border-zinc-800/80 sticky top-0 z-40 no-print">
      {/* MAIN TOP BAR */}
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
            <h1 className="font-black text-base text-white tracking-wider group-hover:text-amber-400 transition-colors flex items-center gap-2">
              <span>{ticketConfig.businessName}</span>
            </h1>
            <p className="text-[9px] font-bold text-amber-500 tracking-widest uppercase">
              {ticketConfig.subName}
            </p>
          </div>
        </div>

        {/* RIGHT STATUS BADGE & ROLE SWITCHER */}
        <div className="flex items-center gap-2">
          {lowStockCount > 0 && currentRole === 'ADMIN' && (
            <div
              onClick={() => onTabChange('INVENTORY')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold cursor-pointer hover:bg-red-500/20 transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lowStockCount} Bajo Stock</span>
            </div>
          )}

          {/* ROLE SWITCHER BUTTON */}
          <button
            onClick={handleRoleToggle}
            title="Haz clic para cambiar el tipo de usuario (Dueño / Barbero)"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all active:scale-95 shadow-md ${
              currentRole === 'ADMIN'
                ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30'
                : 'bg-zinc-900 border-blue-500/40 text-blue-400 hover:bg-zinc-800'
            }`}
          >
            {currentRole === 'ADMIN' ? (
              <>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>👑 Modo Dueño (Admin)</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>✂️ Modo Barbero (Ingresar PIN)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* DEDICATED HORIZONTALLY SCROLLABLE SUB-NAVBAR TABS (Visible on ALL devices) */}
      <div className="bg-zinc-900/90 border-t border-zinc-800/80 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 scale-105'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/70'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse ml-1">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ADMIN AUTHENTICATION PASSWORD MODAL */}
      <AdminPasswordModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setCurrentRole('ADMIN')}
      />
    </header>
  );
}
