-- PostgreSQL schema for ERP Produk REST API
-- Tables:
-- - partner_product
-- - erp_supplier
-- - erp_warehouse
-- - erp_inventory
-- - erp_production
-- - erp_cash_flow
-- - erp_report
-- - erp_scan_history
--
-- Assumption: existing user table is public.hai_user(id).

BEGIN;

CREATE TABLE IF NOT EXISTS public.partner_product (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES public.hai_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  name VARCHAR(150) NOT NULL,
  sku VARCHAR(50),
  description VARCHAR(1000),
  status VARCHAR(30) NOT NULL DEFAULT 'Draft',
  price NUMERIC(18, 2) DEFAULT 0,
  warehouse VARCHAR(100),
  production_batch VARCHAR(100),
  stock_quantity INTEGER DEFAULT 0,
  unit VARCHAR(30) DEFAULT 'pcs',
  supplier_name VARCHAR(150),
  inventory_note VARCHAR(200),
  has_photo BOOLEAN NOT NULL DEFAULT FALSE,
  image_url VARCHAR(500),
  relations TEXT,
  flow_flags TEXT,
  public BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(50),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by VARCHAR(50)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_partner_product_partner_sku
  ON public.partner_product (partner_id, sku)
  WHERE sku IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_partner_product_partner
  ON public.partner_product (partner_id);

CREATE INDEX IF NOT EXISTS idx_partner_product_status
  ON public.partner_product (status);

CREATE INDEX IF NOT EXISTS idx_partner_product_active_public
  ON public.partner_product (active, public);

CREATE INDEX IF NOT EXISTS idx_partner_product_search_name
  ON public.partner_product (LOWER(name));

CREATE TABLE IF NOT EXISTS public.erp_supplier (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES public.hai_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(1000),
  status VARCHAR(30) NOT NULL DEFAULT 'Aktif',
  meta VARCHAR(200),
  amount VARCHAR(100),
  contact VARCHAR(100),
  address VARCHAR(500),
  map_url VARCHAR(500),
  relation VARCHAR(250),
  relations TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(50),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by VARCHAR(50)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_erp_supplier_partner_name
  ON public.erp_supplier (partner_id, name);

CREATE INDEX IF NOT EXISTS idx_erp_supplier_partner
  ON public.erp_supplier (partner_id);

CREATE INDEX IF NOT EXISTS idx_erp_supplier_status
  ON public.erp_supplier (status);

CREATE INDEX IF NOT EXISTS idx_erp_supplier_search_name
  ON public.erp_supplier (LOWER(name));

CREATE TABLE IF NOT EXISTS public.erp_warehouse (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES public.hai_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(1000),
  status VARCHAR(30) NOT NULL DEFAULT 'Aktif',
  meta VARCHAR(200),
  amount VARCHAR(100),
  contact VARCHAR(100),
  address VARCHAR(500),
  map_url VARCHAR(500),
  rack VARCHAR(100),
  capacity VARCHAR(50),
  relation VARCHAR(250),
  relations TEXT,
  flow_flags TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(50),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by VARCHAR(50)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_erp_warehouse_partner_name
  ON public.erp_warehouse (partner_id, name);

CREATE INDEX IF NOT EXISTS idx_erp_warehouse_partner
  ON public.erp_warehouse (partner_id);

CREATE INDEX IF NOT EXISTS idx_erp_warehouse_status
  ON public.erp_warehouse (status);

CREATE INDEX IF NOT EXISTS idx_erp_warehouse_search_name
  ON public.erp_warehouse (LOWER(name));

CREATE TABLE IF NOT EXISTS public.erp_inventory (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES public.hai_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(1000),
  status VARCHAR(40) NOT NULL DEFAULT 'Barang Masuk',
  meta VARCHAR(200),
  amount VARCHAR(100),
  supplier VARCHAR(150),
  quantity NUMERIC(18, 2) DEFAULT 0,
  unit VARCHAR(40),
  warehouse VARCHAR(150),
  added_by VARCHAR(100),
  added_at TIMESTAMP WITH TIME ZONE,
  reference VARCHAR(100),
  relation VARCHAR(250),
  details TEXT,
  relations TEXT,
  flow_flags TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(50),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_erp_inventory_partner
  ON public.erp_inventory (partner_id);

CREATE INDEX IF NOT EXISTS idx_erp_inventory_status
  ON public.erp_inventory (status);

CREATE INDEX IF NOT EXISTS idx_erp_inventory_supplier
  ON public.erp_inventory (supplier);

CREATE INDEX IF NOT EXISTS idx_erp_inventory_warehouse
  ON public.erp_inventory (warehouse);

CREATE INDEX IF NOT EXISTS idx_erp_inventory_reference
  ON public.erp_inventory (reference);

CREATE INDEX IF NOT EXISTS idx_erp_inventory_search_name
  ON public.erp_inventory (LOWER(name));

CREATE TABLE IF NOT EXISTS public.erp_production (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES public.hai_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(1000),
  status VARCHAR(30) NOT NULL DEFAULT 'Berjalan',
  meta VARCHAR(200),
  amount VARCHAR(100),
  inventory_source VARCHAR(250),
  source_warehouse VARCHAR(150),
  output_product VARCHAR(150),
  destination_warehouse VARCHAR(150),
  quantity NUMERIC(18, 2) DEFAULT 0,
  unit VARCHAR(40),
  production_place VARCHAR(150),
  failed_quantity INTEGER DEFAULT 0,
  qc_pass_quantity INTEGER DEFAULT 0,
  relation VARCHAR(250),
  relations TEXT,
  flow_flags TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(50),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by VARCHAR(50)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_erp_production_partner_name
  ON public.erp_production (partner_id, name);

CREATE INDEX IF NOT EXISTS idx_erp_production_partner
  ON public.erp_production (partner_id);

CREATE INDEX IF NOT EXISTS idx_erp_production_status
  ON public.erp_production (status);

CREATE INDEX IF NOT EXISTS idx_erp_production_source_warehouse
  ON public.erp_production (source_warehouse);

CREATE INDEX IF NOT EXISTS idx_erp_production_destination_warehouse
  ON public.erp_production (destination_warehouse);

CREATE INDEX IF NOT EXISTS idx_erp_production_output_product
  ON public.erp_production (output_product);

CREATE INDEX IF NOT EXISTS idx_erp_production_search_name
  ON public.erp_production (LOWER(name));

CREATE TABLE IF NOT EXISTS public.erp_cash_flow (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES public.hai_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(1000),
  status VARCHAR(30) NOT NULL DEFAULT 'Tercatat',
  meta VARCHAR(200),
  amount VARCHAR(100),
  nominal NUMERIC(18, 2) NOT NULL DEFAULT 0,
  cash_type VARCHAR(30) NOT NULL DEFAULT 'Uang Masuk',
  category VARCHAR(100),
  payment_method VARCHAR(80),
  transaction_date TIMESTAMP WITH TIME ZONE,
  source_module VARCHAR(80),
  source_reference VARCHAR(150),
  reference VARCHAR(150),
  note VARCHAR(1000),
  details TEXT,
  relations TEXT,
  flow_flags TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(50),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_erp_cash_flow_partner
  ON public.erp_cash_flow (partner_id);

CREATE INDEX IF NOT EXISTS idx_erp_cash_flow_status
  ON public.erp_cash_flow (status);

CREATE INDEX IF NOT EXISTS idx_erp_cash_flow_cash_type
  ON public.erp_cash_flow (cash_type);

CREATE INDEX IF NOT EXISTS idx_erp_cash_flow_category
  ON public.erp_cash_flow (category);

CREATE INDEX IF NOT EXISTS idx_erp_cash_flow_payment_method
  ON public.erp_cash_flow (payment_method);

CREATE INDEX IF NOT EXISTS idx_erp_cash_flow_source_module
  ON public.erp_cash_flow (source_module);

CREATE INDEX IF NOT EXISTS idx_erp_cash_flow_reference
  ON public.erp_cash_flow (reference);

CREATE INDEX IF NOT EXISTS idx_erp_cash_flow_transaction_date
  ON public.erp_cash_flow (transaction_date);

CREATE INDEX IF NOT EXISTS idx_erp_cash_flow_created_at
  ON public.erp_cash_flow (created_at);

CREATE INDEX IF NOT EXISTS idx_erp_cash_flow_search_name
  ON public.erp_cash_flow (LOWER(name));

CREATE TABLE IF NOT EXISTS public.erp_report (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES public.hai_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  title VARCHAR(150) NOT NULL,
  description VARCHAR(1000),
  status VARCHAR(30) NOT NULL DEFAULT 'Draft',
  meta VARCHAR(200),
  amount VARCHAR(100),
  report_type VARCHAR(80),
  period VARCHAR(80),
  note VARCHAR(1000),
  details TEXT,
  relations TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(50),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_erp_report_partner
  ON public.erp_report (partner_id);

CREATE INDEX IF NOT EXISTS idx_erp_report_status
  ON public.erp_report (status);

CREATE INDEX IF NOT EXISTS idx_erp_report_type
  ON public.erp_report (report_type);

CREATE INDEX IF NOT EXISTS idx_erp_report_search_title
  ON public.erp_report (LOWER(title));

CREATE TABLE IF NOT EXISTS public.erp_scan_history (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES public.hai_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  module VARCHAR(40) NOT NULL,
  code VARCHAR(100) NOT NULL,
  action VARCHAR(80),
  quantity VARCHAR(50),
  result_name VARCHAR(150),
  result_sku VARCHAR(100),
  payload TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(50),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_erp_scan_history_partner
  ON public.erp_scan_history (partner_id);

CREATE INDEX IF NOT EXISTS idx_erp_scan_history_module
  ON public.erp_scan_history (module);

CREATE INDEX IF NOT EXISTS idx_erp_scan_history_code
  ON public.erp_scan_history (code);

COMMIT;
