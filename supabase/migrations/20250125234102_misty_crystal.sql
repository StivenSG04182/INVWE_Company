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
  company_id     text         NOT NULL UNIQUE,  -- MongoDB company ID
  name           text         NOT NULL,
  nit            text         NOT NULL UNIQUE,
  mongodb_id     text,
  security_code  text         NOT NULL,
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
  company_id         uuid         NOT NULL REFERENCES companies(id),  -- Supabase UUID reference
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
  company_id  uuid         NOT NULL REFERENCES companies(id),
  store_id    text         NOT NULL,  
  mongodb_store_id text,
  name        text         NOT NULL,
  address     text,
  phone       text,
  created_by  text         NOT NULL,  
  created_at  timestamptz  DEFAULT now(),
  updated_at  timestamptz  DEFAULT now(),
  UNIQUE(store_id)
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
CREATE FUNCTION update_updated_at_column()
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
    updated_at                 = NOW()
  WHERE id = (SELECT id FROM app_statistics LIMIT 1);
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

-- Función para asignar el rol de ADMINISTRATOR
CREATE OR REPLACE FUNCTION assign_administrator_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS NULL THEN
    NEW.role := 'ADMINISTRATOR';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para asignar una suscripción gratuita
CREATE OR REPLACE FUNCTION assign_free_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (company_id, user_id, plan_name, worker_limit, invoice_limit, store_limit, status)
  VALUES (NEW.company_id, NEW.user_id, 'Free Plan', 5, 50, 1, 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Modify companies table RLS policies
DROP POLICY IF EXISTS "companies_insert_policy" ON companies;

CREATE POLICY "companies_insert_policy"
  ON companies
  FOR INSERT
  WITH CHECK (true);  -- Allow initial company creation

CREATE POLICY "admin_full_access_policy" 
  ON companies
  FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.user_id = auth.uid()::text
        AND users_companies.role = 'ADMIN'
    )
  );

-- Actualizar todas las demás políticas de manera similar
CREATE POLICY "clients_select_policy" 
  ON clients
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.company_id = clients.company_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

-- Y así sucesivamente para todas las políticas que usen auth.uid()

CREATE POLICY "clients_insert_policy" 
  ON clients
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.company_id = clients.company_id
        AND users_companies.user_id = auth.uid()::text
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
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.company_id = clients.company_id
        AND users_companies.user_id = auth.uid()::text
    )
);

CREATE POLICY "clients_update_policy" 
  ON clients
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.company_id = clients.company_id
        AND users_companies.user_id = auth.uid()::text
    )
);

-- Tabla: products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_policy" 
  ON products
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.company_id = products.company_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

CREATE POLICY "products_insert_policy" 
  ON products
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.company_id = products.company_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

CREATE POLICY "products_delete_policy" 
  ON products
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.company_id = products.company_id
        AND users_companies.user_id = auth.uid()::text
    )
);

CREATE POLICY "products_update_policy" 
  ON products
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.company_id = products.company_id
        AND users_companies.user_id = auth.uid()::text
    )
);

