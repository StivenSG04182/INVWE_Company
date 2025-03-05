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
  mongodb_id     text,
  logo_url       text,
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
  mongodb_id         text,  -- Added column for MongoDB ID
  is_default_inventory boolean DEFAULT false,  -- Flag to indicate if this is the default inventory
  created_at         timestamptz  DEFAULT now(),
  updated_at         timestamptz  DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Tabla: clients
CREATE TABLE IF NOT EXISTS clients (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid         NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  address       text         NOT NULL,
  phone         text,
  email         text,
  client_type   text         NOT NULL DEFAULT 'company',
  created_at    timestamptz  DEFAULT now(),
  updated_at    timestamptz  DEFAULT now(),
  UNIQUE(company_id)
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
  mongodb_store_id  text,
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
  total_ecommerce_orders     integer      NOT NULL DEFAULT 0,
  total_ecommerce_revenue    numeric(15,2) NOT NULL DEFAULT 0,
  updated_at                 timestamptz  DEFAULT now()
);

-- Tabla: store_inventory (para manejar el inventario por tienda)
CREATE TABLE IF NOT EXISTS store_inventory (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id      uuid         NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id    uuid         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity      integer      NOT NULL DEFAULT 0,
  min_stock     integer      NOT NULL DEFAULT 5,
  max_stock     integer      NOT NULL DEFAULT 100,
  mongodb_inventory_id text,
  created_at    timestamptz  DEFAULT now(),
  updated_at    timestamptz  DEFAULT now(),
  UNIQUE(store_id, product_id)
);

-- Tabla: inventory_movements (para registrar movimientos de inventario)
CREATE TABLE IF NOT EXISTS inventory_movements (
  id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id          uuid         NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id        uuid         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type     text         NOT NULL CHECK (movement_type IN ('entry', 'exit', 'transfer', 'adjustment')),
  quantity          integer      NOT NULL,
  previous_quantity integer      NOT NULL,
  new_quantity      integer      NOT NULL,
  reference_id      uuid,
  reference_type    text,
  notes             text,
  created_by        text         NOT NULL,
  created_at        timestamptz  DEFAULT now()
);

-- Tabla: ecommerce_stores (para configuración de tiendas online)
CREATE TABLE IF NOT EXISTS ecommerce_stores (
  id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id          uuid         NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  domain            text         UNIQUE,
  subdomain         text         UNIQUE,
  theme             text         NOT NULL DEFAULT 'default',
  logo_url          text,
  banner_url        text,
  primary_color     text         DEFAULT '#3B82F6',
  secondary_color   text         DEFAULT '#1E40AF',
  is_active         boolean      NOT NULL DEFAULT true,
  mongodb_store_id  text,
  created_at        timestamptz  DEFAULT now(),
  updated_at        timestamptz  DEFAULT now(),
  UNIQUE(store_id)
);

-- Tabla: ecommerce_categories (para categorías de productos en tiendas online)
CREATE TABLE IF NOT EXISTS ecommerce_categories (
  id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  ecommerce_store_id uuid        NOT NULL REFERENCES ecommerce_stores(id) ON DELETE CASCADE,
  name              text         NOT NULL,
  slug              text         NOT NULL,
  description       text,
  image_url         text,
  parent_id         uuid         REFERENCES ecommerce_categories(id) ON DELETE SET NULL,
  is_featured       boolean      NOT NULL DEFAULT false,
  display_order     integer      NOT NULL DEFAULT 0,
  mongodb_category_id text,
  created_at        timestamptz  DEFAULT now(),
  updated_at        timestamptz  DEFAULT now(),
  UNIQUE(ecommerce_store_id, slug)
);

-- Tabla: product_categories (relación muchos a muchos entre productos y categorías)
CREATE TABLE IF NOT EXISTS product_categories (
  id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        uuid         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id       uuid         NOT NULL REFERENCES ecommerce_categories(id) ON DELETE CASCADE,
  created_at        timestamptz  DEFAULT now(),
  UNIQUE(product_id, category_id)
);

