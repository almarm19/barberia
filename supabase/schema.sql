-- =====================================================================
-- ESQUEMA DE BASE DE DATOS PARA "BARBAS CUTS - BARBER STUDIO"
-- Compatible con PostgreSQL y Supabase (Despliegue Vercel)
-- =====================================================================

-- 1. Tabla de Configuración de Tickets y Negocio
CREATE TABLE IF NOT EXISTS ticket_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  business_name TEXT NOT NULL DEFAULT 'BARBAS CUTS',
  sub_name TEXT DEFAULT 'BARBER STUDIO',
  address TEXT NOT NULL DEFAULT 'Calle Cipreses mz21 lt12, Los Reyes Acaquilpan, México, 56420',
  phone TEXT DEFAULT '55 1234 5678',
  instagram TEXT DEFAULT 'barbas_cuts',
  footer_message TEXT DEFAULT '¡Gracias por visitarnos! Luce tu mejor estilo.',
  logo_url TEXT DEFAULT '/images/logo_barbas_cuts.svg',
  show_courtesy_on_ticket BOOLEAN DEFAULT true,
  show_barber_name BOOLEAN DEFAULT true,
  admin_password TEXT NOT NULL DEFAULT '1234',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migracion segura para instalaciones creadas con una version anterior.
ALTER TABLE ticket_config ADD COLUMN IF NOT EXISTS admin_password TEXT NOT NULL DEFAULT '1234';
ALTER TABLE ticket_config ALTER COLUMN id SET DEFAULT 'default';
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM ticket_config WHERE id = 'default') THEN
    DELETE FROM ticket_config WHERE id <> 'default';
  ELSE
    WITH latest AS (
      SELECT ctid FROM ticket_config ORDER BY created_at DESC NULLS LAST LIMIT 1
    )
    UPDATE ticket_config SET id = 'default'
    WHERE ctid IN (SELECT ctid FROM latest);
  END IF;
END $$;

-- 2. Tabla de Barberos / Estilistas
CREATE TABLE IF NOT EXISTS barbers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '💈',
  role TEXT DEFAULT 'Barbero Estilista',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Productos (Productos de Venta + Bebidas)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  min_stock INT NOT NULL DEFAULT 5,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  is_beverage BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  barber_commission_type TEXT DEFAULT 'PERCENTAGE',
  barber_commission_value NUMERIC(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Servicios (Cortes, Barba, Faciales, Combos)
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  duration_minutes INT DEFAULT 30,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'Cortes',
  active BOOLEAN DEFAULT true,
  barber_commission_type TEXT DEFAULT 'PERCENTAGE',
  barber_commission_value NUMERIC(10,2) DEFAULT 50.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Ventas (Encabezado de Ticket / Registro POS)
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ticket_number TEXT UNIQUE NOT NULL,
  barber_id TEXT NOT NULL,
  barber_name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  tip NUMERIC(10,2) DEFAULT 0.00,
  total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA')),
  amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  change_due NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  customer_notes TEXT,
  total_barber_commission NUMERIC(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla de Historial y Movimientos de Inventario
CREATE TABLE IF NOT EXISTS inventory_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('VENTA', 'ENTRADA', 'AJUSTE', 'CORTESIA')),
  quantity_change INT NOT NULL,
  previous_stock INT NOT NULL,
  new_stock INT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabla de Citas / Agenda
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  barber_id TEXT NOT NULL,
  barber_name TEXT NOT NULL,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  service_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONFIRMADA',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deshabilitar Row Level Security (RLS) para permitir lectura/escritura pública del POS
ALTER TABLE ticket_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE barbers DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- Activar Realtime sin fallar si alguna tabla ya estaba registrada.
DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'ticket_config', 'barbers', 'products', 'services',
    'sales', 'inventory_logs', 'appointments'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = table_name
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
    END IF;
  END LOOP;
END $$;

