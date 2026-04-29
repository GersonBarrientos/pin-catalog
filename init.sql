-- Script para crear el esquema en Supabase

-- 1. Tipo Enum para el estado
CREATE TYPE public.estado_pin AS ENUM ('disponible', 'reservado', 'agotado');

-- 2. Tabla Principal
CREATE TABLE public.inventario (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  image_url TEXT,
  precio NUMERIC NOT NULL,
  stock_disponible INTEGER NOT NULL DEFAULT 0,
  estado public.estado_pin NOT NULL DEFAULT 'disponible',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.inventario ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
-- Permitir lectura a todos (público)
CREATE POLICY "Lectura pública permitida" ON public.inventario
  FOR SELECT USING (true);

-- Permitir actualización solo a usuarios autenticados (Admin) o a través de Security Definer (RPC)
CREATE POLICY "Actualización admin" ON public.inventario
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 5. Activar Supabase Realtime para la tabla
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventario;

-- 6. Función RPC para reservar atómicamente evitando condiciones de carrera
-- Security Definer permite que la función evada RLS si es llamada de forma anónima
CREATE OR REPLACE FUNCTION public.reservar_pines(pines_uuids UUID[])
RETURNS BOOLEAN AS $$
DECLARE
  filas_afectadas INTEGER;
BEGIN
  -- Intentar actualizar solo si TODOS están disponibles y con stock
  UPDATE public.inventario
  SET 
    stock_disponible = stock_disponible - 1,
    estado = CASE 
               WHEN stock_disponible - 1 <= 0 THEN 'reservado'::public.estado_pin
               ELSE estado
             END
  WHERE uuid = ANY(pines_uuids)
    AND stock_disponible > 0
    AND estado = 'disponible';
    
  GET DIAGNOSTICS filas_afectadas = ROW_COUNT;
  
  -- Verificar si se actualizaron todos los pines solicitados
  IF filas_afectadas = array_length(pines_uuids, 1) THEN
    RETURN true;
  ELSE
    -- Revertir explícitamente no es necesario porque es una transacción por defecto, 
    -- pero deberíamos lanzar un error o retornar falso
    RAISE EXCEPTION 'No se pudo reservar uno o más pines seleccionados. Stock insuficiente o estado inválido.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