-- Tabla: ecommerce_orders (para pedidos en tiendas online)
CREATE TABLE IF NOT EXISTS ecommerce_orders (
  id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  ecommerce_store_id uuid        NOT NULL REFERENCES ecommerce_stores(id) ON DELETE CASCADE,
  order_number      text         NOT NULL,
  client_id         uuid         REFERENCES clients(id) ON DELETE SET NULL,
  customer_name     text         NOT NULL,
  customer_email    text         NOT NULL,
  customer_phone    text,
  shipping_address  text         NOT NULL,
  billing_address   text,
  subtotal          numeric(15,2) NOT NULL DEFAULT 0,
  tax_total         numeric(15,2) NOT NULL DEFAULT 0,
  shipping_cost     numeric(15,2) NOT NULL DEFAULT 0,
  discount_amount   numeric(15,2) NOT NULL DEFAULT 0,
  total             numeric(15,2) NOT NULL DEFAULT 0,
  status            text         NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status    text         NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method    text,
  payment_reference text,
  notes             text,
  mongodb_order_id  text,
  created_at        timestamptz  DEFAULT now(),
  updated_at        timestamptz  DEFAULT now(),
  UNIQUE(ecommerce_store_id, order_number)
);

-- Tabla: ecommerce_order_items (para items de pedidos en tiendas online)
CREATE TABLE IF NOT EXISTS ecommerce_order_items (
  id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          uuid         NOT NULL REFERENCES ecommerce_orders(id) ON DELETE CASCADE,
  product_id        uuid         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity          numeric(15,2) NOT NULL DEFAULT 1,
  unit_price        numeric(15,2) NOT NULL,
  tax_rate          numeric(5,2)  NOT NULL,
  tax_amount        numeric(15,2) NOT NULL,
  discount_amount   numeric(15,2) NOT NULL DEFAULT 0,
  subtotal          numeric(15,2) NOT NULL,
  total             numeric(15,2) NOT NULL,
  created_at        timestamptz  DEFAULT now()
);

-- Tabla: ecommerce_coupons (para cupones de descuento)
CREATE TABLE IF NOT EXISTS ecommerce_coupons (
  id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  ecommerce_store_id uuid        NOT NULL REFERENCES ecommerce_stores(id) ON DELETE CASCADE,
  code              text         NOT NULL,
  discount_type     text         NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value    numeric(15,2) NOT NULL,
  min_purchase      numeric(15,2),
  max_discount      numeric(15,2),
  start_date        timestamptz  NOT NULL,
  end_date          timestamptz  NOT NULL,
  usage_limit       integer,
  usage_count       integer      NOT NULL DEFAULT 0,
  is_active         boolean      NOT NULL DEFAULT true,
  created_at        timestamptz  DEFAULT now(),
  updated_at        timestamptz  DEFAULT now(),
  UNIQUE(ecommerce_store_id, code)
);

-- Tabla: ecommerce_customers (para clientes registrados en tiendas online)
CREATE TABLE IF NOT EXISTS ecommerce_customers (
  id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  ecommerce_store_id uuid        NOT NULL REFERENCES ecommerce_stores(id) ON DELETE CASCADE,
  client_id         uuid         REFERENCES clients(id) ON DELETE SET NULL,
  email             text         NOT NULL,
  name              text         NOT NULL,
  phone             text,
  password_hash     text,
  shipping_address  text,
  billing_address   text,
  is_active         boolean      NOT NULL DEFAULT true,
  mongodb_customer_id text,
  created_at        timestamptz  DEFAULT now(),
  updated_at        timestamptz  DEFAULT now(),
  UNIQUE(ecommerce_store_id, email)
);

