--------------------------------------------------------------------------------
-- 1. EXTENSIONES
--------------------------------------------------------------------------------
-- Habilitar la extensión para funciones criptográficas (necesaria para gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS pgcrypto;

--------------------------------------------------------------------------------
-- 2. CREACIÓN DE TABLAS
--------------------------------------------------------------------------------
-- Tabla: companies
CREATE TABLE IF NOT EXISTS companies (
  id             uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text         NOT NULL,
  nit            text         NOT NULL UNIQUE,
  security_code  text         NOT NULL,
  mongodb_id     text         NOT NULL,
  logo_url       text,
  business_name  text         NOT NULL,
  tax_id         text         NOT NULL UNIQUE,
  address        text         NOT NULL,
  phone          text,
  email          text         NOT NULL,
  dian_registered boolean     DEFAULT false,
  created_at     timestamptz  DEFAULT now(),
  updated_at     timestamptz  DEFAULT now()
);

-- Tabla: users_companies (Relación entre usuarios y empresas)
CREATE TABLE IF NOT EXISTS users_companies (
  id                 uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            text         NOT NULL,
  company_id         uuid         NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role               text         NOT NULL CHECK (role IN ('ADMIN', 'ADMINISTRATOR', 'EMPLOYEE')),
  nombres_apellidos  text         NOT NULL,       
  correo_electronico text         NOT NULL,         
  telefono           text,
  fecha_nacimiento   date,
  genero             text,
  direccion          text,
  created_at         timestamptz  DEFAULT now(),
  updated_at         timestamptz  DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Tabla: clients
CREATE TABLE IF NOT EXISTS clients (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid         NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  business_name text         NOT NULL,
  tax_id        text         NOT NULL,
  address       text         NOT NULL,
  phone         text,
  email         text,
  client_type   text         NOT NULL DEFAULT 'company',
  created_at    timestamptz  DEFAULT now(),
  updated_at    timestamptz  DEFAULT now(),
  UNIQUE(company_id, tax_id)
);

-- Tabla: products
CREATE TABLE IF NOT EXISTS products (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid         NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code          text         NOT NULL,
  name          text         NOT NULL,
  description   text,
  sku           text         NOT NULL,
  quantity      integer      NOT NULL DEFAULT 0,
  price         numeric(10,2) NOT NULL DEFAULT 0,
  unit_price    numeric(15,2) NOT NULL DEFAULT 0,
  tax_rate      numeric(5,2)  NOT NULL DEFAULT 0,
  product_type  text         NOT NULL DEFAULT 'product',
  unit_measure  text         NOT NULL DEFAULT 'unit',
  created_at    timestamptz  DEFAULT now(),
  updated_at    timestamptz  DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Tabla: invoices
CREATE TABLE IF NOT EXISTS invoices (
  id             uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      uuid         NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  invoice_number text         NOT NULL,
  invoice_date   date         NOT NULL DEFAULT CURRENT_DATE,
  due_date       date         NOT NULL,
  subtotal       numeric(15,2) NOT NULL DEFAULT 0,
  tax_total      numeric(15,2) NOT NULL DEFAULT 0,
  total          numeric(15,2) NOT NULL DEFAULT 0,
  status         text         NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
  cufe           text         UNIQUE,
  xml_document   text,
  pdf_document   text,
  created_at     timestamptz  DEFAULT now(),
  updated_at     timestamptz  DEFAULT now(),
  UNIQUE(client_id, invoice_number)
);

-- Tabla: invoice_items
CREATE TABLE IF NOT EXISTS invoice_items (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id  uuid         NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id  uuid         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    numeric(15,2) NOT NULL DEFAULT 1,
  unit_price  numeric(15,2) NOT NULL,
  tax_rate    numeric(5,2)  NOT NULL,
  tax_amount  numeric(15,2) NOT NULL,
  subtotal    numeric(15,2) NOT NULL,
  total       numeric(15,2) NOT NULL,
  created_at  timestamptz  DEFAULT now()
);

-- Tabla: credit_notes
CREATE TABLE IF NOT EXISTS credit_notes (
  id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id   uuid         NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  note_number  text         NOT NULL,
  note_date    date         NOT NULL DEFAULT CURRENT_DATE,
  reason       text         NOT NULL,
  subtotal     numeric(15,2) NOT NULL DEFAULT 0,
  tax_total    numeric(15,2) NOT NULL DEFAULT 0,
  total        numeric(15,2) NOT NULL DEFAULT 0,
  status       text         NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'final')),
  cufe         text         UNIQUE,
  xml_document text,
  pdf_document text,
  created_at   timestamptz  DEFAULT now(),
  updated_at   timestamptz  DEFAULT now(),
  UNIQUE(invoice_id, note_number)
);

-- Tabla: debit_notes
CREATE TABLE IF NOT EXISTS debit_notes (
  id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id   uuid         NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  note_number  text         NOT NULL,
  note_date    date         NOT NULL DEFAULT CURRENT_DATE,
  reason       text         NOT NULL,
  subtotal     numeric(15,2) NOT NULL DEFAULT 0,
  tax_total    numeric(15,2) NOT NULL DEFAULT 0,
  total        numeric(15,2) NOT NULL DEFAULT 0,
  status       text         NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'final')),
  cufe         text         UNIQUE,
  xml_document text,
  pdf_document text,
  created_at   timestamptz  DEFAULT now(),
  updated_at   timestamptz  DEFAULT now(),
  UNIQUE(invoice_id, note_number)
);

