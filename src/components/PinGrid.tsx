"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PinItem } from '@/store/useStore';
import PinCard from './PinCard';

export default function PinGrid() {
  const [pins, setPins] = useState<PinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchPins = async () => {
      const { data, error } = await supabase
        .from('inventario')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPins(data as PinItem[]);
      }
      setLoading(false);
    };

    fetchPins();

    // Configurar suscripción de tiempo real
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'inventario',
        },
        (payload) => {
          setPins((currentPins) =>
            currentPins.map((pin) =>
              pin.uuid === payload.new.uuid ? (payload.new as PinItem) : pin
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (pins.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        <p>No hay pines disponibles en el catálogo por ahora.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {pins.map((pin) => (
        <PinCard key={pin.uuid} pin={pin} />
      ))}
    </div>
  );
}
