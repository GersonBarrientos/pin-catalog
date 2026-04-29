-- Script para actualizar la base de datos con el sistema de Pedidos

-- 1. Crear tabla pedidos
CREATE TABLE IF NOT EXISTS public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_nombre TEXT NOT NULL,
  cliente_telefono TEXT NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Añadir pedidos a Realtime (Si da error porque ya existe, ignóralo)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;

-- 3. Políticas de seguridad (RLS)
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cualquiera puede crear pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Admin puede ver pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Admin puede actualizar pedidos" ON public.pedidos;

-- Permitir que cualquiera cree un pedido (inserte)
CREATE POLICY "Cualquiera puede crear pedidos" ON public.pedidos FOR INSERT WITH CHECK (true);

-- Solo administradores pueden ver y actualizar los pedidos
CREATE POLICY "Admin puede ver pedidos" ON public.pedidos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin puede actualizar pedidos" ON public.pedidos FOR UPDATE USING (auth.role() = 'authenticated');

-- 4. Función atómica para procesar el pedido de forma segura
CREATE OR REPLACE FUNCTION public.crear_pedido(
  p_cliente_nombre TEXT,
  p_cliente_telefono TEXT,
  p_items JSONB,
  p_total NUMERIC
) RETURNS UUID AS $$
DECLARE
  v_pedido_id UUID;
  item JSONB;
  v_uuid UUID;
  v_cantidad INT;
  v_stock_actual INT;
BEGIN
  -- Bloquear y actualizar cada pin
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_uuid := (item->>'uuid')::UUID;
    v_cantidad := (item->>'cantidad')::INT;

    -- Obtener stock actual con bloqueo
    SELECT stock_disponible INTO v_stock_actual
    FROM public.inventario
    WHERE uuid = v_uuid AND estado = 'disponible'
    FOR UPDATE;

    IF v_stock_actual IS NULL OR v_stock_actual < v_cantidad THEN
      RAISE EXCEPTION 'Stock insuficiente para uno de los pines seleccionados.';
    END IF;

    -- Descontar stock
    UPDATE public.inventario
    SET stock_disponible = stock_disponible - v_cantidad,
        estado = CASE WHEN stock_disponible - v_cantidad <= 0 THEN 'agotado'::public.estado_pin ELSE estado END
    WHERE uuid = v_uuid;
  END LOOP;

  -- Crear el pedido
  INSERT INTO public.pedidos (cliente_nombre, cliente_telefono, items, total, estado)
  VALUES (p_cliente_nombre, p_cliente_telefono, p_items, p_total, 'pendiente')
  RETURNING id INTO v_pedido_id;

  RETURN v_pedido_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Nuevas politicas para gestionar el inventario desde el admin
DROP POLICY IF EXISTS "Admin puede insertar pines" ON public.inventario;
DROP POLICY IF EXISTS "Admin puede eliminar pines" ON public.inventario;

CREATE POLICY "Admin puede insertar pines" ON public.inventario FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin puede eliminar pines" ON public.inventario FOR DELETE USING (auth.role() = 'authenticated');

-- 5. STORAGE (BUCKET PARA IMAGENES) 
-- ========================================== 

-- Crear el bucket 'pines-images' publico 
INSERT INTO storage.buckets (id, name, public) VALUES ('pines-images', 'pines-images', true) ON CONFLICT (id) DO NOTHING;

-- Borrar politicas anteriores por si acaso
DROP POLICY IF EXISTS "Imagenes publicas" ON storage.objects;
DROP POLICY IF EXISTS "Admin puede subir imagenes" ON storage.objects;
DROP POLICY IF EXISTS "Admin puede actualizar imagenes" ON storage.objects;
DROP POLICY IF EXISTS "Admin puede eliminar imagenes" ON storage.objects;

-- Politica para que todo el mundo pueda ver las imagenes (Lectura Publica) 
CREATE POLICY "Imagenes publicas" ON storage.objects FOR SELECT USING (bucket_id = 'pines-images');

-- Politicas para que el administrador pueda subir, actualizar y borrar 
CREATE POLICY "Admin puede subir imagenes" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'pines-images');
CREATE POLICY "Admin puede actualizar imagenes" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'pines-images');
CREATE POLICY "Admin puede eliminar imagenes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'pines-images');
