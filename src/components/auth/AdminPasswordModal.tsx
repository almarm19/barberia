'use client';

import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, X, Delete, KeyRound } from 'lucide-react';
import { useBarberStore } from '../../lib/store';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminPasswordModal({ isOpen, onClose, onSuccess }: AdminPasswordModalProps) {
  const { validateAdminPassword } = useBarberStore();
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg('');
      setIsShaking(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyPress = (digit: string) => {
    if (pin.length < 10) {
      setPin((prev) => prev + digit);
      setErrorMsg('');
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) {
      setErrorMsg('Ingresa la contraseña de administrador');
      return;
    }

    const isValid = validateAdminPassword(pin);
    if (isValid) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg('Contraseña o PIN Incorrecto. Intenta de nuevo.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div
        className={`bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl transition-transform ${
          isShaking ? 'animate-bounce border-red-500/50' : ''
        }`}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Acceso Administrador</h3>
              <p className="text-[10px] text-zinc-400">Ingresa el PIN de Dueño (Defecto: 1234)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Masked PIN Display & Text Input */}
          <div className="space-y-2">
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Ingresa clave o PIN"
                autoFocus
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3.5 text-center font-mono text-lg font-bold text-amber-400 tracking-widest focus:outline-none focus:border-amber-500"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-red-400 font-bold text-center animate-pulse">
                ⚠️ {errorMsg}
              </p>
            )}
          </div>

          {/* Onscreen Numeric PIN Keypad for iPad / Touch Screen */}
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPress(digit)}
                className="py-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-white font-mono text-lg font-extrabold rounded-2xl transition-all active:scale-95 shadow"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="py-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 font-bold text-xs rounded-2xl transition-all active:scale-95"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="py-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-white font-mono text-lg font-extrabold rounded-2xl transition-all active:scale-95 shadow"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="py-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 flex items-center justify-center rounded-2xl transition-all active:scale-95"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              Desbloquear Acceso Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
