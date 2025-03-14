--------------------------------------------------------------------------------
-- 1. Crear la base de datos practicar
--------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

--------------------------------------------------------------------------------
-- 2. Crear las tablas
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS companies (
    id                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    name              text          NOT NULL,
    nit               text          NOT NULL UNIQUE,
    address           text          NOT NULL,
    phone             text          NOT NULL,
    email             text          NOT NULL,
    dian_registered   boolean       DEFAULT false,
    mongo_id          text,
    logo_url          text,
    security_code     text          NOT NULL,
    created_at        timestamptz   NOT NULL DEFAULT now(),
    updated_at        timestamptz   NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
    id                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    name              text          NOT NULL,
    last_name         text          NOT NULL,
    email             text          NOT NULL UNIQUE,
    phone             text          NOT NULL,
    date_of_birth     date          NOT NULL,
    clerk             text,
    created_at        timestamptz   NOT NULL DEFAULT now(),
    updated_at        timestamptz   NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stores (
  id                   uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id           uuid         NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  mongodb_store_id     text,
  name                 text         NOT NULL,
  address              text,
  phone                text,
  created_by           text         NOT NULL,
  created_at           timestamptz  DEFAULT now(),
  updated_at           timestamptz  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users_companies (
  id                   uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id           uuid         NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role                 text         NOT NULL CHECK (role IN ('ADMIN', 'ADMINISTRATOR', 'EMPLOYEE')),
  is_default_inventory boolean      DEFAULT false,
  created_at           timestamptz  NOT NULL DEFAULT now(),
  updated_at           timestamptz  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id                   uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id              text         NOT NULL,
  plan_name            text         NOT NULL,
  worker_limit         integer      NOT NULL,
  invoice_limit        integer      NOT NULL,
  store_limit          integer      NOT NULL,
  status               text         NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at           timestamptz  DEFAULT now(),
  updated_at           timestamptz  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS sales_transactions (
  id                   uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id             uuid           NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  transaction_number   text           NOT NULL UNIQUE,
  subtotal             numeric(15,2)  NOT NULL DEFAULT 0,
  tax_total            numeric(15,2)  NOT NULL DEFAULT 0,
  discount_amount      numeric(15,2)  NOT NULL DEFAULT 0,
  total                numeric(15,2)  NOT NULL DEFAULT 0,
  payment_method       text           NOT NULL CHECK (payment_method IN ('cash', 'card', 'transfer')),
  status               text           NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  notes                text,
  created_at           timestamptz    DEFAULT now(),
  updated_at           timestamptz    DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sales_transaction_items (
  id                   uuid                 PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid  NOT NULL             REFERENCES sales_transactions(id) ON DELETE CASCADE,
  quantity             integer              NOT NULL CHECK (quantity > 0),
  unit_price           numeric(15,2)        NOT NULL,
  discount_amount      numeric(15,2)        NOT NULL DEFAULT 0,
  tax_amount           numeric(15,2)        NOT NULL DEFAULT 0,
  total_amount         numeric(15,2)        NOT NULL,
  created_at           timestamptz          DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dian_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  test_mode            boolean      DEFAULT true,
  certificate          text         NOT NULL,
  technical_key        text         NOT NULL,
  software_id          text         NOT NULL,
  software_pin         text         NOT NULL,
  resolution_number    text         NOT NULL,
  resolution_date      date         NOT NULL,
  resolution_start_date date        NOT NULL,
  resolution_end_date  date         NOT NULL,
  resolution_prefix    text,
  resolution_from      integer      NOT NULL,
  resolution_to        integer      NOT NULL,
  current_number       integer      NOT NULL,
  created_at           timestamptz  DEFAULT now(),
  updated_at           timestamptz  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS credit_notes (
  id                   uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  note_number          text         NOT NULL,
  note_date            date         NOT NULL DEFAULT CURRENT_DATE,
  reason               text         NOT NULL,
  subtotal             numeric(15,2) NOT NULL DEFAULT 0,
  tax_total            numeric(15,2) NOT NULL DEFAULT 0,
  total                numeric(15,2) NOT NULL DEFAULT 0,
  status               text         NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'final')),
  cufe                 text         UNIQUE,
  xml_document         text,
  pdf_document         text,
  created_at           timestamptz  DEFAULT now(),
  updated_at           timestamptz  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS debit_notes (
  id                   uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_notes_id           uuid         NOT NULL REFERENCES credit_notes(id) ON DELETE CASCADE,
  note_number          text         NOT NULL,
  note_date            date         NOT NULL DEFAULT CURRENT_DATE,
  reason               text         NOT NULL,
  subtotal             numeric(15,2) NOT NULL DEFAULT 0,
  tax_total            numeric(15,2) NOT NULL DEFAULT 0,
  total                numeric(15,2) NOT NULL DEFAULT 0,
  status               text         NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'final')),
  cufe                 text         UNIQUE,
  xml_document         text,
  pdf_document         text,
  created_at           timestamptz  DEFAULT now(),
  updated_at           timestamptz  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clients (
  id                   uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  companies_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name                 text         NOT NULL,
  last_name            text         NOT NULL,
  address              text         NOT NULL,
  phone                text,
  email                text,
  clerk_id             text,
  created_at           timestamptz  DEFAULT now(),
  updated_at           timestamptz  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoices (
  id                   uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id            uuid         NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  invoice_number       text         NOT NULL,
  invoice_date         date         NOT NULL DEFAULT CURRENT_DATE,
  due_date             date         NOT NULL,
  subtotal             numeric(15,2) NOT NULL DEFAULT 0,
  tax_total            numeric(15,2) NOT NULL DEFAULT 0,
  total                numeric(15,2) NOT NULL DEFAULT 0,
  status               text         NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
  cufe                 text         UNIQUE,
  xml_document         text,
  pdf_document         text,
  created_at           timestamptz  DEFAULT now(),
  updated_at           timestamptz  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id                   uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id           uuid         NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  quantity             numeric(15,2) NOT NULL DEFAULT 1,
  unit_price           numeric(15,2) NOT NULL,
  tax_rate             numeric(5,2)  NOT NULL,
  tax_amount           numeric(15,2) NOT NULL,
  subtotal             numeric(15,2) NOT NULL,
  total                numeric(15,2) NOT NULL,
  created_at           timestamptz  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS store_inventory (
  id                   uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id             uuid         NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  quantity             integer      NOT NULL DEFAULT 0,
  min_stock            integer      NOT NULL DEFAULT 5,
  max_stock            integer      NOT NULL DEFAULT 100,
  mongodb_inventory_id text,
  created_at           timestamptz  DEFAULT now(),
  updated_at           timestamptz  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id                   uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  store_inventory_id           uuid         NOT NULL REFERENCES store_inventory(id) ON DELETE CASCADE,
  code                 text         NOT NULL,
  name                 text         NOT NULL,
  description          text,
  sku                  text         NOT NULL,
  quantity             integer      NOT NULL DEFAULT 0,
  price                numeric(10,2) NOT NULL DEFAULT 0,
  unit_price           numeric(15,2) NOT NULL DEFAULT 0,
  tax_rate             numeric(5,2)  NOT NULL DEFAULT 0,
  product_type         text         NOT NULL DEFAULT 'product' CHECK (product_type IN ('product', 'service')),
  unit_measure         text         NOT NULL DEFAULT 'unit',
  total_values         float NOT NULL DEFAULT 0,
  created_at           timestamptz  DEFAULT now(),
  updated_at           timestamptz  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_categories (
  id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        uuid         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at        timestamptz  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id                   uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id           uuid         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type        text         NOT NULL CHECK (movement_type IN ('entry', 'exit', 'transfer', 'adjustment')),
  quantity             integer      NOT NULL,
  previous_quantity    integer      NOT NULL,
  new_quantity         integer      NOT NULL,
  reference_id         uuid,
  reference_type       text,
  notes                text,
  created_by           text         NOT NULL,
  created_at           timestamptz  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ecommerce_stores (
  id                   uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id             uuid         NOT NULL REFERENCES stores(id) ON DELETE CASCADE UNIQUE,
  domain               text         UNIQUE,
  subdomain            text         UNIQUE,
  theme                text         NOT NULL DEFAULT 'default',
  logo_url             text,
  banner_url           text,
  primary_color        text         DEFAULT '#3B82F6',
  secondary_color      text         DEFAULT '#1E40AF',
  is_active            boolean      NOT NULL DEFAULT true,
  mongodb_store_id     text,
  created_at           timestamptz  DEFAULT now(),
  updated_at           timestamptz  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ecommerce_categories (
  id                   uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  ecommerce_store_id   uuid         NOT NULL REFERENCES ecommerce_stores(id) ON DELETE CASCADE,
  name                 text         NOT NULL,
  slug                 text         NOT NULL,
  description          text,
  image_url            text,
  is_featured          boolean      NOT NULL DEFAULT false,
  display_order        integer      NOT NULL DEFAULT 0,
  mongodb_category_id  text,
  created_at           timestamptz  DEFAULT now(),
  updated_at           timestamptz  DEFAULT now()
);


CREATE TABLE IF NOT EXISTS ecommerce_orders (
  id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  ecommerce_store_id uuid        NOT NULL REFERENCES ecommerce_stores(id) ON DELETE CASCADE,
  order_number      text         NOT NULL,
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

CREATE TABLE IF NOT EXISTS ecommerce_order_items (
  id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          uuid         NOT NULL REFERENCES ecommerce_orders(id) ON DELETE CASCADE,
  quantity          numeric(15,2) NOT NULL DEFAULT 1,
  unit_price        numeric(15,2) NOT NULL,
  tax_rate          numeric(5,2)  NOT NULL,
  tax_amount        numeric(15,2) NOT NULL,
  discount_amount   numeric(15,2) NOT NULL DEFAULT 0,
  subtotal          numeric(15,2) NOT NULL,
  total             numeric(15,2) NOT NULL,
  created_at        timestamptz  DEFAULT now()
);

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
  updated_at        timestamptz  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ecommerce_customers (
  id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  ecommerce_store_id uuid        NOT NULL REFERENCES ecommerce_stores(id) ON DELETE CASCADE,
  email             text         NOT NULL,
  name              text         NOT NULL,
  phone             text,
  password_hash     text,
  shipping_address  text,
  billing_address   text,
  is_active         boolean      NOT NULL DEFAULT true,
  mongodb_customer_id text,
  created_at        timestamptz  DEFAULT now(),
  updated_at        timestamptz  DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ecommerce_payments (
  id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          uuid         NOT NULL REFERENCES ecommerce_orders(id) ON DELETE CASCADE,
  payment_method    text         NOT NULL,
  payment_status    text         NOT NULL CHECK (payment_status IN ('pending', 'paid', 'failed','refunded')),
  payment_reference text,
  amount            numeric(15,2) NOT NULL,
  notes             text,
  created_at        timestamptz  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ecommerce_shipping_methods (
  id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  ecommerce_store_id uuid        NOT NULL REFERENCES ecommerce_stores(id) ON DELETE CASCADE,
  name              text         NOT NULL,
  description       text,
  cost              numeric(15,2) NOT NULL,
  is_active         boolean      NOT NULL DEFAULT true,
  created_at        timestamptz  DEFAULT now(),
  updated_at        timestamptz  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contacts (
  id                          uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  name                        text      NOT NULL,
  email                       text      NOT NULL,
  phone                       text      NOT NULL,
  message                     text      NOT NULL
);

CREATE TABLE IF NOT EXISTS faq (
  id uuid                     PRIMARY KEY DEFAULT gen_random_uuid(),
  question                    text      NOT NULL,
  answer                      text      NOT NULL
);

CREATE TABLE IF NOT EXISTS enterprise (
  id                          uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  name_company                text      NOT NULL,
  name                        text      NOT NULL,
  last_name                   text      NOT NULL,
  email                       text      NOT NULL,
  company_size                INT       NOT NULL,
  phone                       text      NOT NULL,
  how_did_you_hear            text      NOT NULL,
  message                     text      NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id                          uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  title                       text      NOT NULL,
  date                        timestamptz NOT NULL,
  type                        text      NOT NULL,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sales (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount                     numeric(15,2) NOT NULL,
  date                       timestamptz NOT NULL,
  created_at                 timestamptz NOT NULL DEFAULT now(),
  updated_at                 timestamptz NOT NULL DEFAULT now()
);

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
  contact_id                 uuid         REFERENCES contacts(id) ON DELETE CASCADE,
  faq_id                     uuid         REFERENCES faq(id) ON DELETE CASCADE,
  enterprise_id              uuid         REFERENCES enterprise(id) ON DELETE CASCADE,
  events_id                  uuid         REFERENCES events(id) ON DELETE CASCADE,
  sales_id                   uuid         REFERENCES sales(id) ON DELETE CASCADE,
  created_at                 timestamptz  DEFAULT now(),
  updated_at                 timestamptz  DEFAULT now()
);

--------------------------------------------------------------------------------
-- 3. Creación de INDEX
--------------------------------------------------------------------------------



--------------------------------------------------------------------------------
-- 4. Creación de Vistas
--------------------------------------------------------------------------------