-- Tabla: invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_select_policy" 
  ON invoices
  FOR SELECT
  USING (
    EXISTS (SELECT 1
      FROM clients
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE clients.id = invoices.client_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

CREATE POLICY "invoices_insert_policy" 
  ON invoices
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1
      FROM clients
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE clients.id = invoices.client_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

CREATE POLICY "invoices_update_policy" 
  ON invoices
  FOR UPDATE
  USING (
    EXISTS (SELECT 1
      FROM clients
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE clients.id = invoices.client_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

CREATE POLICY "invoices_delete_policy" 
  ON invoices
  FOR DELETE
  USING (
    EXISTS (SELECT 1
      FROM clients
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE clients.id = invoices.client_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

-- Tabla: invoice_items
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_items_select_policy" 
  ON invoice_items
  FOR SELECT
  USING (
    EXISTS (SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = invoice_items.invoice_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

CREATE POLICY "invoice_items_insert_policy" 
  ON invoice_items
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = invoice_items.invoice_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

CREATE POLICY "invoice_items_delete_policy" 
  ON invoice_items
  FOR DELETE
  USING (
    EXISTS (SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = invoice_items.invoice_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

CREATE POLICY "invoice_items_update_policy" 
  ON invoice_items
  FOR UPDATE
  USING (
    EXISTS (SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = invoice_items.invoice_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

-- Tabla: credit_notes
ALTER TABLE credit_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credit_notes_select_policy" 
  ON credit_notes
  FOR SELECT
  USING (
    EXISTS (SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = credit_notes.invoice_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

CREATE POLICY "credit_notes_insert_policy" 
  ON credit_notes
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = credit_notes.invoice_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

CREATE POLICY "credit_notes_update_policy" 
  ON credit_notes
  FOR UPDATE
  USING (
    EXISTS (SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = credit_notes.invoice_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

CREATE POLICY "credit_notes_delete_policy" 
  ON credit_notes
  FOR DELETE
  USING (
    EXISTS (SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = credit_notes.invoice_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

-- Tabla: debit_notes
ALTER TABLE debit_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "debit_notes_select_policy" 
  ON debit_notes
  FOR SELECT
  USING (
    EXISTS (SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = debit_notes.invoice_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

CREATE POLICY "debit_notes_insert_policy" 
  ON debit_notes
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = debit_notes.invoice_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

CREATE POLICY "debit_notes_update_policy" 
  ON debit_notes
  FOR UPDATE
  USING (
    EXISTS (SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = debit_notes.invoice_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

CREATE POLICY "debit_notes_delete_policy" 
  ON debit_notes
  FOR DELETE
  USING (
    EXISTS (SELECT 1
      FROM invoices
      JOIN clients ON clients.id = invoices.client_id
      JOIN users_companies ON users_companies.company_id = clients.company_id
      WHERE invoices.id = debit_notes.invoice_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

-- Tabla: dian_config
ALTER TABLE dian_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dian_config_select_policy" 
  ON dian_config
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.company_id = dian_config.company_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

CREATE POLICY "dian_config_insert_policy" 
  ON dian_config
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.company_id = dian_config.company_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

CREATE POLICY "dian_config_update_policy" 
  ON dian_config
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.company_id = dian_config.company_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

CREATE POLICY "dian_config_delete_policy" 
  ON dian_config
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.company_id = dian_config.company_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

-- Tabla: subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_subscriptions_policy" 
  ON subscriptions
  FOR ALL 
  USING (
    auth.uid()::text = user_id OR
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.company_id = subscriptions.company_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

CREATE POLICY "subscriptions_insert_policy" 
  ON subscriptions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "subscriptions_delete_policy" 
  ON subscriptions
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.company_id = subscriptions.company_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

CREATE POLICY "subscriptions_update_policy" 
  ON subscriptions
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.company_id = subscriptions.company_id
        AND users_companies.user_id = auth.uid()::text
    )
  );

-- Tabla: stores
alter table "public"."stores" enable row level security;

CREATE POLICY "stores_insert_policy"
ON stores
FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM users_companies
    WHERE users_companies.company_id = stores.company_id
      AND users_companies.user_id = auth.uid()::text
      AND users_companies.role IN ('ADMIN', 'ADMINISTRATOR', 'EMPLOYEE')
  )
);

CREATE POLICY "stores_select_policy"
ON stores
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM users_companies
    WHERE users_companies.company_id = stores.company_id
      AND users_companies.user_id = auth.uid()::text
  )
);

CREATE POLICY "stores_update_policy"
ON stores
FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM users_companies
    WHERE users_companies.company_id = stores.company_id
      AND users_companies.user_id = auth.uid()::text
      AND users_companies.role IN ('ADMIN', 'ADMINISTRATOR')
  )
);

CREATE POLICY "stores_delete_policy"
ON stores
FOR DELETE
USING (
  EXISTS (SELECT 1 FROM users_companies
    WHERE users_companies.company_id = stores.company_id
      AND users_companies.user_id = auth.uid()::text
      AND users_companies.role IN ('ADMIN', 'ADMINISTRATOR')
  )
);

-- Tabla: app_statistics
ALTER TABLE app_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_statistics_policy" 
  ON app_statistics
  FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.user_id = auth.uid()::text
        AND users_companies.role = 'ADMIN'
    )
  );

--------------------------------------------------------------------------------
-- 6. CREACIÓN DE TRIGGERS
--------------------------------------------------------------------------------
-- Triggers para actualizar la columna updated_at
-- invoice_items
DROP TRIGGER IF EXISTS trg_update_updated_at ON invoice_items;
CREATE TRIGGER trg_update_updated_at
BEFORE UPDATE ON invoice_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers para actualizar estadísticas
DROP TRIGGER IF EXISTS trg_update_statistics_users_companies ON users_companies;
CREATE TRIGGER trg_update_statistics_users_companies
AFTER INSERT OR UPDATE OR DELETE ON users_companies
FOR EACH STATEMENT EXECUTE FUNCTION update_app_statistics();

DROP TRIGGER IF EXISTS trg_update_statistics_clients ON clients;
CREATE TRIGGER trg_update_statistics_clients
AFTER INSERT OR UPDATE OR DELETE ON clients
FOR EACH STATEMENT EXECUTE FUNCTION update_app_statistics();

DROP TRIGGER IF EXISTS trg_update_statistics_products ON products;
CREATE TRIGGER trg_update_statistics_products
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH STATEMENT EXECUTE FUNCTION update_app_statistics();

DROP TRIGGER IF EXISTS trg_update_statistics_stores ON stores;
CREATE TRIGGER trg_update_statistics_stores
AFTER INSERT OR UPDATE OR DELETE ON stores
FOR EACH STATEMENT EXECUTE FUNCTION update_app_statistics();

-- Trigger para asignar el rol de ADMINISTRATOR
DROP TRIGGER IF EXISTS trg_assign_administrator_role ON users_companies;
CREATE TRIGGER trg_assign_administrator_role
BEFORE INSERT ON users_companies
FOR EACH ROW EXECUTE FUNCTION assign_administrator_role();

-- Trigger para asignar una suscripción gratuita
DROP TRIGGER IF EXISTS trg_assign_free_subscription ON users_companies;
CREATE TRIGGER trg_assign_free_subscription
AFTER INSERT ON users_companies
FOR EACH ROW EXECUTE FUNCTION assign_free_subscription();

-- Asegurar que solo haya un ADMINISTRATOR por empresa
ALTER TABLE users_companies
ADD CONSTRAINT one_administrator_per_company 
EXCLUDE USING btree (company_id WITH =) 
WHERE (role = 'ADMINISTRATOR');

-- Asegurar que el usuario tenga un rol válido
ALTER TABLE users_companies
ADD CONSTRAINT valid_user_role CHECK (role IN ('ADMIN', 'ADMINISTRATOR', 'EMPLOYEE'));

-- Asegurar que el estado de la suscripción sea válido
ALTER TABLE subscriptions
ADD CONSTRAINT valid_subscription_status CHECK (status IN ('active', 'inactive'));

-- Asegurar que el estado de la factura sea válido
ALTER TABLE invoices
ADD CONSTRAINT valid_invoice_status CHECK (status IN ('draft', 'sent', 'paid', 'cancelled'));

-- Asegurar que el estado de la nota de crédito sea válido
ALTER TABLE credit_notes
ADD CONSTRAINT valid_credit_note_status CHECK (status IN ('draft', 'final'));

-- Asegurar que el estado de la nota de débito sea válido
ALTER TABLE debit_notes
ADD CONSTRAINT valid_debit_note_status CHECK (status IN ('draft', 'final'));

-- Asegurar que el tipo de cliente sea válido
ALTER TABLE clients
ADD CONSTRAINT valid_client_type CHECK (client_type IN ('company', 'individual'));

-- Asegurar que el tipo de producto sea válido
ALTER TABLE products
ADD CONSTRAINT valid_product_type CHECK (product_type IN ('product', 'service'));

-- Asegurar que la medida de unidad sea válida
ALTER TABLE products
ADD CONSTRAINT valid_unit_measure CHECK (unit_measure IN ('unit', 'kg', 'litre', 'piece'));