-- =====================================================================
-- ESQUEMA DE BASE DE DATOS PARA "BARBAS CUTS - BARBER STUDIO"
-- Compatible con PostgreSQL y Supabase (Despliegue Vercel)
-- =====================================================================

-- 1. Tabla de Configuración de Tickets y Negocio
CREATE TABLE IF NOT EXISTS ticket_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL DEFAULT 'BARBAS CUTS',
  sub_name TEXT DEFAULT 'BARBER STUDIO',
  address TEXT NOT NULL DEFAULT 'Calle Cipreses mz21 lt12, Los Reyes Acaquilpan, México, 56420',
  phone TEXT DEFAULT '55 1234 5678',
  instagram TEXT DEFAULT 'barbas_cuts',
  footer_message TEXT DEFAULT '¡Gracias por visitarnos! Luce tu mejor estilo.',
  logo_url TEXT DEFAULT '/images/logo_barbas_cuts.svg',
  show_courtesy_on_ticket BOOLEAN DEFAULT true,
  show_barber_name BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Barberos / Estilistas
CREATE TABLE IF NOT EXISTS barbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '💈',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Productos (Productos de Venta + Bebidas)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Servicios (Cortes, Barba, Faciales, Combos)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  duration_minutes INT DEFAULT 30,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'Cortes',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Ventas (Encabezado de Ticket / Registro POS)
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  barber_id UUID REFERENCES barbers(id),
  barber_name TEXT NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA')),
  amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  change_due NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  customer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla de Detalles de Venta (Items del Ticket)
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('SERVICE', 'PRODUCT', 'BEVERAGE')),
  item_id UUID NOT NULL,
  name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  is_courtesy BOOLEAN DEFAULT false,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabla de Historial y Movimientos de Inventario
CREATE TABLE IF NOT EXISTS inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('VENTA', 'ENTRADA', 'AJUSTE', 'CORTESIA')),
  quantity_change INT NOT NULL,
  previous_stock INT NOT NULL,
  new_stock INT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuración inicial
INSERT INTO ticket_config (business_name, sub_name, address, instagram)
VALUES ('BARBAS CUTS', 'BARBER STUDIO', 'Calle Cipreses mz21 lt12, Los Reyes Acaquilpan, México, 56420', 'barbas_cuts')
ON CONFLICT DO NOTHING;
