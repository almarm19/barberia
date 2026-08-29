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
  Scissors,
  PiggyBank,
  Wallet,
  CheckCircle,
} from 'lucide-react';

export function ReportsView() {
  const { sales, barbers, ticketConfig } = useBarberStore();
  const [selectedSaleForReprint, setSelectedSaleForReprint] = useState<Sale | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'TODAY' | 'YESTERDAY' | 'ALL'>('TODAY');

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const filteredByDateSales = sales.filter((s) => {
    const saleDateStr = new Date(s.createdAt).toISOString().split('T')[0];
    if (dateFilter === 'TODAY') return saleDateStr === todayStr;
    if (dateFilter === 'YESTERDAY') return saleDateStr === yesterdayStr;
    return true;
  });

  const totalGrossRevenue = filteredByDateSales.reduce((sum, s) => sum + s.total + (s.tip || 0), 0);
  const totalServicesProductsRevenue = filteredByDateSales.reduce((sum, s) => sum + s.total, 0);
  const totalBarberCommissions = filteredByDateSales.reduce((sum, s) => sum + (s.totalBarberCommission || 0), 0);
  const totalTips = filteredByDateSales.reduce((sum, s) => sum + (s.tip || 0), 0);
  const totalOwnerNetProfit = totalServicesProductsRevenue - totalBarberCommissions;

  // Barber breakdown aggregated
  const barberStats = barbers.map((b) => {
    const bSales = filteredByDateSales.filter((s) => s.barberId === b.id);
    const ticketsCount = bSales.length;
    const totalSalesProduced = bSales.reduce((sum, s) => sum + s.total, 0);
    const totalCommissionEarned = bSales.reduce((sum, s) => sum + (s.totalBarberCommission || 0), 0);
    const totalTipReceived = bSales.reduce((sum, s) => sum + (s.tip || 0), 0);
    const totalPayoutToBarber = totalCommissionEarned + totalTipReceived;

    return {
      barber: b,
      ticketsCount,
      totalSalesProduced,
      totalCommissionEarned,
      totalTipReceived,
      totalPayoutToBarber,
    };
  });

  const filteredSalesTable = filteredByDateSales.filter(
    (s) =>
      s.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.barberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-zinc-950 min-h-full text-white">
      {/* HEADER & DATE FILTER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <TrendingUp className="w-6 h-6 text-amber-500" />
            Reporte Financiero y Comisiones del Día
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Resumen de caja, utilidades del negocio y cálculo de comisiones a liquidar por barbero.
          </p>
        </div>

        {/* Date Filter Controls */}
        <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 p-1.5 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setDateFilter('TODAY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              dateFilter === 'TODAY'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => setDateFilter('YESTERDAY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              dateFilter === 'YESTERDAY'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Ayer
          </button>
          <button
            onClick={() => setDateFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              dateFilter === 'ALL'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Todo el Historial
          </button>
        </div>
      </div>

      {/* FINANCIAL KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Recaudado / Ventas Brutas */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Caja Total Recaudada</span>
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black font-mono text-amber-400">
              ${totalGrossRevenue.toFixed(2)}
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Incluye ventas ($
              {totalServicesProductsRevenue.toFixed(2)}) + propinas ($
              {totalTips.toFixed(2)})
            </p>
          </div>
        </div>

        {/* Comisiones Barberos */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Comisiones a Barberos</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <Scissors className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black font-mono text-blue-400">
              ${totalBarberCommissions.toFixed(2)}
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">Monto acumulado por servicios y productos</p>
          </div>
        </div>

        {/* Propinas Totales */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Propinas Totales</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black font-mono text-purple-400">
              ${totalTips.toFixed(2)}
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">100% íntegro para el personal</p>
          </div>
        </div>

        {/* Ganancia Neta Barbería (Dueño) */}
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/40 border border-emerald-500/30 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="flex justify-between items-center text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Ganancia Neta Dueño</span>
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black font-mono text-emerald-400">
              ${totalOwnerNetProfit.toFixed(2)}
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">Utilidad limpia conservada por el negocio</p>
          </div>
        </div>
      </div>

      {/* BARBER PAYOUT BREAKDOWN TABLE */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-lg">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-500" />
            Desglose de Pago de Comisiones y Propinas por Barbero
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Monto total exacto a entregar a cada barbero al finalizar la jornada.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 uppercase font-bold text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3">Barbero</th>
                <th className="p-3 text-center">Tickets Atendidos</th>
                <th className="p-3 text-right">Venta Producida ($)</th>
                <th className="p-3 text-right">Comisión Ganada ($)</th>
                <th className="p-3 text-right">Propina Recibida ($)</th>
                <th className="p-3 text-right">TOTAL A PAGAR AL BARBERO ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {barberStats.map((bs) => (
                <tr key={bs.barber.id} className="hover:bg-zinc-850/60 transition-colors">
                  <td className="p-3 flex items-center gap-2.5 font-bold text-white">
                    <span className="text-lg">{bs.barber.avatar}</span>
                    <span>{bs.barber.name}</span>
                  </td>
                  <td className="p-3 text-center font-mono font-semibold text-zinc-300">
                    {bs.ticketsCount} tickets
                  </td>
                  <td className="p-3 text-right font-mono text-zinc-300">
                    ${bs.totalSalesProduced.toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-blue-400">
                    ${bs.totalCommissionEarned.toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-mono text-bold text-purple-400">
                    ${bs.totalTipReceived.toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-mono font-extrabold text-amber-400 text-sm bg-amber-500/5">
                    ${bs.totalPayoutToBarber.toFixed(2)} MXN
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-zinc-950 font-bold border-t-2 border-zinc-800">
              <tr>
                <td className="p-3 text-white uppercase text-[10px] tracking-wider">TOTALES ACUMULADOS</td>
                <td className="p-3 text-center font-mono text-white">
                  {filteredByDateSales.length} tickets
                </td>
                <td className="p-3 text-right font-mono text-amber-400">
                  ${totalServicesProductsRevenue.toFixed(2)}
                </td>
                <td className="p-3 text-right font-mono text-blue-400">
                  ${totalBarberCommissions.toFixed(2)}
                </td>
                <td className="p-3 text-right font-mono text-purple-400">
                  ${totalTips.toFixed(2)}
                </td>
                <td className="p-3 text-right font-mono text-amber-400 text-base">
                  ${(totalBarberCommissions + totalTips).toFixed(2)} MXN
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* SALES HISTORY TABLE & TICKET REPRINT */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-500" />
              Historial Detallado de Ventas
            </h3>
            <p className="text-xs text-zinc-400">
              Desglose individual de transacciones registradas.
            </p>
          </div>

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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 uppercase font-bold text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3"># Ticket</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Barbero</th>
                <th className="p-3">Conceptos</th>
                <th className="p-3 text-center">Método Pago</th>
                <th className="p-3 text-right">Comisión ($)</th>
                <th className="p-3 text-right">Propina ($)</th>
                <th className="p-3 text-right">Total Ticket ($)</th>
                <th className="p-3 text-center">Reimprimir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filteredSalesTable.map((sale) => {
                const dateStr = new Date(sale.createdAt).toLocaleString('es-MX', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                });
                const saleTotalWithTip = sale.total + (sale.tip || 0);

                return (
                  <tr key={sale.id} className="hover:bg-zinc-850 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-400">{sale.ticketNumber}</td>
                    <td className="p-3 text-zinc-300 font-mono text-[11px]">{dateStr}</td>
                    <td className="p-3 font-semibold text-white">{sale.barberName}</td>
                    <td className="p-3 text-zinc-400 max-w-xs truncate">
                      {sale.items.map((i) => i.name).join(', ')}
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-bold text-[10px] px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-300">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-blue-400">
                      ${(sale.totalBarberCommission || 0).toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono text-purple-400 font-semibold">
                      ${(sale.tip || 0).toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono font-extrabold text-amber-400 text-sm">
                      ${saleTotalWithTip.toFixed(2)}
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
