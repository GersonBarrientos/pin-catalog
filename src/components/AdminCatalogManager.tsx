"use client";

import { PinItem } from '@/store/useStore';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';

export default function AdminCatalogManager({ initialPins }: { initialPins: PinItem[] }) {
  const [pins, setPins] = useState<PinItem[]>(initialPins);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPin, setEditingPin] = useState<Partial<PinItem> | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('admin-inventario-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventario' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setPins(current => current.map(p => p.uuid === payload.new.uuid ? payload.new as PinItem : p));
        } else if (payload.eventType === 'INSERT') {
          setPins(current => [payload.new as PinItem, ...current]);
        } else if (payload.eventType === 'DELETE') {
          setPins(current => current.filter(p => p.uuid !== payload.old.uuid));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const handleOpenModal = (pin?: PinItem) => {
    setImageFile(null);
    setImagePreview(pin?.image_url || null);
    if (pin) {
      setEditingPin(pin);
    } else {
      setEditingPin({
        nombre: '', slug: '', descripcion: '', image_url: '', precio: 0, stock_disponible: 0, estado: 'disponible'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPin(null);
  };

  const handleDelete = async (uuid: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este pin del catálogo?')) return;
    setPins(current => current.filter(p => p.uuid !== uuid));
    await supabase.from('inventario').delete().eq('uuid', uuid);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPin) return;
    setIsProcessing(true);

    let finalImageUrl = editingPin.image_url;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('pines-images').upload(fileName, imageFile);
      
      if (!uploadError) {
        const { data } = supabase.storage.from('pines-images').getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      } else {
        console.error("Upload error", uploadError);
        alert("Error al subir la imagen. Se guardará sin actualizar la foto.");
      }
    }

    const statusToSave = editingPin.stock_disponible && editingPin.stock_disponible > 0 
      ? 'disponible' 
      : 'agotado';
      
    const dataToSave = { ...editingPin, image_url: finalImageUrl, estado: statusToSave } as PinItem;

    if (editingPin.uuid) {
      setPins(current => current.map(p => p.uuid === editingPin.uuid ? { ...p, ...dataToSave } : p));
      await supabase.from('inventario').update(dataToSave).eq('uuid', editingPin.uuid);
    } else {
      if (!dataToSave.slug) {
        dataToSave.slug = dataToSave.nombre?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'pin-' + Date.now();
      }
      // Temporary UUID until reload
      const tempUuid = crypto.randomUUID();
      const newPin = { ...dataToSave, uuid: tempUuid } as PinItem;
      setPins(current => [newPin, ...current]);
      
      await supabase.from('inventario').insert(dataToSave);
    }
    
    setIsProcessing(false);
    handleCloseModal();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white/50 p-4 rounded-2xl border border-teal-50 shadow-sm">
        <h2 className="text-2xl font-bold text-teal-800 flex items-center gap-2">Gestión de Catálogo</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-teal-500 hover:bg-teal-400 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md shadow-teal-500/20"
        >
          <Plus size={18} /> Agregar Pin
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {pins.map(pin => (
          <div key={pin.uuid} className="bg-white p-5 rounded-2xl flex flex-col group relative overflow-hidden border border-teal-50 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all">
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
               <button onClick={() => handleOpenModal(pin)} className="p-2 bg-white text-teal-600 shadow-md rounded-xl hover:bg-teal-50 transition-colors"><Edit2 size={16} /></button>
               <button onClick={() => handleDelete(pin.uuid)} className="p-2 bg-white text-rose-500 shadow-md rounded-xl hover:bg-rose-50 transition-colors"><Trash2 size={16} /></button>
            </div>
            
            <div className="w-full h-48 bg-slate-50 rounded-xl overflow-hidden mb-5 relative">
              {pin.image_url ? (
                <img src={pin.image_url} alt={pin.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium bg-slate-100">Sin imagen</div>
              )}
              <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-lg shadow-sm text-xs font-bold text-teal-700">
                Stock: {pin.stock_disponible}
              </div>
            </div>
            
            <h3 className="font-bold text-lg text-slate-800 truncate">{pin.nombre}</h3>
            <p className="text-teal-600 font-black text-xl mt-1">${pin.precio}</p>
          </div>
        ))}
      </div>

      {isModalOpen && editingPin && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[90vh] border border-teal-100">
            <div className="p-6 border-b border-teal-50 flex justify-between items-center bg-teal-50/30 rounded-t-3xl">
              <h3 className="text-2xl font-bold text-teal-800">{editingPin.uuid ? 'Editar Pin' : 'Nuevo Pin'}</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex flex-col gap-5">
              <div>
                <label className="text-sm font-bold text-slate-600 mb-2 block">Nombre</label>
                <input required type="text" value={editingPin.nombre || ''} onChange={e => setEditingPin({...editingPin, nombre: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition-all" />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-600 mb-2 block">Imagen del Producto</label>
                {imagePreview && (
                   <div className="mb-4 w-full h-40 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 relative flex justify-center">
                      <img src={imagePreview} alt="Preview" className="h-full object-contain drop-shadow-md" />
                   </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-teal-100 file:text-teal-700 hover:file:bg-teal-200 transition-all cursor-pointer" 
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-bold text-slate-600 mb-2 block">Precio ($)</label>
                  <input required type="number" step="0.01" min="0" value={editingPin.precio || 0} onChange={e => setEditingPin({...editingPin, precio: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-600 mb-2 block">Stock Inicial</label>
                  <input required type="number" min="0" value={editingPin.stock_disponible || 0} onChange={e => setEditingPin({...editingPin, stock_disponible: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-600 mb-2 block">Descripción</label>
                <textarea rows={3} value={editingPin.descripcion || ''} onChange={e => setEditingPin({...editingPin, descripcion: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition-all resize-none"></textarea>
              </div>
              
              <button disabled={isProcessing} type="submit" className="w-full mt-4 bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white font-bold p-4 rounded-xl flex justify-center items-center gap-2 shadow-lg shadow-teal-500/30 transition-all transform hover:scale-[1.02]">
                {isProcessing ? 'Guardando...' : <><Save size={20} /> Guardar Pin</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