-- Tabla: dian_config
CREATE TABLE IF NOT EXISTS dian_config (
  id                    uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            uuid         NOT NULL REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  test_mode             boolean      DEFAULT true,
  certificate           text         NOT NULL,
  technical_key         text         NOT NULL,
  software_id           text         NOT NULL,
  software_pin          text         NOT NULL,
  resolution_number     text         NOT NULL,
  resolution_date       date         NOT NULL,
  resolution_start_date date         NOT NULL,
  resolution_end_date   date         NOT NULL,
  resolution_prefix     text,
  resolution_from       integer      NOT NULL,
  resolution_to         integer      NOT NULL,
  current_number        integer      NOT NULL,
  created_at            timestamptz  DEFAULT now(),
  updated_at            timestamptz  DEFAULT now()
);

-- Tabla: subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid         NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id       text         NOT NULL,
  plan_name     text         NOT NULL,
  worker_limit  integer      NOT NULL,
  invoice_limit integer      NOT NULL,
  store_limit   integer      NOT NULL,
  status        text         NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at    timestamptz  DEFAULT now(),
  updated_at    timestamptz  DEFAULT now()
);

-- Tabla: stores
CREATE TABLE IF NOT EXISTS stores (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid         NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name        text         NOT NULL,
  address     text,
  phone       text,
  created_by  text         NOT NULL,
  created_at  timestamptz  DEFAULT now(),
  updated_at  timestamptz  DEFAULT now()
);

-- Tabla: app_statistics (para estadísticas de la aplicación)
CREATE TABLE IF NOT EXISTS app_statistics (
  id                         uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  total_companies            integer      NOT NULL DEFAULT 0,
  total_administrators       integer      NOT NULL DEFAULT 0,
  total_employees            integer      NOT NULL DEFAULT 0,
  total_stores               integer      NOT NULL DEFAULT 0,
  total_active_subscriptions integer      NOT NULL DEFAULT 0,
  total_invoices             integer      NOT NULL DEFAULT 0,
  total_revenue              numeric(15,2) NOT NULL DEFAULT 0,
  updated_at                 timestamptz  DEFAULT now()
);

--------------------------------------------------------------------------------
-- 3. CREACIÓN DE FUNCIONES
--------------------------------------------------------------------------------
-- Función para actualizar la columna updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar las estadísticas de la aplicación
CREATE OR REPLACE FUNCTION update_app_statistics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE app_statistics
  SET 
    total_companies            = (SELECT COUNT(*) FROM companies),
    total_administrators       = (SELECT COUNT(*) FROM users_companies WHERE role = 'ADMINISTRATOR'),
    total_employees            = (SELECT COUNT(*) FROM users_companies WHERE role = 'EMPLOYEE'),
    total_stores               = (SELECT COUNT(*) FROM stores),
    total_active_subscriptions = (SELECT COUNT(*) FROM subscriptions WHERE status = 'active'),
    total_invoices             = (SELECT COUNT(*) FROM invoices WHERE status = 'paid'),
    total_revenue              = (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE status = 'paid'),
    updated_at                 = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para validar límites de suscripción al insertar/actualizar usuarios en una empresa
