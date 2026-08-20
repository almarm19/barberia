'use client';

import React, { useState } from 'react';
import { useBarberStore } from '../lib/store';
import { Navbar, NavTab } from '../components/layout/Navbar';
import { POSView } from '../components/pos/POSView';
import { CatalogView } from '../components/catalog/CatalogView';
import { ServicesView } from '../components/services/ServicesView';
import { InventoryView } from '../components/inventory/InventoryView';
import { ReportsView } from '../components/reports/ReportsView';
import { SettingsView } from '../components/settings/SettingsView';
import { Scissors } from 'lucide-react';

export default function Home() {
  const { isLoaded } = useBarberStore();
  const [currentTab, setCurrentTab] = useState<NavTab>('POS');

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
          <Scissors className="w-4 h-4" /> Cargando Barbas Cuts POS...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Navbar currentTab={currentTab} onTabChange={setCurrentTab} />

      <main className="flex-1 overflow-x-hidden">
        {currentTab === 'POS' && <POSView />}
        {currentTab === 'CATALOG' && <CatalogView />}
        {currentTab === 'SERVICES' && <ServicesView />}
        {currentTab === 'INVENTORY' && <InventoryView />}
        {currentTab === 'REPORTS' && <ReportsView />}
        {currentTab === 'SETTINGS' && <SettingsView />}
      </main>
    </div>
  );
}