-- Tabla: mongodb_sync_log (para registrar sincronizaciones con MongoDB)
CREATE TABLE IF NOT EXISTS mongodb_sync_log (
  id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type       text         NOT NULL,
  entity_id         uuid         NOT NULL,
  mongodb_id        text,
  operation_type    text         NOT NULL CHECK (operation_type IN ('insert', 'update', 'delete')),
  status            text         NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  error_message     text,
  created_at        timestamptz  DEFAULT now(),
  updated_at        timestamptz  DEFAULT now()
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
    total_ecommerce_orders     = (SELECT COUNT(*) FROM ecommerce_orders WHERE payment_status = 'paid'),
    total_ecommerce_revenue    = (SELECT COALESCE(SUM(total), 0) FROM ecommerce_orders WHERE payment_status = 'paid'),
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

-- Función para actualizar el inventario de la tienda cuando se realiza un movimiento
CREATE OR REPLACE FUNCTION update_store_inventory()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar el inventario de la tienda
  UPDATE store_inventory
  SET quantity = NEW.new_quantity,
      updated_at = NOW()
  WHERE store_id = NEW.store_id AND product_id = NEW.product_id;
  
  -- Si no existe un registro para esta tienda y producto, crearlo
  IF NOT FOUND THEN
    INSERT INTO store_inventory (store_id, product_id, quantity)
    VALUES (NEW.store_id, NEW.product_id, NEW.new_quantity);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para registrar cambios para sincronización con MongoDB
CREATE OR REPLACE FUNCTION log_mongodb_sync()
RETURNS TRIGGER AS $$
DECLARE
  entity_type_val text;
  entity_id_val uuid;
BEGIN
  -- Determinar el tipo de entidad basado en la tabla
  IF TG_TABLE_NAME = 'companies' THEN
    entity_type_val := 'company';
    entity_id_val := NEW.id;
  ELSIF TG_TABLE_NAME = 'stores' THEN
    entity_type_val := 'store';
    entity_id_val := NEW.id;
  ELSIF TG_TABLE_NAME = 'store_inventory' THEN
    entity_type_val := 'inventory';
    entity_id_val := NEW.id;
  ELSIF TG_TABLE_NAME = 'ecommerce_stores' THEN
    entity_type_val := 'ecommerce_store';
    entity_id_val := NEW.id;
  ELSIF TG_TABLE_NAME = 'products' THEN
    entity_type_val := 'product';
    entity_id_val := NEW.id;
  END IF;
  
  -- Registrar la operación para sincronización
  IF TG_OP = 'INSERT' THEN
    INSERT INTO mongodb_sync_log (entity_type, entity_id, operation_type, status)
    VALUES (entity_type_val, entity_id_val, 'insert', 'pending');
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO mongodb_sync_log (entity_type, entity_id, operation_type, status)
    VALUES (entity_type_val, entity_id_val, 'update', 'pending');
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO mongodb_sync_log (entity_type, entity_id, operation_type, status)
    VALUES (entity_type_val, entity_id_val, 'delete', 'pending');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------------------------------------
-- 4. CREACIÓN DE TRIGGERS
--------------------------------------------------------------------------------
-- Triggers para actualizar updated_at en todas las tablas
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_companies_updated_at BEFORE UPDATE ON users_companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_notes_updated_at BEFORE UPDATE ON credit_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debit_notes_updated_at BEFORE UPDATE ON debit_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dian_config_updated_at BEFORE UPDATE ON dian_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_inventory_updated_at BEFORE UPDATE ON store_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ecommerce_stores_updated_at BEFORE UPDATE ON ecommerce_stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ecommerce_categories_updated_at BEFORE UPDATE ON ecommerce_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ecommerce_orders_updated_at BEFORE UPDATE ON ecommerce_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ecommerce_coupons_updated_at BEFORE UPDATE ON ecommerce_coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ecommerce_customers_updated_at BEFORE UPDATE ON ecommerce_customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mongodb_sync_log_updated_at BEFORE UPDATE ON mongodb_sync_log
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers para actualizar estadísticas de la aplicación
CREATE TRIGGER update_stats_on_company_change AFTER INSERT OR UPDATE OR DELETE ON companies
  FOR EACH STATEMENT EXECUTE FUNCTION update_app_statistics();

CREATE TRIGGER update_stats_on_user_company_change AFTER INSERT OR UPDATE OR DELETE ON users_companies
  FOR EACH STATEMENT EXECUTE FUNCTION update_app_statistics();

CREATE TRIGGER update_stats_on_store_change AFTER INSERT OR UPDATE OR DELETE ON stores
  FOR EACH STATEMENT EXECUTE FUNCTION update_app_statistics();

CREATE TRIGGER update_stats_on_subscription_change AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH STATEMENT EXECUTE FUNCTION update_app_statistics();

CREATE TRIGGER update_stats_on_invoice_change AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH STATEMENT EXECUTE FUNCTION update_app_statistics();

CREATE TRIGGER update_stats_on_ecommerce_order_change AFTER INSERT OR UPDATE OR DELETE ON ecommerce_orders
  FOR EACH STATEMENT EXECUTE FUNCTION update_app_statistics();

-- Triggers para validar límites de suscripción
CREATE TRIGGER check_subscription_limits_on_insert BEFORE INSERT ON users_companies
  FOR EACH ROW EXECUTE FUNCTION check_subscription_limits();

CREATE TRIGGER check_subscription_limits_on_update BEFORE UPDATE ON users_companies
  FOR EACH ROW EXECUTE FUNCTION check_subscription_limits();

-- Triggers para asignar roles y suscripciones
CREATE TRIGGER assign_administrator_role_on_insert BEFORE INSERT ON users_companies
  FOR EACH ROW EXECUTE FUNCTION assign_administrator_role();

CREATE TRIGGER assign_free_subscription_on_insert AFTER INSERT ON users_companies
  FOR EACH ROW
  WHEN (NEW.role = 'ADMINISTRATOR')
  EXECUTE FUNCTION assign_free_subscription();

-- Triggers para actualizar inventario
CREATE TRIGGER update_store_inventory_on_movement AFTER INSERT ON inventory_movements
  FOR EACH ROW EXECUTE FUNCTION update_store_inventory();

-- Triggers para sincronización con MongoDB
CREATE TRIGGER log_mongodb_sync_on_company_insert AFTER INSERT ON companies
  FOR EACH ROW EXECUTE FUNCTION log_mongodb_sync();

CREATE TRIGGER log_mongodb_sync_on_company_update AFTER UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION log_mongodb_sync();

CREATE TRIGGER log_mongodb_sync_on_company_delete BEFORE DELETE ON companies
  FOR EACH ROW EXECUTE FUNCTION log_mongodb_sync();

CREATE TRIGGER log_mongodb_sync_on_store_insert AFTER INSERT ON stores
  FOR EACH ROW EXECUTE FUNCTION log_mongodb_sync();

CREATE TRIGGER log_mongodb_sync_on_store_update AFTER UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION log_mongodb_sync();

CREATE TRIGGER log_mongodb_sync_on_store_delete BEFORE DELETE ON stores
  FOR EACH ROW EXECUTE FUNCTION log_mongodb_sync();

CREATE TRIGGER log_mongodb_sync_on_inventory_insert AFTER INSERT ON store_inventory
  FOR EACH ROW EXECUTE FUNCTION log_mongodb_sync();

CREATE TRIGGER log_mongodb_sync_on_inventory_update AFTER UPDATE ON store_inventory
  FOR EACH ROW EXECUTE FUNCTION log_mongodb_sync();

CREATE TRIGGER log_mongodb_sync_on_inventory_delete BEFORE DELETE ON store_inventory
  FOR EACH ROW EXECUTE FUNCTION log_mongodb_sync();

CREATE TRIGGER log_mongodb_sync_on_ecommerce_store_insert AFTER INSERT ON ecommerce_stores
  FOR EACH ROW EXECUTE FUNCTION log_mongodb_sync();

CREATE TRIGGER log_mongodb_sync_on_ecommerce_store_update AFTER UPDATE ON ecommerce_stores
  FOR EACH ROW EXECUTE FUNCTION log_mongodb_sync();

CREATE TRIGGER log_mongodb_sync_on_ecommerce_store_delete BEFORE DELETE ON ecommerce_stores
  FOR EACH ROW EXECUTE FUNCTION log_mongodb_sync();

CREATE TRIGGER log_mongodb_sync_on_product_insert AFTER INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION log_mongodb_sync();

CREATE TRIGGER log_mongodb_sync_on_product_update AFTER UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION log_mongodb_sync();

CREATE TRIGGER log_mongodb_sync_on_product_delete BEFORE DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION log_mongodb_sync();

--------------------------------------------------------------------------------
-- 5. CREACIÓN DE ÍNDICES
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

-- Índices en store_inventory
CREATE INDEX IF NOT EXISTS idx_store_inventory_store_id ON store_inventory(store_id);
CREATE INDEX IF NOT EXISTS idx_store_inventory_product_id ON store_inventory(product_id);

-- Índices en inventory_movements
CREATE INDEX IF NOT EXISTS idx_inventory_movements_store_id ON inventory_movements(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at);

-- Índices en ecommerce_stores
CREATE INDEX IF NOT EXISTS idx_ecommerce_stores_store_id ON ecommerce_stores(store_id);

-- Índices en ecommerce_categories
CREATE INDEX IF NOT EXISTS idx_ecommerce_categories_store_id ON ecommerce_categories(ecommerce_store_id);

-- Índices en product_categories
CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(category_id);

-- Índices en ecommerce_orders
CREATE INDEX IF NOT EXISTS idx_ecommerce_orders_store_id ON ecommerce_orders(ecommerce_store_id);
CREATE INDEX IF NOT EXISTS idx_ecommerce_orders_client_id ON ecommerce_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_ecommerce_orders_status ON ecommerce_orders(status);
CREATE INDEX IF NOT EXISTS idx_ecommerce_orders_payment_status ON ecommerce_orders(payment_status);

-- Índices en ecommerce_order_items
CREATE INDEX IF NOT EXISTS idx_ecommerce_order_items_order_id ON ecommerce_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_ecommerce_order_items_product_id ON ecommerce_order_items(product_id);

-- Índices en ecommerce_coupons
CREATE INDEX IF NOT EXISTS idx_ecommerce_coupons_store_id ON ecommerce_coupons(ecommerce_store_id);

-- Índices en ecommerce_customers
CREATE INDEX IF NOT EXISTS idx_ecommerce_customers_store_id ON ecommerce_customers(ecommerce_store_id);
CREATE INDEX IF NOT EXISTS idx_ecommerce_customers_client_id ON ecommerce_customers(client_id);

-- Índices en mongodb_sync_log
CREATE INDEX IF NOT EXISTS idx_mongodb_sync_log_entity_type ON mongodb_sync_log(entity_type);
CREATE INDEX IF NOT EXISTS idx_mongodb_sync_log_status ON mongodb_sync_log(status);

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
-- Stores policies are managed in 20240101000002_stores_policies.sql

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

-- Modify the database structure for better e-commerce and inventory management

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Modify users_companies to inherit from users
ALTER TABLE users_companies
  ADD COLUMN IF NOT EXISTS clerk_id text REFERENCES users(clerk_id) ON DELETE CASCADE,
  DROP COLUMN IF EXISTS user_id;

-- 3. Modify clients table to focus on e-commerce customers
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS clerk_id text REFERENCES users(clerk_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS shipping_address text,
  ADD COLUMN IF NOT EXISTS billing_address text;

-- 4. Create sales_transactions table for in-store sales
CREATE TABLE IF NOT EXISTS sales_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  seller_id text NOT NULL REFERENCES users(clerk_id) ON DELETE RESTRICT,
  transaction_number text NOT NULL,
  subtotal numeric(15,2) NOT NULL DEFAULT 0,
  tax_total numeric(15,2) NOT NULL DEFAULT 0,
  discount_amount numeric(15,2) NOT NULL DEFAULT 0,
  total numeric(15,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'card', 'transfer')),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(transaction_number)
);