CREATE OR REPLACE FUNCTION check_subscription_limits()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF (
      SELECT COUNT(*) FROM users_companies WHERE company_id = NEW.company_id
    ) > (
      SELECT worker_limit FROM subscriptions WHERE company_id = NEW.company_id AND status = 'active'
    ) THEN
      RAISE EXCEPTION 'Employee limit exceeded for this subscription';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función auxiliar para verificar roles (disponible en políticas o lógica adicional)
-- Primero, modificar la tabla users_companies
ALTER TABLE users_companies 
ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- Modificar la tabla subscriptions
ALTER TABLE subscriptions 
ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- Modificar la tabla stores
ALTER TABLE stores 
ALTER COLUMN created_by TYPE uuid USING created_by::uuid;

-- Ahora las políticas ya no necesitarán el cast explícito
CREATE POLICY "companies_insert_policy" 
ON companies
FOR INSERT 
WITH CHECK (true);  

CREATE POLICY "companies_select_policy" 
ON companies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users_companies
    WHERE users_companies.company_id = companies.id
      AND users_companies.user_id = auth.uid()::uuid
  )
);

CREATE POLICY "companies_update_delete_policy" 
ON companies
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM users_companies
    WHERE users_companies.company_id = companies.id
      AND users_companies.user_id = auth.uid()::uuid
      AND users_companies.role IN ('ADMIN', 'ADMINISTRATOR')
  )
);

-- Actualizar la función check_user_role
CREATE OR REPLACE FUNCTION check_user_role(company_uuid uuid, required_role text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users_companies
    WHERE company_id = company_uuid
      AND user_id = auth.uid()::uuid
      AND (
        CASE 
          WHEN required_role = 'ADMIN' THEN role = 'ADMIN'
          WHEN required_role = 'ADMINISTRATOR' THEN role IN ('ADMIN', 'ADMINISTRATOR')
          WHEN required_role = 'EMPLOYEE' THEN role IN ('ADMIN', 'ADMINISTRATOR', 'EMPLOYEE')
        END
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--------------------------------------------------------------------------------
-- 4. CREACIÓN DE ÍNDICES
--------------------------------------------------------------------------------
-- Índices en users_companies
CREATE INDEX IF NOT EXISTS idx_users_companies_user_id ON users_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_users_companies_company_id ON users_companies(company_id);
CREATE INDEX IF NOT EXISTS idx_users_companies_role ON users_companies(role);
CREATE INDEX IF NOT EXISTS idx_users_companies_role_company ON users_companies(company_id, role);

-- Índices en clients
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients(company_id);

-- Índices en products
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);

-- Índices en invoices
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);

-- Índices en invoice_items
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Índices en credit_notes
CREATE INDEX IF NOT EXISTS idx_credit_notes_invoice_id ON credit_notes(invoice_id);

-- Índices en debit_notes
CREATE INDEX IF NOT EXISTS idx_debit_notes_invoice_id ON debit_notes(invoice_id);

-- Índices en dian_config
CREATE INDEX IF NOT EXISTS idx_dian_config_company_id ON dian_config(company_id);

-- Índices en subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_company_id ON subscriptions(company_id);

-- Índices en stores
CREATE INDEX IF NOT EXISTS idx_stores_company_id ON stores(company_id);

--------------------------------------------------------------------------------
-- 5. HABILITAR RLS Y DEFINIR POLÍTICAS
--------------------------------------------------------------------------------
-- Tabla: companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Modificar las políticas para incluir el cast a UUID
-- Primero eliminar la política existente
DROP POLICY IF EXISTS "companies_select_policy" ON companies;

-- Luego crear la nueva política
CREATE POLICY "companies_select_policy" 
  ON companies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_companies
      WHERE users_companies.company_id = companies.id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "admin_full_access_policy" 
  ON companies
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users_companies
      WHERE users_companies.user_id = auth.uid()::uuid
        AND users_companies.role = 'ADMIN'
    )
  );

-- Actualizar todas las demás políticas de manera similar
CREATE POLICY "clients_select_policy" 
  ON clients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_companies
      WHERE users_companies.company_id = clients.company_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

-- Y así sucesivamente para todas las políticas que usen auth.uid()

CREATE POLICY "clients_insert_policy" 
  ON clients
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_companies
      WHERE users_companies.company_id = clients.company_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

