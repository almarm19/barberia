'use client';

import React, { useState } from 'react';
import { useBarberStore } from '../../lib/store';
import { Sale } from '../../types';
import { TicketModal } from '../pos/TicketModal';
import {
  TrendingUp,
  Receipt,
  Gift,
  DollarSign,
  Printer,
  Calendar,
  User,
  CreditCard,
  Banknote,
  Search,
} from 'lucide-react';

export function ReportsView() {
  const { sales, clearSales, ticketConfig } = useBarberStore();
  const [selectedSaleForReprint, setSelectedSaleForReprint] = useState<Sale | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleClearSales = () => {
    if (confirm('¿Estás seguro de vaciar todo el historial de ventas? Esta acción es irreversible.')) {
      clearSales();
    }
  };

  // Metrics
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalTickets = sales.length;

  const totalCourtesyItems = sales.reduce((sum, s) => {
    const courtesyCount = s.items
      .filter((i) => i.isCourtesy)
      .reduce((cSum, i) => cSum + i.quantity, 0);
    return sum + courtesyCount;
  }, 0);

  const filteredSales = sales.filter(
    (s) =>
      s.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.barberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-zinc-950 min-h-full text-white">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-zinc-400 font-semibold uppercase">Ventas Totales</p>
            <p className="text-2xl font-black font-mono text-amber-400 mt-0.5">
              ${totalRevenue.toFixed(2)} MXN
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-zinc-400 font-semibold uppercase">Tickets Atendidos</p>
            <p className="text-2xl font-black font-mono text-white mt-0.5">
              {totalTickets} servicios
            </p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-zinc-400 font-semibold uppercase">Bebidas Cortesía Regaladas</p>
            <p className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
              {totalCourtesyItems} cortesías 🎁
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Gift className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Sales History Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-500" />
              Historial de Ventas y Tickets
            </h3>
            <p className="text-xs text-zinc-400">
              Consulta y reimprime cualquier ticket expedido en la barbería.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {sales.length > 0 && (
              <button
                onClick={handleClearSales}
                className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all"
              >
                🗑️ Vaciar Historial de Ventas
              </button>
            )}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar por #Ticket o Barbero..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 uppercase font-bold text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3"># Ticket</th>
                <th className="p-3">Fecha y Hora</th>
                <th className="p-3">Barbero</th>
                <th className="p-3">Detalle del Servicio</th>
                <th className="p-3 text-center">Método Pago</th>
                <th className="p-3 text-right">Total ($)</th>
                <th className="p-3 text-center">Reimprimir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filteredSales.map((sale) => {
                const dateStr = new Date(sale.createdAt).toLocaleString('es-MX', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                });

                return (
                  <tr key={sale.id} className="hover:bg-zinc-850 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-400">{sale.ticketNumber}</td>
                    <td className="p-3 text-zinc-300 font-mono">{dateStr}</td>
                    <td className="p-3 font-semibold text-white">{sale.barberName}</td>
                    <td className="p-3 text-zinc-400 max-w-xs truncate">
                      {sale.items.map((i) => i.name).join(', ')}
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-bold text-[10px] px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-300">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-extrabold text-amber-400 text-sm">
                      ${sale.total.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedSaleForReprint(sale)}
                        className="px-3 py-1.5 bg-zinc-950 hover:bg-amber-500 hover:text-zinc-950 text-amber-400 font-bold rounded-lg border border-amber-500/30 transition-all flex items-center gap-1.5 mx-auto text-[11px]"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Reimprimir Ticket
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* REPRINT TICKET MODAL */}
      {selectedSaleForReprint && (
        <TicketModal
          sale={selectedSaleForReprint}
          config={ticketConfig}
          onClose={() => setSelectedSaleForReprint(null)}
        />
      )}
    </div>
  );
}
