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

    // Auto-determinar estado por stock
    const statusToSave = editingPin.stock_disponible && editingPin.stock_disponible > 0 
      ? 'disponible' 
      : 'agotado';
      
    const dataToSave = { ...editingPin, image_url: finalImageUrl, estado: statusToSave };

    if (editingPin.uuid) {
      // Edit
      await supabase.from('inventario').update(dataToSave).eq('uuid', editingPin.uuid);
    } else {
      // Insert
      // Generate slug from name if empty
      if (!dataToSave.slug) {
        dataToSave.slug = dataToSave.nombre?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'pin-' + Date.now();
      }
      await supabase.from('inventario').insert(dataToSave);
    }
    
    setIsProcessing(false);
    handleCloseModal();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">Gestión de Catálogo</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25"
        >
          <Plus size={18} /> Agregar Pin
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {pins.map(pin => (
          <div key={pin.uuid} className="glass-panel p-4 rounded-xl flex flex-col group relative overflow-hidden">
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
               <button onClick={() => handleOpenModal(pin)} className="p-2 bg-blue-500/90 text-white rounded-lg hover:bg-blue-400 backdrop-blur-sm"><Edit2 size={16} /></button>
               <button onClick={() => handleDelete(pin.uuid)} className="p-2 bg-rose-500/90 text-white rounded-lg hover:bg-rose-400 backdrop-blur-sm"><Trash2 size={16} /></button>
            </div>
            
            <div className="w-full h-40 bg-slate-800 rounded-lg overflow-hidden mb-4 relative">
              {pin.image_url ? (
                <img src={pin.image_url} alt={pin.nombre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">Sin imagen</div>
              )}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-xs font-bold text-white">
                Stock: {pin.stock_disponible}
              </div>
            </div>
            
            <h3 className="font-bold text-slate-100 truncate">{pin.nombre}</h3>
            <p className="text-emerald-400 font-black mt-1">${pin.precio}</p>
          </div>
        ))}
      </div>

      {isModalOpen && editingPin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg bg-slate-900 rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{editingPin.uuid ? 'Editar Pin' : 'Nuevo Pin'}</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex flex-col gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Nombre</label>
                <input required type="text" value={editingPin.nombre || ''} onChange={e => setEditingPin({...editingPin, nombre: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Imagen del Producto</label>
                {imagePreview && (
                   <div className="mb-3 w-full h-32 bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Precio ($)</label>
                  <input required type="number" step="0.01" min="0" value={editingPin.precio || 0} onChange={e => setEditingPin({...editingPin, precio: parseFloat(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Stock Inicial</label>
                  <input required type="number" min="0" value={editingPin.stock_disponible || 0} onChange={e => setEditingPin({...editingPin, stock_disponible: parseInt(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Descripción</label>
                <textarea rows={3} value={editingPin.descripcion || ''} onChange={e => setEditingPin({...editingPin, descripcion: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"></textarea>
              </div>
              
              <button disabled={isProcessing} type="submit" className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-3 rounded-xl flex justify-center items-center gap-2">
                {isProcessing ? 'Guardando...' : <><Save size={18} /> Guardar Pin</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
