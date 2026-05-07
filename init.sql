-- Script para crear el esquema en Supabase

-- 1. Tipo Enum para el estado de pines
CREATE TYPE public.estado_pin AS ENUM ('disponible', 'reservado', 'agotado');

-- 2. Tipo Enum para el estado de pedidos
CREATE TYPE public.estado_pedido AS ENUM ('pendiente', 'completado', 'cancelado');

-- 3. Tabla de Inventario
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

-- 4. Tabla de Pedidos
CREATE TABLE public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_nombre TEXT NOT NULL,
  cliente_telefono TEXT NOT NULL,
  cliente_email TEXT NOT NULL,
  items JSONB NOT NULL, -- Array de {uuid, nombre, precio, cantidad, image_url}
  total NUMERIC NOT NULL,
  estado public.estado_pedido NOT NULL DEFAULT 'pendiente',
  payment_method TEXT, -- 'whatsapp' o 'wompi'
  payment_id TEXT, -- ID de transacción Wompi
  payment_status TEXT, -- 'pending', 'completed', 'failed'
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE public.inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS para Inventario
-- Permitir lectura a todos (público)
CREATE POLICY "Lectura pública permitida" ON public.inventario
  FOR SELECT USING (true);

-- Permitir actualización solo a usuarios autenticados (Admin) o a través de Security Definer (RPC)
CREATE POLICY "Actualización admin" ON public.inventario
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 7. Políticas RLS para Pedidos
-- Permitir lectura solo a admin
CREATE POLICY "Admin puede leer pedidos" ON public.pedidos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir inserción a través de RPC (anónimo o usuario)
CREATE POLICY "Crear pedido" ON public.pedidos
  FOR INSERT WITH CHECK (true);

-- Permitir actualización solo a admin
CREATE POLICY "Admin puede actualizar pedidos" ON public.pedidos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 8. Activar Supabase Realtime para las tablas
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventario;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;

-- 9. Función RPC para crear un pedido (con manejo de stock)
CREATE OR REPLACE FUNCTION public.crear_pedido(
  p_cliente_nombre TEXT,
  p_cliente_telefono TEXT,
  p_cliente_email TEXT,
  p_items JSONB,
  p_total NUMERIC,
  p_payment_method TEXT DEFAULT 'whatsapp'
)
RETURNS UUID AS $$
DECLARE
  v_pedido_id UUID;
  v_item JSONB;
BEGIN
  -- Crear el pedido
  INSERT INTO public.pedidos (
    cliente_nombre, 
    cliente_telefono, 
    cliente_email, 
    items, 
    total,
    payment_method,
    estado
  )
  VALUES (
    p_cliente_nombre,
    p_cliente_telefono,
    p_cliente_email,
    p_items,
    p_total,
    p_payment_method,
    'pendiente'
  )
  RETURNING id INTO v_pedido_id;

  -- Descontar stock para cada item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    UPDATE public.inventario
    SET 
      stock_disponible = stock_disponible - (v_item->>'cantidad')::INT,
      estado = CASE 
                 WHEN stock_disponible - (v_item->>'cantidad')::INT <= 0 THEN 'agotado'::public.estado_pin
                 ELSE estado
               END
    WHERE uuid = (v_item->>'uuid')::UUID;
  END LOOP;

  RETURN v_pedido_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Función RPC anterior para reservar pines
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
