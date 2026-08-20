'use client';

import React, { useState } from 'react';
import { useBarberStore } from '../../lib/store';
import { Product, InventoryLog } from '../../types';
import {
  Boxes,
  PlusCircle,
  MinusCircle,
  AlertTriangle,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  RefreshCw,
  X,
  Search,
} from 'lucide-react';

export function InventoryView() {
  const { products, inventoryLogs, adjustStock } = useBarberStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('5');
  const [adjustNote, setAdjustNote] = useState<string>('Reabastecimiento de mercancía');
  const [adjustType, setAdjustType] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const delta = (parseInt(adjustAmount) || 0) * (adjustType === 'ENTRADA' ? 1 : -1);
    if (delta === 0) return;

    adjustStock(selectedProduct.id, delta, adjustNote);
    setSelectedProduct(null);
    setAdjustAmount('5');
    setAdjustNote('Reabastecimiento de mercancía');
  };

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const totalStockCount = products.reduce((sum, p) => sum + p.stock, 0);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-zinc-950 min-h-full text-white">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-semibold uppercase">Total en Almacén</p>
            <p className="text-2xl font-black font-mono text-white mt-0.5">{totalStockCount} pzas</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-semibold uppercase">Alertas Stock Mínimo</p>
            <p className="text-2xl font-black font-mono text-red-400 mt-0.5">{lowStockCount} ítems</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <History className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-semibold uppercase">Movimientos Registrados</p>
            <p className="text-2xl font-black font-mono text-white mt-0.5">
              {inventoryLogs.length} registros
            </p>
          </div>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg space-y-4 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-amber-500" />
              Inventario de Productos y Bebidas
            </h3>
            <p className="text-xs text-zinc-400">
              Control de existencias actualizado automáticamente con cada venta.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar en almacén..."
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
                <th className="p-3">Producto / Bebida</th>
                <th className="p-3">Tipo</th>
                <th className="p-3 text-center">Stock Actual</th>
                <th className="p-3 text-center">Mínimo</th>
                <th className="p-3 text-right">Precio Venta</th>
                <th className="p-3 text-right">Costo Compra</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filteredProducts.map((p) => {
                const isLow = p.stock <= p.minStock;
                return (
                  <tr key={p.id} className="hover:bg-zinc-850 transition-colors">
                    <td className="p-3 font-semibold text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                        {/* eslint-disable-next-html-element-for-responsive-img */}
                        <img
                          src={p.imageUrl || '/images/pomada_mate.png'}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-xs">{p.name}</p>
                        <p className="text-[10px] text-zinc-500">{p.category}</p>
                      </div>
                    </td>

                    <td className="p-3">
                      {p.isBeverage ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          🍺 Bebida
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          💈 Producto
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-center font-mono font-extrabold text-sm">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full ${
                          isLow ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-white'
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>

                    <td className="p-3 text-center font-mono text-zinc-400">{p.minStock}</td>
                    <td className="p-3 text-right font-mono font-bold text-amber-400">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono text-zinc-400">${p.cost.toFixed(2)}</td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedProduct(p)}
                        className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-zinc-950 font-bold rounded-lg transition-all border border-amber-500/30 text-[11px]"
                      >
                        Ajustar Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement Logs History */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4 shadow-lg">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-amber-500" />
          Historial Reciente de Movimientos de Inventario
        </h3>

        {inventoryLogs.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-6">
            Aún no hay registro de movimientos de inventario.
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {inventoryLogs.map((log) => {
              const isSale = log.changeType === 'VENTA';
              const isCourtesy = log.changeType === 'CORTESIA';
              const isInflow = log.changeType === 'ENTRADA';

              return (
                <div
                  key={log.id}
                  className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isSale
                          ? 'bg-amber-500/10 text-amber-400'
                          : isCourtesy
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-blue-500/10 text-blue-400'
                      }`}
                    >
                      {isSale ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : isCourtesy ? (
                        <Gift className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white">{log.productName}</p>
                      <p className="text-[10px] text-zinc-400">{log.note}</p>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span
                      className={`font-bold ${
                        log.quantityChange > 0 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange} pzas
                    </span>
                    <span className="block text-[10px] text-zinc-500">
                      {new Date(log.createdAt).toLocaleTimeString('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADJUST STOCK MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">
                Ajustar Inventario: {selectedProduct.name}
              </h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-400">Stock Actual:</span>
                <span className="font-mono text-lg font-bold text-amber-400">
                  {selectedProduct.stock} unidades
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-2">
                  Tipo de Movimiento:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('ENTRADA')}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 ${
                      adjustType === 'ENTRADA'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" /> Entrada / Restock
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('SALIDA')}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 ${
                      adjustType === 'SALIDA'
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <MinusCircle className="w-4 h-4" /> Salida / Ajuste
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Cantidad:</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-base font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Motivo / Nota:</label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="Ej. Compra de proveedor o producto dañado"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs shadow-lg"
                >
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
