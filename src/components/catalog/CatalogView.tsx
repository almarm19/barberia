'use client';

import React, { useState } from 'react';
import { useBarberStore } from '../../lib/store';
import { Product } from '../../types';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  AlertTriangle,
  GlassWater,
  Search,
  Check,
  X,
  Upload,
} from 'lucide-react';

export function CatalogView() {
  const { products, addProduct, updateProduct, deleteProduct, adjustStock } = useBarberStore();
  const [filter, setFilter] = useState<'ALL' | 'PRODUCTS' | 'BEVERAGES'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [category, setCategory] = useState('Peinado');
  const [imageUrl, setImageUrl] = useState('');
  const [isBeverage, setIsBeverage] = useState(false);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setCost('');
    setStock('10');
    setMinStock('5');
    setCategory('Peinado');
    setImageUrl('/images/pomada_mate.png');
    setIsBeverage(false);
    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price.toString());
    setCost(p.cost.toString());
    setStock(p.stock.toString());
    setMinStock(p.minStock.toString());
    setCategory(p.category);
    setImageUrl(p.imageUrl);
    setIsBeverage(p.isBeverage);
    setShowModal(true);
  };

  const handleImageUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      alert('Por favor ingresa al menos el nombre y precio del producto');
      return;
    }

    const numericPrice = parseFloat(price) || 0;
    const numericCost = parseFloat(cost) || 0;
    const numericStock = parseInt(stock) || 0;
    const numericMinStock = parseInt(minStock) || 3;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name,
        description,
        price: numericPrice,
        cost: numericCost,
        stock: numericStock,
        minStock: numericMinStock,
        category,
        imageUrl: imageUrl || (isBeverage ? '/images/whiskey.png' : '/images/pomada_mate.png'),
        isBeverage,
      });
    } else {
      addProduct({
        name,
        description,
        price: numericPrice,
        cost: numericCost,
        stock: numericStock,
        minStock: numericMinStock,
        category,
        imageUrl: imageUrl || (isBeverage ? '/images/whiskey.png' : '/images/pomada_mate.png'),
        isBeverage,
        active: true,
      });
    }

    setShowModal(false);
  };

  const filteredProducts = products
    .filter((p) => {
      if (filter === 'PRODUCTS') return !p.isBeverage;
      if (filter === 'BEVERAGES') return p.isBeverage;
      return true;
    })
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-zinc-950 min-h-full text-white">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Package className="w-6 h-6 text-amber-500" />
            Catálogo de Productos y Bebidas
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Administra precios, fotos de productos e inventario.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Nuevo Producto / Bebida
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
            filter === 'ALL'
              ? 'bg-zinc-800 text-amber-400 border border-amber-500/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Todos ({products.length})
        </button>
        <button
          onClick={() => setFilter('PRODUCTS')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
            filter === 'PRODUCTS'
              ? 'bg-zinc-800 text-amber-400 border border-amber-500/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Productos Barbería ({products.filter((p) => !p.isBeverage).length})
        </button>
        <button
          onClick={() => setFilter('BEVERAGES')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
            filter === 'BEVERAGES'
              ? 'bg-zinc-800 text-amber-400 border border-amber-500/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Bebidas & Cortesías ({products.filter((p) => p.isBeverage).length})
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg hover:border-zinc-700 transition-all group"
          >
            {/* Image Banner */}
            <div className="relative h-44 bg-zinc-950 overflow-hidden border-b border-zinc-800">
              {/* eslint-disable-next-html-element-for-responsive-img */}
              <img
                src={prod.imageUrl || '/images/pomada_mate.png'}
                alt={prod.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 left-2 flex gap-1">
                {prod.isBeverage ? (
                  <span className="bg-emerald-500/90 text-zinc-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase shadow">
                    🍺 Bebida
                  </span>
                ) : (
                  <span className="bg-amber-500/90 text-zinc-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase shadow">
                    💈 Producto
                  </span>
                )}
              </div>

              <div className="absolute top-2 right-2">
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow ${
                    prod.stock <= prod.minStock
                      ? 'bg-red-500 text-white'
                      : 'bg-zinc-900/90 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  Stock: {prod.stock}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">
                  {prod.category}
                </span>
                <h3 className="font-bold text-sm text-white line-clamp-1 mt-0.5">{prod.name}</h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{prod.description}</p>
              </div>

              {/* Price & Cost breakdown */}
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-zinc-500 block text-[10px]">Costo: ${prod.cost}</span>
                  <span className="text-base font-extrabold text-amber-400">
                    ${prod.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(prod)}
                    className="p-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar ${prod.name}?`)) deleteProduct(prod.id);
                    }}
                    className="p-2 bg-zinc-950 hover:bg-red-500/20 border border-zinc-800 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingProduct ? 'Editar Producto / Bebida' : 'Nuevo Producto / Bebida'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Nombre:</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Pomada Cera Mate o Whiskey Jack Daniels"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Descripción:
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalles del producto o especificación de la bebida"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Precio Venta ($):
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
                    Costo Compra ($):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Stock Inicial:
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Stock Mínimo (Alerta):
                  </label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Categoría:</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ej. Peinado, Bebidas, Barba"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 text-xs font-bold text-emerald-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBeverage}
                      onChange={(e) => setIsBeverage(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    Es una Bebida
                  </label>
                </div>

                {/* Photo upload field */}
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-zinc-400 block">
                    Foto del Producto (Subir o URL):
                  </label>
                  <div className="flex items-center gap-3">
                    {imageUrl && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950 shrink-0">
                        {/* eslint-disable-next-html-element-for-responsive-img */}
                        <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <label className="flex-1 cursor-pointer bg-zinc-950 border border-dashed border-zinc-700 hover:border-amber-500 p-2.5 rounded-xl text-xs text-zinc-400 flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4 text-amber-500" />
                      Subir Foto de Archivo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUploadSim}
                        className="hidden"
                      />
                    </label>
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
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
