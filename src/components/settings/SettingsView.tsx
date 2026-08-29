'use client';

import React, { useState } from 'react';
import { BarberManagerModal } from '../pos/BarberManagerModal';
import { useBarberStore } from '../../lib/store';
import { Settings, Save, MapPin, Phone, FileText, CheckCircle2, Database, Upload } from 'lucide-react';

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export function SettingsView() {
  const { ticketConfig, updateTicketConfig } = useBarberStore();

  const [logoUrl, setLogoUrl] = useState(ticketConfig.logoUrl || '/images/logo_barbas_cuts.svg');
  const [businessName, setBusinessName] = useState(ticketConfig.businessName);
  const [subName, setSubName] = useState(ticketConfig.subName);
  const [address, setAddress] = useState(ticketConfig.address);
  const [phone, setPhone] = useState(ticketConfig.phone);
  const [instagram, setInstagram] = useState(ticketConfig.instagram);
  const [footerMessage, setFooterMessage] = useState(ticketConfig.footerMessage);
  const [showCourtesyOnTicket, setShowCourtesyOnTicket] = useState(ticketConfig.showCourtesyOnTicket);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when ticketConfig loads from LocalStorage
  React.useEffect(() => {
    if (ticketConfig) {
      setLogoUrl(ticketConfig.logoUrl || '/images/logo_barbas_cuts.svg');
      setBusinessName(ticketConfig.businessName || 'BARBAS CUTS');
      setSubName(ticketConfig.subName || 'BARBER STUDIO');
      setAddress(ticketConfig.address || '');
      setPhone(ticketConfig.phone || '');
      setInstagram(ticketConfig.instagram || '');
      setFooterMessage(ticketConfig.footerMessage || '');
      setShowCourtesyOnTicket(Boolean(ticketConfig.showCourtesyOnTicket));
    }
  }, [ticketConfig]);

  // Handle and auto-optimize uploaded logo image using HTML5 Canvas
  const handleLogoUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const resizedDataUrl = canvas.toDataURL('image/png');
          setLogoUrl(resizedDataUrl);
          updateTicketConfig({
            ...ticketConfig,
            logoUrl: resizedDataUrl,
          });
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 3000);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTicketConfig({
      ...ticketConfig,
      logoUrl,
      businessName,
      subName,
      address,
      phone,
      instagram,
      footerMessage,
      showCourtesyOnTicket,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-zinc-950 min-h-full text-white max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Settings className="w-6 h-6 text-amber-500" />
            Personalización de Tickets y Negocio
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Modifica la información impresa en el ticket del cliente y datos de contacto.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-lg">
        <h3 className="text-base font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-500" />
          Encabezado y Pie del Ticket
        </h3>

        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
          <label className="text-xs font-semibold text-zinc-400 block flex items-center justify-between">
            <span>Logo del Ticket & Barbería:</span>
            <span className="text-[10px] text-amber-500 font-bold">Aparece en el encabezado del ticket impreso</span>
          </label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-zinc-700 p-2 flex items-center justify-center shrink-0 overflow-hidden">
              {/* eslint-disable-next-html-element-for-responsive-img */}
              <img
                src={logoUrl}
                alt="Logo vista previa"
                className="max-h-full max-w-full object-contain filter invert"
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                <Upload className="w-4 h-4 text-amber-500" />
                Subir Nuevo Logo (Imagen / PNG / SVG)
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUploadSim}
                  className="hidden"
                />
              </label>
              <input
                type="text"
                placeholder="O escribe la URL de la imagen del logo..."
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-[11px] text-zinc-300 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">Nombre de la Barbería:</label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">Subtítulo / Eslogan:</label>
            <input
              type="text"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-zinc-400 block mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500" /> Dirección Completa:
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1 flex items-center gap-1">
              <InstagramIcon className="w-3.5 h-3.5 text-amber-500" /> Usuario de Instagram:
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">@</span>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-7 pr-3 py-3 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-amber-500" /> Teléfono de Contacto:
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-zinc-400 block mb-1">Mensaje de Pie de Ticket:</label>
            <textarea
              rows={2}
              value={footerMessage}
              onChange={(e) => setFooterMessage(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-400">
              <input
                type="checkbox"
                checked={showCourtesyOnTicket}
                onChange={(e) => setShowCourtesyOnTicket(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              Mostrar Bebidas de Cortesía impresas en el Ticket del Cliente como ($0.00 / Cortesía de la casa)
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> ¡Configuración guardada exitosamente!
            </span>
          ) : (
            <span className="text-xs text-zinc-500">Los cambios se aplican de inmediato en las impresiones.</span>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" /> Guardar Cambios
          </button>
        </div>
      </form>

      {/* SECURITY & ADMIN PASSWORD MANAGEMENT */}
      <AdminPasswordSection />

      {/* BARBERS MANAGEMENT SECTION */}
      <BarberManagerSection />
    </div>
  );
}

function AdminPasswordSection() {
  const { adminPassword, setAdminPassword } = useBarberStore();
  const [currentInputPass, setCurrentInputPass] = useState(adminPassword);
  const [passSaved, setPassSaved] = useState(false);

  React.useEffect(() => {
    setCurrentInputPass(adminPassword);
  }, [adminPassword]);

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInputPass.trim()) return;
    setAdminPassword(currentInputPass.trim());
    setPassSaved(true);
    setTimeout(() => setPassSaved(false), 3000);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              🔐 Seguridad y Contraseña de Administrador (Dueño)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Esta clave se solicita para cambiar de rol Barbero a Dueño y proteger los reportes.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSavePassword} className="flex flex-col sm:flex-row items-end gap-3 pt-1">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold text-zinc-400 block">
            Contraseña o PIN de Acceso Administrador:
          </label>
          <input
            type="text"
            required
            value={currentInputPass}
            onChange={(e) => setCurrentInputPass(e.target.value)}
            placeholder="Ejemplo: 1234"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 font-mono font-bold text-amber-400 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          type="submit"
          className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2 shrink-0"
        >
          <Save className="w-4 h-4" />
          Actualizar Clave
        </button>
      </form>

      {passSaved && (
        <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4" /> ¡Contraseña de administrador actualizada con éxito!
        </p>
      )}
    </div>
  );
}

function BarberManagerSection() {
  const { barbers, deleteBarber } = useBarberStore();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>💈</span> Equipo y Barberos Que Atienden
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Administra los nombres, roles y avatares de los barberos para asignarlos en los tickets.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2 w-fit"
        >
          ⚙️ Gestionar Equipo y Barberos
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {barbers.map((barber) => (
          <div
            key={barber.id}
            className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex items-center justify-between gap-3 shadow-md"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl">{barber.avatar}</span>
              <div className="truncate">
                <p className="font-bold text-sm text-white truncate">{barber.name}</p>
                <p className="text-[10px] text-amber-500 font-semibold">{barber.role || 'Barbero Estilista'}</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold border border-zinc-800"
            >
              Editar
            </button>
          </div>
        ))}
      </div>

      {showModal && <BarberManagerModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
