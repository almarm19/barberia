'use client';

import React, { useState } from 'react';
import { useBarberStore } from '../../lib/store';
import { Service, CommissionType } from '../../types';
import { Scissors, Plus, Edit2, Trash2, Clock, DollarSign, X } from 'lucide-react';

export function ServicesView() {
  const { services, addService, updateService, deleteService } = useBarberStore();

  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [category, setCategory] = useState('Cortes');
  const [imageUrl, setImageUrl] = useState('/images/corte_skin_fade.png');
  const [barberCommissionType, setBarberCommissionType] = useState<CommissionType>('PERCENTAGE');
  const [barberCommissionValue, setBarberCommissionValue] = useState('50');

  const openAddModal = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setPrice('200');
    setDurationMinutes('30');
    setCategory('Cortes');
    setImageUrl('/images/corte_skin_fade.png');
    setBarberCommissionType('PERCENTAGE');
    setBarberCommissionValue('50');
    setShowModal(true);
  };

  const openEditModal = (s: Service) => {
    setEditingService(s);
    setName(s.name);
    setDescription(s.description);
    setPrice(s.price.toString());
    setDurationMinutes(s.durationMinutes.toString());
    setCategory(s.category);
    setImageUrl(s.imageUrl);
    setBarberCommissionType(s.barberCommissionType || 'PERCENTAGE');
    setBarberCommissionValue((s.barberCommissionValue ?? 50).toString());
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    const numericPrice = parseFloat(price) || 0;
    const numericDuration = parseInt(durationMinutes) || 30;
    const numericCommissionValue = parseFloat(barberCommissionValue) || 0;

    if (editingService) {
      updateService({
        ...editingService,
        name,
        description,
        price: numericPrice,
        durationMinutes: numericDuration,
        category,
        imageUrl,
        barberCommissionType,
        barberCommissionValue: numericCommissionValue,
      });
    } else {
      addService({
        name,
        description,
        price: numericPrice,
        durationMinutes: numericDuration,
        category,
        imageUrl: imageUrl || '/images/corte_skin_fade.png',
        active: true,
        barberCommissionType,
        barberCommissionValue: numericCommissionValue,
      });
    }

    setShowModal(false);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-zinc-950 min-h-full text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Scissors className="w-6 h-6 text-amber-500" />
            Catálogo de Servicios y Costos
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Configura los servicios ofrecidos, tiempos de atención, precios y comisiones para barberos.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 active:scale-95 w-fit"
        >
          <Plus className="w-4 h-4" />
          Agregar Nuevo Servicio
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {services.map((serv) => (
          <div
            key={serv.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between hover:border-zinc-700 transition-all group"
          >
            <div className="relative h-44 bg-zinc-950 border-b border-zinc-800">
              {/* eslint-disable-next-html-element-for-responsive-img */}
              <img
                src={serv.imageUrl || '/images/corte_skin_fade.png'}
                alt={serv.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-2 left-2 bg-amber-500 text-zinc-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase shadow">
                {serv.category}
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-bold text-base text-white">{serv.name}</h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{serv.description}</p>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> {serv.durationMinutes} min
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-extrabold text-amber-400 font-mono">
                      ${serv.price.toFixed(2)}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(serv)}
                        className="p-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar el servicio ${serv.name}?`)) deleteService(serv.id);
                        }}
                        className="p-2 bg-zinc-950 hover:bg-red-500/20 border border-zinc-800 text-red-400 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Scissors className="w-3 h-3 text-emerald-400" />
                    Comisión Barbero:
                  </span>
                  <span className="font-mono font-black text-amber-300">
                    {serv.barberCommissionType === 'FIXED'
                      ? `$${(serv.barberCommissionValue || 0).toFixed(2)}`
                      : `${serv.barberCommissionValue || 50}% ($${((serv.price * (serv.barberCommissionValue || 50)) / 100).toFixed(2)})`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Nombre del Servicio:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Corte Skin Fade VIP"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Descripción:
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Incluye lo que abarca (lavado, toalla caliente, toques finos)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Costo / Precio ($):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Duración (minutos):
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Categoría:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Cortes">Cortes</option>
                  <option value="Barba">Barba</option>
                  <option value="Combos">Combos VIP</option>
                  <option value="Facial">Tratamientos Faciales</option>
                  <option value="Color">Colorimetría</option>
                </select>
              </div>

              {/* Barber Commission Config Block */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl space-y-2">
                <label className="text-xs font-bold text-amber-400 block flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5" />
                  Comisión para el Barbero:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Tipo:</label>
                    <select
                      value={barberCommissionType}
                      onChange={(e) => setBarberCommissionType(e.target.value as CommissionType)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
                    >
                      <option value="PERCENTAGE">Porcentaje (%)</option>
                      <option value="FIXED">Monto Fijo ($ MXN)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">
                      {barberCommissionType === 'PERCENTAGE' ? 'Porcentaje (%):' : 'Monto Fijo ($):'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={barberCommissionValue}
                      onChange={(e) => setBarberCommissionValue(e.target.value)}
                      placeholder={barberCommissionType === 'PERCENTAGE' ? '50' : '100'}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs shadow-lg"
                >
                  Guardar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