-- Create sales_transaction_items table
CREATE TABLE IF NOT EXISTS sales_transaction_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES sales_transactions(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(15,2) NOT NULL,
  discount_amount numeric(15,2) NOT NULL DEFAULT 0,
  tax_amount numeric(15,2) NOT NULL DEFAULT 0,
  total_amount numeric(15,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE sales_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_transaction_items ENABLE ROW LEVEL SECURITY;

-- Add policies for sales_transactions
CREATE POLICY "sales_transactions_select_policy" ON sales_transactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.clerk_id = auth.uid()
        AND users_companies.company_id = (
          SELECT company_id FROM stores WHERE id = sales_transactions.store_id
        )
    )
  );

CREATE POLICY "sales_transactions_insert_policy" ON sales_transactions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.clerk_id = auth.uid()
        AND users_companies.company_id = (
          SELECT company_id FROM stores WHERE id = sales_transactions.store_id
        )
    )
  );

CREATE POLICY "sales_transactions_update_policy" ON sales_transactions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.clerk_id = auth.uid()
        AND users_companies.company_id = (
          SELECT company_id FROM stores WHERE id = sales_transactions.store_id
        )
    )
  );

-- Add policies for sales_transaction_items
CREATE POLICY "sales_transaction_items_select_policy" ON sales_transaction_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM sales_transactions st
      JOIN stores s ON s.id = st.store_id
      JOIN users_companies uc ON uc.company_id = s.company_id
      WHERE st.id = sales_transaction_items.transaction_id
        AND uc.clerk_id = auth.uid()
    )
  );

