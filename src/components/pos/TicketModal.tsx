'use client';

import React from 'react';
import { Sale, TicketConfig } from '../../types';
import { Printer, X, Check, MapPin, Phone, Gift, AtSign } from 'lucide-react';

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

interface TicketModalProps {
  sale: Sale;
  config: TicketConfig;
  onClose: () => void;
}

export function TicketModal({ sale, config, onClose }: TicketModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(sale.createdAt).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header bar */}
        <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-lg text-white">Ticket del Cliente</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold rounded-lg transition-all shadow-lg active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Imprimir Ticket
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Area */}
        <div className="p-6 overflow-y-auto flex-1 flex justify-center bg-zinc-950/50">
          {/* Thermal Ticket 80mm Simulation Box */}
          <div
            id="thermal-receipt"
            className="w-[80mm] max-w-full bg-white text-black p-4 font-mono text-xs shadow-xl rounded sm:rounded-none selection:bg-amber-200"
            style={{ minHeight: '400px' }}
          >
            {/* LOGO & BRAND */}
            <div className="text-center pb-3 border-b border-dashed border-gray-400">
              <div className="flex justify-center mb-1">
                {/* eslint-disable-next-html-element-for-responsive-img */}
                <img
                  src={config.logoUrl || '/images/logo_barbas_cuts.svg'}
                  alt="Logo Barbas Cuts"
                  className="h-16 w-auto object-contain mx-auto max-w-[200px]"
                />
              </div>
              <h1 className="font-extrabold text-base uppercase tracking-wider text-black">
                {config.businessName}
              </h1>
              <p className="font-bold text-[10px] tracking-widest text-gray-700 uppercase">
                {config.subName}
              </p>
              
              {/* ADDRESS & INSTAGRAM */}
              <div className="mt-2 text-[10px] text-gray-800 leading-tight space-y-0.5">
                <p className="flex items-center justify-center gap-1 font-sans">
                  <MapPin className="w-3 h-3 inline text-gray-600 shrink-0" />
                  <span>{config.address}</span>
                </p>
                {config.phone && (
                  <p className="font-sans">Tel: {config.phone}</p>
                )}
                {config.instagram && (
                  <p className="font-semibold text-black flex items-center justify-center gap-1 font-sans">
                    <InstagramIcon className="w-3 h-3 inline text-black" />
                    <span>@{config.instagram}</span>
                  </p>
                )}
              </div>
            </div>

            {/* TICKET METADATA */}
            <div className="py-2 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
              <div className="flex justify-between font-bold">
                <span>Ticket: {sale.ticketNumber}</span>
                <span>{sale.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-gray-700 text-[10px]">
                <span>Fecha: {formattedDate}</span>
              </div>
              {config.showBarberName && (
                <div className="text-black font-semibold pt-0.5">
                  Atendido por: <span className="uppercase">{sale.barberName}</span>
                </div>
              )}
            </div>

            {/* LINE ITEMS */}
            <div className="py-3 border-b border-dashed border-gray-400">
              <div className="grid grid-cols-12 font-bold border-b border-gray-300 pb-1 mb-1 uppercase text-[9px] tracking-wider text-gray-700">
                <span className="col-span-6">Concepto</span>
                <span className="col-span-2 text-center">Cant</span>
                <span className="col-span-4 text-right">Total</span>
              </div>

              <div className="space-y-1.5 pt-1">
                {sale.items.map((item) => {
                  const isCourtesy = Boolean(item.isCourtesy);
                  return (
                    <div key={item.id} className="grid grid-cols-12 items-start text-[11px] leading-tight">
                      <div className="col-span-6 font-sans">
                        <span className="font-medium">{item.name}</span>
                        {isCourtesy && config.showCourtesyOnTicket && (
                          <span className="block text-[9px] font-bold text-amber-700 bg-amber-50 px-1 rounded w-fit mt-0.5 border border-amber-200">
                            🎁 Cortesía de la casa
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 text-center font-bold">
                        {item.quantity}
                      </div>
                      <div className="col-span-4 text-right font-mono font-bold">
                        {isCourtesy ? (
                          <span className="text-emerald-700 font-extrabold">$0.00</span>
                        ) : (
                          `$${(item.unitPrice * item.quantity).toFixed(2)}`
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TOTALS & BREAKDOWN */}
            <div className="py-2 space-y-1 text-xs">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-mono">${sale.subtotal.toFixed(2)}</span>
              </div>

              {sale.discount > 0 && (
                <div className="flex justify-between text-red-600 font-bold">
                  <span>Descuento:</span>
                  <span className="font-mono">-${sale.discount.toFixed(2)}</span>
                </div>
              )}

              {sale.tip !== undefined && sale.tip > 0 && (
                <div className="flex justify-between text-gray-900 font-semibold">
                  <span>Propina Barbero:</span>
                  <span className="font-mono">+${sale.tip.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-black">
                <span>TOTAL:</span>
                <span className="font-mono text-sm">${(sale.total + (sale.tip || 0)).toFixed(2)} MXN</span>
              </div>

              {sale.paymentMethod === 'EFECTIVO' && (
                <div className="pt-1 text-[10px] text-gray-600 space-y-0.5 font-mono border-t border-dotted border-gray-300">
                  <div className="flex justify-between">
                    <span>Efectivo Recibido:</span>
                    <span>${sale.amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-black">
                    <span>Cambio:</span>
                    <span>${sale.changeDue.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* COURTESY COURTESY THANK YOU NOTE */}
            {sale.items.some((i) => i.isCourtesy) && (
              <div className="my-2 p-2 bg-amber-50 border border-amber-300 rounded text-center text-[10px] text-amber-900 font-sans">
                <Gift className="w-3.5 h-3.5 mx-auto mb-0.5 text-amber-700 inline" />
                <p className="font-bold">¡Esperamos que disfrutes tu bebida de cortesía!</p>
              </div>
            )}

            {/* FOOTER & SOCIALS */}
            <div className="pt-3 mt-2 border-t border-dashed border-gray-400 text-center text-[10px] space-y-1">
              <p className="font-medium text-gray-800 leading-snug">{config.footerMessage}</p>
              <p className="font-bold text-black">IG: @{config.instagram}</p>
              <div className="pt-2 text-[8px] text-gray-500 font-mono uppercase tracking-widest">
                *** GRACIAS POR TU PREFERENCIA ***
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
