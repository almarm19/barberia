'use client';

import React, { useState } from 'react';
import { useBarberStore } from '../../lib/store';
import { Barber } from '../../types';
import { UserCheck, Plus, Edit2, Trash2, X, Check, Sparkles, User, ShieldCheck } from 'lucide-react';

interface BarberManagerModalProps {
  onClose: () => void;
}

const AVATAR_OPTIONS = ['🧔🏻‍♂️', '💈', '✂️', '💇‍♂️', '👨‍🦱', '👑', '😎', '✨'];

export function BarberManagerModal({ onClose }: BarberManagerModalProps) {
  const { barbers, addBarber, updateBarber, deleteBarber } = useBarberStore();

  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🧔🏻‍♂️');
  const [role, setRole] = useState('Master Barber');

  const openCreate = () => {
    setEditingBarber(null);
    setName('');
    setAvatar('🧔🏻‍♂️');
    setRole('Master Barber');
    setIsCreating(true);
  };

  const openEdit = (b: Barber) => {
    setIsCreating(false);
    setEditingBarber(b);
    setName(b.name);
    setAvatar(b.avatar);
    setRole(b.role || 'Barbero Estilista');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingBarber) {
      updateBarber({
        ...editingBarber,
        name: name.trim(),
        avatar,
        role: role.trim(),
      });
    } else {
      addBarber({
        name: name.trim(),
        avatar,
        role: role.trim() || 'Master Barber',
        active: true,
      });
    }

    setEditingBarber(null);
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-0">
        {/* MODAL HEADER */}
        <div className="p-5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Gestión de Barberos y Equipo
                <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono uppercase">
                  VIP
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Agrega, edita los nombres o elimina barberos asignados a los tickets.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top Bar Button */}
          {!isCreating && !editingBarber && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                Barberos Registrados ({barbers.length})
              </span>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Agregar Nuevo Barbero
              </button>
            </div>
          )}

          {/* FORM FOR CREATE OR EDIT */}
          {(isCreating || editingBarber) && (
            <form onSubmit={handleSave} className="bg-zinc-950 border border-amber-500/30 p-5 rounded-2xl space-y-4 shadow-inner">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {editingBarber ? `Editar Barbero: ${editingBarber.name}` : 'Registrar Nuevo Barbero'}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingBarber(null);
                  }}
                  className="text-xs text-zinc-500 hover:text-white"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Nombre del Barbero (Ej. Carlos &quot;Barbas&quot;):
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Mateo Fade Master"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Especialidad / Rol:
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Ej. Master Barber o Especialista Barba"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Selecciona Icono / Avatar:
                  </label>
                  <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
                    {AVATAR_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAvatar(opt)}
                        className={`text-xl p-1.5 rounded-lg transition-all ${
                          avatar === opt ? 'bg-amber-500/20 border border-amber-500 scale-110' : 'hover:bg-zinc-800'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingBarber(null);
                  }}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs shadow-lg"
                >
                  {editingBarber ? 'Guardar Cambios' : 'Crear Barbero'}
                </button>
              </div>
            </form>
          )}

          {/* BARBERS GRID CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {barbers.map((barber) => (
              <div
                key={barber.id}
                className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                    {barber.avatar}
                  </div>
                  <div className="truncate">
                    <h4 className="font-bold text-sm text-white truncate">{barber.name}</h4>
                    <p className="text-[11px] text-amber-500 font-semibold">{barber.role || 'Barbero Estilista'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => openEdit(barber)}
                    className="p-2.5 bg-zinc-900 hover:bg-amber-500 hover:text-zinc-950 text-amber-400 border border-zinc-800 rounded-xl transition-all"
                    title="Editar Nombre"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {barbers.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`¿Estás seguro de eliminar a ${barber.name}?`)) {
                          deleteBarber(barber.id);
                        }
                      }}
                      className="p-2.5 bg-zinc-900 hover:bg-red-500/20 text-red-400 border border-zinc-800 rounded-xl transition-all"
                      title="Eliminar Barbero"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold rounded-xl text-xs transition-all"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