CREATE POLICY "sales_transaction_items_insert_policy" ON sales_transaction_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM sales_transactions st
      JOIN stores s ON s.id = st.store_id
      JOIN users_companies uc ON uc.company_id = s.company_id
      WHERE st.id = sales_transaction_items.transaction_id
        AND uc.clerk_id = auth.uid()
    )
  );

-- Drop ecommerce_customers table as it's now redundant
DROP TABLE IF EXISTS ecommerce_customers;

-- Update existing functions and triggers to use clerk_id instead of user_id
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers for new tables
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON sales_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes and update remaining policies for the modified database structure

-- Update remaining policies for clients to use clerk_id
CREATE OR REPLACE POLICY "clients_update_policy" ON clients
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.company_id = clients.company_id
        AND users_companies.clerk_id = auth.uid()
    )
  );

CREATE OR REPLACE POLICY "clients_delete_policy" ON clients
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.company_id = clients.company_id
        AND users_companies.clerk_id = auth.uid()
    )
  );

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_sales_transactions_store_id ON sales_transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_transactions_client_id ON sales_transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_transactions_seller_id ON sales_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_sales_transaction_items_transaction_id ON sales_transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_sales_transaction_items_product_id ON sales_transaction_items(product_id);
CREATE INDEX IF NOT EXISTS idx_users_companies_clerk_id ON users_companies(clerk_id);
CREATE INDEX IF NOT EXISTS idx_clients_clerk_id ON clients(clerk_id);

