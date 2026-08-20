'use client';

import React, { useState } from 'react';
import { useBarberStore } from '../../lib/store';
import { Appointment, AppointmentStatus } from '../../types';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Scissors,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  DollarSign,
  Trash2,
  Edit2,
  CalendarCheck,
  ArrowRight,
  Filter,
  Sparkles,
} from 'lucide-react';

interface AppointmentsViewProps {
  onNavigateToPOS: () => void;
}

export function AppointmentsView({ onNavigateToPOS }: AppointmentsViewProps) {
  const {
    appointments,
    barbers,
    services,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    convertAppointmentToCart,
  } = useBarberStore();

  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('TODAS');
  const [selectedBarberFilter, setSelectedBarberFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [barberId, setBarberId] = useState(barbers[0]?.id || 'b1');
  const [serviceId, setServiceId] = useState(services[0]?.id || 's1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [status, setStatus] = useState<AppointmentStatus>('CONFIRMADA');
  const [notes, setNotes] = useState('');

  const openCreate = () => {
    setEditingApt(null);
    setCustomerName('');
    setCustomerPhone('');
    setBarberId(barbers[0]?.id || 'b1');
    setServiceId(services[0]?.id || 's1');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('14:00');
    setStatus('CONFIRMADA');
    setNotes('');
    setShowModal(true);
  };

  const openEdit = (apt: Appointment) => {
    setEditingApt(apt);
    setCustomerName(apt.customerName);
    setCustomerPhone(apt.customerPhone);
    setBarberId(apt.barberId);
    setServiceId(apt.serviceId);
    setDate(apt.date);
    setTime(apt.time);
    setStatus(apt.status);
    setNotes(apt.notes || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedBarber = barbers.find((b) => b.id === barberId) || barbers[0];
    const selectedService = services.find((s) => s.id === serviceId) || services[0];

    if (editingApt) {
      updateAppointment({
        ...editingApt,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        barberId: selectedBarber.id,
        barberName: selectedBarber.name,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        servicePrice: selectedService.price,
        date,
        time,
        status,
        notes: notes.trim() || undefined,
      });
    } else {
      addAppointment({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        barberId: selectedBarber.id,
        barberName: selectedBarber.name,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        servicePrice: selectedService.price,
        date,
        time,
        status,
        notes: notes.trim() || undefined,
      });
    }

    setShowModal(false);
  };

  const handleChargeInPOS = (apt: Appointment) => {
    convertAppointmentToCart(apt);
    onNavigateToPOS();
  };

  // Filtering
  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus =
      selectedStatusFilter === 'TODAS' || apt.status === selectedStatusFilter;
    const matchesBarber =
      selectedBarberFilter === 'ALL' || apt.barberId === selectedBarberFilter;
    const matchesSearch =
      apt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.customerPhone.includes(searchQuery) ||
      apt.serviceName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesBarber && matchesSearch;
  });

  // KPIs
  const todayStr = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter((a) => a.date === todayStr);
  const confirmedCount = appointments.filter((a) => a.status === 'CONFIRMADA').length;
  const pendingCount = appointments.filter((a) => a.status === 'PENDIENTE').length;

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-zinc-950 min-h-full text-white">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              Citas Agendadas Hoy
            </p>
            <p className="text-2xl font-black text-amber-400 font-mono mt-0.5">
              {todayApts.length} Citas
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <CalendarIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              Confirmadas / En Agenda
            </p>
            <p className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
              {confirmedCount} Confirmadas
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              Pendientes por Confirmar
            </p>
            <p className="text-2xl font-black text-amber-300 font-mono mt-0.5">
              {pendingCount} Pendientes
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-300 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Controls & Filters Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-amber-500" />
              Gestión de Agenda y Citas de Clientes
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Programa las visitas de tus clientes y cobrálas directamente en caja con 1 solo clic.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            Agendar Nueva Cita
          </button>
        </div>

        {/* Filter Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Pills */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
            {['TODAS', 'CONFIRMADA', 'PENDIENTE', 'COMPLETADA', 'CANCELADA'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedStatusFilter === st
                    ? 'bg-amber-500 text-zinc-950 shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Barber Filter & Search Input */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedBarberFilter}
              onChange={(e) => setSelectedBarberFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Todos los Barberos</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.avatar} {b.name}
                </option>
              ))}
            </select>

            <div className="relative flex-1 sm:w-48">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* APPOINTMENTS CARDS GRID */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500 space-y-3">
          <CalendarIcon className="w-12 h-12 mx-auto text-zinc-600" />
          <p className="font-bold text-base text-zinc-300">No hay citas registradas</p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            No se encontraron citas con los filtros seleccionados. Toca en &quot;Agendar Nueva Cita&quot; para programar la primera.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.map((apt) => {
            const statusConfig = {
              CONFIRMADA: { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', label: 'Confirmada' },
              PENDIENTE: { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', label: 'Pendiente' },
              COMPLETADA: { bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400', label: 'Completada' },
              CANCELADA: { bg: 'bg-red-500/10 border-red-500/30 text-red-400', label: 'Cancelada' },
            }[apt.status];

            return (
              <div
                key={apt.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg relative group transition-all"
              >
                {/* Header info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-amber-400">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-white">{apt.customerName}</h4>
                        {apt.customerPhone && (
                          <p className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-zinc-500" />
                            {apt.customerPhone}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusConfig.bg}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Service & Price */}
                  <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-amber-400 flex items-center gap-1.5">
                        <Scissors className="w-3.5 h-3.5" /> {apt.serviceName}
                      </span>
                      <span className="font-mono font-extrabold text-white">${apt.servicePrice.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-zinc-400 pt-1 border-t border-zinc-900">
                      <span>Barbero:</span>
                      <span className="font-semibold text-zinc-300">💈 {apt.barberName}</span>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span className="flex items-center gap-1 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
                      <CalendarIcon className="w-3.5 h-3.5 text-amber-500" /> {apt.date}
                    </span>
                    <span className="flex items-center gap-1 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
                      <Clock className="w-3.5 h-3.5 text-amber-500" /> {apt.time} hrs
                    </span>
                  </div>

                  {apt.notes && (
                    <p className="text-[11px] text-zinc-400 italic bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/50">
                      📝 {apt.notes}
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(apt)}
                      className="p-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl border border-zinc-800 transition-all text-xs"
                      title="Editar Cita"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar la cita de ${apt.customerName}?`)) deleteAppointment(apt.id);
                      }}
                      className="p-2 bg-zinc-950 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-xl border border-zinc-800 transition-all text-xs"
                      title="Eliminar Cita"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Convert to POS Ticket Button */}
                  {apt.status !== 'COMPLETADA' && apt.status !== 'CANCELADA' && (
                    <button
                      onClick={() => handleChargeInPOS(apt)}
                      className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-black text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1 active:scale-95"
                    >
                      <DollarSign className="w-4 h-4" />
                      Cobrar Cita en Caja
                      <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT APPOINTMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                {editingApt ? 'Editar Cita de Cliente' : 'Agendar Nueva Cita'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Nombre del Cliente:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Fernando Gómez"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Teléfono / WhatsApp:
                </label>
                <input
                  type="tel"
                  placeholder="Ej. 55 9876 5432"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Barbero Asignado:
                  </label>
                  <select
                    value={barberId}
                    onChange={(e) => setBarberId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                  >
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.avatar} {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Servicio Solicitado:
                  </label>
                  <select
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (${s.price})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Fecha:</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Hora:</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Estatus:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="CONFIRMADA">CONFIRMADA</option>
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="COMPLETADA">COMPLETADA</option>
                  <option value="CANCELADA">CANCELADA</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Notas adicionales:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Prefiere bebida de cortesía fría"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs shadow-lg"
                >
                  {editingApt ? 'Guardar Cambios' : 'Agendar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