-- Eliminar las políticas existentes primero
DROP POLICY IF EXISTS "clients_update_policy" ON clients;
DROP POLICY IF EXISTS "clients_delete_policy" ON clients;

-- Crear las políticas con nombres diferentes
CREATE POLICY "clients_delete_policy" 
  ON clients
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users_companies
      WHERE users_companies.company_id = clients.company_id
        AND users_companies.user_id = auth.uid()::uuid
    )
);

CREATE POLICY "clients_update_policy" 
  ON clients
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users_companies
      WHERE users_companies.company_id = clients.company_id
        AND users_companies.user_id = auth.uid()::uuid
    )
);

-- Tabla: products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_policy" 
  ON products
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_companies
      WHERE users_companies.company_id = products.company_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "products_insert_policy" 
  ON products
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_companies
      WHERE users_companies.company_id = products.company_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "products_delete_policy" 
  ON products
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users_companies
      WHERE users_companies.company_id = products.company_id
        AND users_companies.user_id = auth.uid()::uuid
    )
);

CREATE POLICY "products_update_policy" 
  ON products
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users_companies
      WHERE users_companies.company_id = products.company_id
        AND users_companies.user_id = auth.uid()::uuid
    )
);

-- Tabla: invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_select_policy" 
  ON invoices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM clients
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE clients.id = invoices.client_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "invoices_insert_policy" 
  ON invoices
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM clients
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE clients.id = invoices.client_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "invoices_update_policy" 
  ON invoices
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM clients
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE clients.id = invoices.client_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "invoices_delete_policy" 
  ON invoices
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM clients
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE clients.id = invoices.client_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

-- Tabla: invoice_items
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_items_select_policy" 
  ON invoice_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = invoice_items.invoice_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "invoice_items_insert_policy" 
  ON invoice_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = invoice_items.invoice_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "invoice_items_delete_policy" 
  ON invoice_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = invoice_items.invoice_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "invoice_items_update_policy" 
  ON invoice_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = invoice_items.invoice_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

-- Tabla: credit_notes
ALTER TABLE credit_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credit_notes_select_policy" 
  ON credit_notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = credit_notes.invoice_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "credit_notes_insert_policy" 
  ON credit_notes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = credit_notes.invoice_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "credit_notes_update_policy" 
  ON credit_notes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = credit_notes.invoice_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "credit_notes_delete_policy" 
  ON credit_notes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = credit_notes.invoice_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

-- Tabla: debit_notes
ALTER TABLE debit_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "debit_notes_select_policy" 
  ON debit_notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = debit_notes.invoice_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "debit_notes_insert_policy" 
  ON debit_notes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = debit_notes.invoice_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "debit_notes_update_policy" 
  ON debit_notes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = debit_notes.invoice_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "debit_notes_delete_policy" 
  ON debit_notes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = debit_notes.invoice_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

-- Tabla: dian_config
ALTER TABLE dian_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dian_config_select_policy" 
  ON dian_config
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_companies
      WHERE users_companies.company_id = dian_config.company_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "dian_config_insert_policy" 
  ON dian_config
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_companies
      WHERE users_companies.company_id = dian_config.company_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "dian_config_update_policy" 
  ON dian_config
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users_companies
      WHERE users_companies.company_id = dian_config.company_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "dian_config_delete_policy" 
  ON dian_config
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users_companies
      WHERE users_companies.company_id = dian_config.company_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

-- Tabla: subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "administrator_manage_subscriptions_policy" 
  ON subscriptions
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users_companies
      WHERE users_companies.company_id = subscriptions.company_id
        AND users_companies.user_id = auth.uid()::uuid
        AND users_companies.role = 'ADMINISTRATOR'
    )
  );

CREATE POLICY "subscriptions_insert_policy" 
  ON subscriptions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_companies
      WHERE users_companies.company_id = subscriptions.company_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "subscriptions_delete_policy" 
  ON subscriptions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users_companies
      WHERE users_companies.company_id = subscriptions.company_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "subscriptions_update_policy" 
  ON subscriptions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users_companies
      WHERE users_companies.company_id = subscriptions.company_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );
-- Tabla: stores
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stores_select_policy" 
  ON stores
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_companies
      WHERE users_companies.company_id = stores.company_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "stores_insert_policy" 
  ON stores
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_companies
      WHERE users_companies.company_id = stores.company_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "stores_update_policy" 
  ON stores
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users_companies
      WHERE users_companies.company_id = stores.company_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "stores_delete_policy" 
  ON stores
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users_companies
      WHERE users_companies.company_id = stores.company_id
        AND users_companies.user_id = auth.uid()::uuid
    )
  );

-- Tabla: app_statistics
ALTER TABLE app_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_statistics_policy" 
  ON app_statistics
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users_companies
      WHERE users_companies.user_id = auth.uid()::uuid
        AND users_companies.role = 'ADMIN'
    )
  );

--------------------------------------------------------------------------------
-- 6. CREACIÓN DE TRIGGERS
--------------------------------------------------------------------------------
-- Triggers para actualizar la columna updated_at
-- companies
DROP TRIGGER IF EXISTS trg_update_updated_at ON companies;
CREATE TRIGGER trg_update_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- users_companies
DROP TRIGGER IF EXISTS trg_update_updated_at ON users_companies;
CREATE TRIGGER trg_update_updated_at
BEFORE UPDATE ON users_companies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- clients
DROP TRIGGER IF EXISTS trg_update_updated_at ON clients;
CREATE TRIGGER trg_update_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- products
DROP TRIGGER IF EXISTS trg_update_updated_at ON products;
CREATE TRIGGER trg_update_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- invoices
DROP TRIGGER IF EXISTS trg_update_updated_at ON invoices;
CREATE TRIGGER trg_update_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- credit_notes
DROP TRIGGER IF EXISTS trg_update_updated_at ON credit_notes;
CREATE TRIGGER trg_update_updated_at
BEFORE UPDATE ON credit_notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- debit_notes
DROP TRIGGER IF EXISTS trg_update_updated_at ON debit_notes;
CREATE TRIGGER trg_update_updated_at
BEFORE UPDATE ON debit_notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- dian_config
DROP TRIGGER IF EXISTS trg_update_updated_at ON dian_config;
CREATE TRIGGER trg_update_updated_at
BEFORE UPDATE ON dian_config
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- subscriptions
DROP TRIGGER IF EXISTS trg_update_updated_at ON subscriptions;
CREATE TRIGGER trg_update_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- stores
DROP TRIGGER IF EXISTS trg_update_updated_at ON stores;
CREATE TRIGGER trg_update_updated_at
BEFORE UPDATE ON stores
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers para actualizar estadísticas
DROP TRIGGER IF EXISTS trg_update_statistics_companies ON companies;
CREATE TRIGGER trg_update_statistics_companies
AFTER INSERT OR UPDATE OR DELETE ON companies
FOR EACH STATEMENT EXECUTE FUNCTION update_app_statistics();

DROP TRIGGER IF EXISTS trg_update_statistics_invoices ON invoices;
CREATE TRIGGER trg_update_statistics_invoices
AFTER INSERT OR UPDATE OR DELETE ON invoices
FOR EACH STATEMENT EXECUTE FUNCTION update_app_statistics();

-- Trigger para validar límites de suscripción en users_companies
DROP TRIGGER IF EXISTS check_subscription_limits_trigger ON users_companies;
CREATE TRIGGER check_subscription_limits_trigger
BEFORE INSERT OR UPDATE ON users_companies
FOR EACH ROW
EXECUTE FUNCTION check_subscription_limits();

-- Restricción para asegurar que solo haya un ADMINISTRATOR por empresa
ALTER TABLE users_companies
ADD CONSTRAINT one_administrator_per_company 
EXCLUDE USING btree (company_id WITH =) 
WHERE (role = 'ADMINISTRATOR');

-- Eliminar todas las políticas y bucket existentes
DROP POLICY IF EXISTS "allow_all_logos" ON storage.objects;
DROP POLICY IF EXISTS "logos_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "logos_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "logos_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "logos_delete_policy" ON storage.objects;

-- Limpiar completamente el bucket
DELETE FROM storage.objects WHERE bucket_id = 'logos';
DELETE FROM storage.buckets WHERE id = 'logos';

-- Deshabilitar temporalmente RLS para storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Crear el bucket con configuración básica
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true);

-- Habilitar RLS nuevamente
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Crear una única política super permisiva sin restricciones
CREATE POLICY "unrestricted_storage_policy"
ON storage.objects
FOR ALL
TO public
USING (true)
WITH CHECK (true);