-- Add function to handle inventory when a sales transaction is cancelled
CREATE OR REPLACE FUNCTION restore_inventory_after_cancelled_sale()
RETURNS trigger AS $$
BEGIN
  -- Only process when status changes to cancelled
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    -- Create inventory movement records for each item
    INSERT INTO inventory_movements (
      store_id,
      product_id,
      movement_type,
      quantity,
      previous_quantity,
      new_quantity,
      reference_id,
      reference_type,
      notes,
      created_by
    )
    SELECT 
      NEW.store_id,
      sti.product_id,
      'entry',
      sti.quantity,
      COALESCE((SELECT quantity FROM store_inventory WHERE store_id = NEW.store_id AND product_id = sti.product_id), 0),
      COALESCE((SELECT quantity FROM store_inventory WHERE store_id = NEW.store_id AND product_id = sti.product_id), 0) + sti.quantity,
      NEW.id,
      'cancelled_transaction',
      'Cancelled sale transaction',
      NEW.seller_id
    FROM sales_transaction_items sti
    WHERE sti.transaction_id = NEW.id;
    
    -- Update inventory quantities
    UPDATE store_inventory si
    SET quantity = si.quantity + sti.quantity,
        updated_at = now()
    FROM sales_transaction_items sti
    WHERE sti.transaction_id = NEW.id
      AND si.store_id = NEW.store_id
      AND si.product_id = sti.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER restore_inventory_after_cancelled_sale_trigger
  AFTER UPDATE ON sales_transactions
  FOR EACH ROW
  EXECUTE FUNCTION restore_inventory_after_cancelled_sale();

-- Add comments to tables for better documentation
COMMENT ON TABLE users IS 'Stores user information from Clerk authentication';
COMMENT ON TABLE users_companies IS 'Links users to companies with specific roles';
COMMENT ON TABLE clients IS 'Stores e-commerce customer information';
COMMENT ON TABLE sales_transactions IS 'Records in-store sales transactions';
COMMENT ON TABLE sales_transaction_items IS 'Records individual items in sales transactions';

-- Additional policies and triggers for the updated database structure

-- Add delete policy for sales_transactions
CREATE POLICY "sales_transactions_delete_policy" ON sales_transactions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.clerk_id = auth.uid()
        AND users_companies.company_id = (
          SELECT company_id FROM stores WHERE id = sales_transactions.store_id
        )
        AND users_companies.role IN ('ADMIN', 'ADMINISTRATOR')
    )
  );

-- Add delete policy for sales_transaction_items
CREATE POLICY "sales_transaction_items_delete_policy" ON sales_transaction_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM sales_transactions st
      JOIN stores s ON s.id = st.store_id
      JOIN users_companies uc ON uc.company_id = s.company_id
      WHERE st.id = sales_transaction_items.transaction_id
        AND uc.clerk_id = auth.uid()
        AND uc.role IN ('ADMIN', 'ADMINISTRATOR')
    )
  );

-- Add update policy for sales_transaction_items
CREATE POLICY "sales_transaction_items_update_policy" ON sales_transaction_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM sales_transactions st
      JOIN stores s ON s.id = st.store_id
      JOIN users_companies uc ON uc.company_id = s.company_id
      WHERE st.id = sales_transaction_items.transaction_id
        AND uc.clerk_id = auth.uid()
    )
  );

-- Add trigger for sales_transaction_items to update inventory
CREATE OR REPLACE FUNCTION update_inventory_after_sale()
RETURNS trigger AS $$
BEGIN
  -- Create inventory movement record
  INSERT INTO inventory_movements (
    store_id,
    product_id,
    movement_type,
    quantity,
    previous_quantity,
    new_quantity,
    reference_id,
    reference_type,
    notes,
    created_by
  )
  SELECT 
    st.store_id,
    NEW.product_id,
    'exit',
    NEW.quantity,
    COALESCE((SELECT quantity FROM store_inventory WHERE store_id = st.store_id AND product_id = NEW.product_id), 0),
    COALESCE((SELECT quantity FROM store_inventory WHERE store_id = st.store_id AND product_id = NEW.product_id), 0) - NEW.quantity,
    NEW.transaction_id,
    'sales_transaction',
    'Sale transaction',
    st.seller_id
  FROM sales_transactions st
  WHERE st.id = NEW.transaction_id;
  
  -- Update inventory quantity
  UPDATE store_inventory
  SET quantity = quantity - NEW.quantity,
      updated_at = now()
  WHERE store_id = (SELECT store_id FROM sales_transactions WHERE id = NEW.transaction_id)
    AND product_id = NEW.product_id;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_after_sale_trigger
  AFTER INSERT ON sales_transaction_items
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_after_sale();

-- Add trigger for sales_transaction_items to update transaction totals
CREATE OR REPLACE FUNCTION update_transaction_totals()
RETURNS trigger AS $$
BEGIN
  -- Update transaction totals
  UPDATE sales_transactions
  SET 
    subtotal = (SELECT SUM(unit_price * quantity) FROM sales_transaction_items WHERE transaction_id = NEW.transaction_id),
    tax_total = (SELECT SUM(tax_amount) FROM sales_transaction_items WHERE transaction_id = NEW.transaction_id),
    discount_amount = (SELECT SUM(discount_amount) FROM sales_transaction_items WHERE transaction_id = NEW.transaction_id),
    total = (SELECT SUM(total_amount) FROM sales_transaction_items WHERE transaction_id = NEW.transaction_id),
    updated_at = now()
  WHERE id = NEW.transaction_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transaction_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON sales_transaction_items
  FOR EACH ROW
  EXECUTE FUNCTION update_transaction_totals();

-- Add trigger for sales_transaction_items updated_at
CREATE TRIGGER set_updated_at_sales_transaction_items
  BEFORE UPDATE ON sales_transaction_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add RLS policy for users table
CREATE POLICY "users_select_policy" ON users
  FOR SELECT USING (true);

CREATE POLICY "users_insert_policy" ON users
  FOR INSERT WITH CHECK (auth.uid() = clerk_id);

CREATE POLICY "users_update_policy" ON users
  FOR UPDATE USING (auth.uid() = clerk_id);

-- Update existing policies for clients to use clerk_id
CREATE OR REPLACE POLICY "clients_select_policy" ON clients
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.company_id = clients.company_id
        AND users_companies.clerk_id = auth.uid()
    )
  );

CREATE OR REPLACE POLICY "clients_insert_policy" ON clients
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users_companies
      WHERE users_companies.company_id = clients.company_id
        AND users_companies.clerk_id = auth.uid()
    )
  );