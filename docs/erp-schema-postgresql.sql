-- PostgreSQL schema for ERP Produk REST API
-- Tables:
-- - partner_product
-- - erp_supplier
-- - erp_purchase_order
-- - erp_expense
-- - erp_approval
-- - erp_audit_log
-- - erp_employee_role
-- - erp_stock_ledger
-- - erp_return_refund
-- - erp_marketplace_settlement
-- - erp_warehouse
-- - erp_inventory
-- - erp_production
-- - erp_transaction
-- - erp_invoice
-- - erp_cash_flow
-- - erp_report
-- - erp_scan_history
--
-- Assumption: existing user table is public.hai_user(id).

BEGIN;

ALTER TABLE public.hai_user ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.hai_user ADD COLUMN IF NOT EXISTS admin_role VARCHAR(50);

-- Jalankan sekali untuk memindahkan admin lama dari hardcoded email ke role database.
-- Setelah ini aplikasi membaca admin dari hai_user.is_admin/admin_role, bukan dari email di mobile.
-- UPDATE public.hai_user
-- SET is_admin = TRUE, admin_role = 'Super Admin'
-- WHERE email = 'haieventorganizer@gmail.com';

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

CREATE TABLE IF NOT EXISTS public.erp_purchase_order (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES public.hai_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(1000),
  status VARCHAR(40) NOT NULL DEFAULT 'Draft',
  meta VARCHAR(200),
  amount VARCHAR(100),
  po_no VARCHAR(80),
  po_type VARCHAR(40),
  supplier VARCHAR(150),
  supplier_contact VARCHAR(120),
  warehouse VARCHAR(150),
  item VARCHAR(150),
  quantity NUMERIC(18, 2) NOT NULL DEFAULT 0,
  received_quantity NUMERIC(18, 2) NOT NULL DEFAULT 0,
  unit VARCHAR(40),
  expected_date TIMESTAMP WITH TIME ZONE,
  payment_status VARCHAR(40),
  payment_method VARCHAR(80),
  subtotal NUMERIC(18, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  tax NUMERIC(18, 2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(18, 2) NOT NULL DEFAULT 0,
  total NUMERIC(18, 2) NOT NULL DEFAULT 0,
  source_reference VARCHAR(150),
  reference VARCHAR(150),
  approval_status VARCHAR(40) NOT NULL DEFAULT 'Tidak Perlu Approval',
  approval_id INTEGER,
  approved_by VARCHAR(120),
  approved_at TIMESTAMP WITH TIME ZONE,
  reason VARCHAR(500),
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

CREATE UNIQUE INDEX IF NOT EXISTS uq_erp_purchase_order_partner_po_no
  ON public.erp_purchase_order (partner_id, po_no)
  WHERE po_no IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_erp_purchase_order_partner
  ON public.erp_purchase_order (partner_id);

CREATE INDEX IF NOT EXISTS idx_erp_purchase_order_status
  ON public.erp_purchase_order (status);

CREATE INDEX IF NOT EXISTS idx_erp_purchase_order_type
  ON public.erp_purchase_order (po_type);

CREATE INDEX IF NOT EXISTS idx_erp_purchase_order_supplier
  ON public.erp_purchase_order (supplier);

CREATE INDEX IF NOT EXISTS idx_erp_purchase_order_warehouse
  ON public.erp_purchase_order (warehouse);

CREATE INDEX IF NOT EXISTS idx_erp_purchase_order_payment_status
  ON public.erp_purchase_order (payment_status);

CREATE INDEX IF NOT EXISTS idx_erp_purchase_order_approval_status
  ON public.erp_purchase_order (approval_status);

CREATE INDEX IF NOT EXISTS idx_erp_purchase_order_expected_date
  ON public.erp_purchase_order (expected_date);

CREATE INDEX IF NOT EXISTS idx_erp_purchase_order_search_name
  ON public.erp_purchase_order (LOWER(name));

CREATE TABLE IF NOT EXISTS public.erp_expense (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES public.hai_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(1000),
  status VARCHAR(40) NOT NULL DEFAULT 'Tercatat',
  meta VARCHAR(200),
  amount VARCHAR(100),
  expense_no VARCHAR(80),
  expense_type VARCHAR(60),
  category VARCHAR(100),
  supplier VARCHAR(150),
  warehouse VARCHAR(150),
  product VARCHAR(150),
  po_no VARCHAR(80),
  production_batch VARCHAR(120),
  transaction_no VARCHAR(80),
  invoice_no VARCHAR(80),
  cashflow_reference VARCHAR(150),
  vendor VARCHAR(150),
  employee VARCHAR(150),
  payment_status VARCHAR(40),
  payment_method VARCHAR(80),
  expense_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  subtotal NUMERIC(18, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  tax NUMERIC(18, 2) NOT NULL DEFAULT 0,
  total NUMERIC(18, 2) NOT NULL DEFAULT 0,
  source_module VARCHAR(80),
  source_reference VARCHAR(150),
  reference VARCHAR(150),
  approval_status VARCHAR(40) NOT NULL DEFAULT 'Tidak Perlu Approval',
  approval_id INTEGER,
  approved_by VARCHAR(120),
  approved_at TIMESTAMP WITH TIME ZONE,
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

CREATE UNIQUE INDEX IF NOT EXISTS uq_erp_expense_partner_expense_no
  ON public.erp_expense (partner_id, expense_no)
  WHERE expense_no IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_erp_expense_partner
  ON public.erp_expense (partner_id);

CREATE INDEX IF NOT EXISTS idx_erp_expense_status
  ON public.erp_expense (status);

CREATE INDEX IF NOT EXISTS idx_erp_expense_type
  ON public.erp_expense (expense_type);

CREATE INDEX IF NOT EXISTS idx_erp_expense_category
  ON public.erp_expense (category);

CREATE INDEX IF NOT EXISTS idx_erp_expense_vendor
  ON public.erp_expense (vendor);

CREATE INDEX IF NOT EXISTS idx_erp_expense_supplier
  ON public.erp_expense (supplier);

CREATE INDEX IF NOT EXISTS idx_erp_expense_warehouse
  ON public.erp_expense (warehouse);

CREATE INDEX IF NOT EXISTS idx_erp_expense_product
  ON public.erp_expense (product);

CREATE INDEX IF NOT EXISTS idx_erp_expense_po_no
  ON public.erp_expense (po_no);

CREATE INDEX IF NOT EXISTS idx_erp_expense_production_batch
  ON public.erp_expense (production_batch);

CREATE INDEX IF NOT EXISTS idx_erp_expense_transaction_no
  ON public.erp_expense (transaction_no);

CREATE INDEX IF NOT EXISTS idx_erp_expense_invoice_no
  ON public.erp_expense (invoice_no);

CREATE INDEX IF NOT EXISTS idx_erp_expense_cashflow_reference
  ON public.erp_expense (cashflow_reference);

CREATE INDEX IF NOT EXISTS idx_erp_expense_employee
  ON public.erp_expense (employee);

CREATE INDEX IF NOT EXISTS idx_erp_expense_payment_status
  ON public.erp_expense (payment_status);

CREATE INDEX IF NOT EXISTS idx_erp_expense_approval_status
  ON public.erp_expense (approval_status);

CREATE INDEX IF NOT EXISTS idx_erp_expense_source_module
  ON public.erp_expense (source_module);

CREATE INDEX IF NOT EXISTS idx_erp_expense_date
  ON public.erp_expense (expense_date);

CREATE INDEX IF NOT EXISTS idx_erp_expense_search_name
  ON public.erp_expense (LOWER(name));

CREATE TABLE IF NOT EXISTS public.erp_approval (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES public.hai_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  request_no VARCHAR(80),
  module VARCHAR(60) NOT NULL,
  action VARCHAR(80) NOT NULL,
  title VARCHAR(150) NOT NULL,
  description VARCHAR(1000),
  status VARCHAR(40) NOT NULL DEFAULT 'Menunggu Approval',
  requested_by VARCHAR(120),
  requester_role VARCHAR(80),
  approver_role VARCHAR(80),
  approved_by VARCHAR(120),
  approved_at TIMESTAMP WITH TIME ZONE,
  amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  threshold NUMERIC(18, 2) NOT NULL DEFAULT 0,
  reference_id INTEGER,
  reference_no VARCHAR(150),
  risk_level VARCHAR(40),
  approval_note VARCHAR(1000),
  details TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(50),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by VARCHAR(50)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_erp_approval_partner_request_no
  ON public.erp_approval (partner_id, request_no)
  WHERE request_no IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_erp_approval_partner
  ON public.erp_approval (partner_id);

CREATE INDEX IF NOT EXISTS idx_erp_approval_status
  ON public.erp_approval (status);

CREATE INDEX IF NOT EXISTS idx_erp_approval_module
  ON public.erp_approval (module);

CREATE INDEX IF NOT EXISTS idx_erp_approval_approver_role
  ON public.erp_approval (approver_role);

CREATE INDEX IF NOT EXISTS idx_erp_approval_reference
  ON public.erp_approval (reference_id, reference_no);

CREATE TABLE IF NOT EXISTS public.erp_audit_log (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES public.hai_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  module VARCHAR(60) NOT NULL,
  action VARCHAR(80) NOT NULL,
  entity_id INTEGER,
  entity_title VARCHAR(150),
  actor VARCHAR(120),
  actor_role VARCHAR(80),
  before_data TEXT,
  after_data TEXT,
  note VARCHAR(1000),
  created_at TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(50),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_erp_audit_log_partner
  ON public.erp_audit_log (partner_id);

CREATE INDEX IF NOT EXISTS idx_erp_audit_log_module
  ON public.erp_audit_log (module);

CREATE INDEX IF NOT EXISTS idx_erp_audit_log_action
  ON public.erp_audit_log (action);

CREATE INDEX IF NOT EXISTS idx_erp_audit_log_entity
  ON public.erp_audit_log (entity_id);

CREATE INDEX IF NOT EXISTS idx_erp_audit_log_created_at
  ON public.erp_audit_log (created_at);

CREATE TABLE IF NOT EXISTS public.erp_employee_role (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES public.hai_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  user_id INTEGER REFERENCES public.hai_user(id) ON UPDATE CASCADE ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(120),
  phone VARCHAR(50),
  role VARCHAR(80) NOT NULL DEFAULT 'Staff',
  department VARCHAR(100),
  status VARCHAR(40) NOT NULL DEFAULT 'Aktif',
  permissions TEXT,
  invited_by VARCHAR(120),
  invited_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE,
  invite_status VARCHAR(40) NOT NULL DEFAULT 'Belum Dikirim',
  invite_sent_at TIMESTAMP WITH TIME ZONE,
  invite_error VARCHAR(500),
  note VARCHAR(1000),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(50),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_erp_employee_role_partner ON public.erp_employee_role (partner_id);
CREATE INDEX IF NOT EXISTS idx_erp_employee_role_user ON public.erp_employee_role (user_id);
CREATE INDEX IF NOT EXISTS idx_erp_employee_role_role ON public.erp_employee_role (role);
CREATE INDEX IF NOT EXISTS idx_erp_employee_role_email ON public.erp_employee_role (email);
CREATE UNIQUE INDEX IF NOT EXISTS uq_erp_employee_role_partner_email
  ON public.erp_employee_role (partner_id, email)
  WHERE email IS NOT NULL AND active = TRUE;

CREATE TABLE IF NOT EXISTS public.erp_stock_ledger (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES public.hai_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  name VARCHAR(150) NOT NULL,
  sku VARCHAR(80),
  movement_type VARCHAR(60) NOT NULL DEFAULT 'Masuk',
  status VARCHAR(40) NOT NULL DEFAULT 'Tercatat',
  quantity_in NUMERIC(18, 2) NOT NULL DEFAULT 0,
  quantity_out NUMERIC(18, 2) NOT NULL DEFAULT 0,
  balance_after NUMERIC(18, 2) NOT NULL DEFAULT 0,
  unit VARCHAR(40),
  warehouse VARCHAR(150),
  source_module VARCHAR(80),
  source_reference VARCHAR(150),
  supplier VARCHAR(150),
  production_batch VARCHAR(120),
  product VARCHAR(150),
  approval_status VARCHAR(40) NOT NULL DEFAULT 'Tidak Perlu Approval',
  approval_id INTEGER,
  approved_by VARCHAR(120),
  approved_at TIMESTAMP WITH TIME ZONE,
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

CREATE INDEX IF NOT EXISTS idx_erp_stock_ledger_partner ON public.erp_stock_ledger (partner_id);
CREATE INDEX IF NOT EXISTS idx_erp_stock_ledger_warehouse ON public.erp_stock_ledger (warehouse);
CREATE INDEX IF NOT EXISTS idx_erp_stock_ledger_source ON public.erp_stock_ledger (source_module, source_reference);
CREATE INDEX IF NOT EXISTS idx_erp_stock_ledger_approval ON public.erp_stock_ledger (approval_status);

CREATE TABLE IF NOT EXISTS public.erp_return_refund (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES public.hai_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  name VARCHAR(150) NOT NULL,
  return_no VARCHAR(80),
  status VARCHAR(40) NOT NULL DEFAULT 'Pengajuan',
  customer VARCHAR(150),
  product VARCHAR(150),
  quantity NUMERIC(18, 2) NOT NULL DEFAULT 0,
  unit VARCHAR(40),
  transaction_no VARCHAR(80),
  invoice_no VARCHAR(80),
  warehouse VARCHAR(150),
  refund_amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  refund_method VARCHAR(80),
  reason VARCHAR(500),
  cashflow_reference VARCHAR(150),
  approval_status VARCHAR(40) NOT NULL DEFAULT 'Tidak Perlu Approval',
  approval_id INTEGER,
  approved_by VARCHAR(120),
  approved_at TIMESTAMP WITH TIME ZONE,
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

CREATE UNIQUE INDEX IF NOT EXISTS uq_erp_return_refund_partner_return_no ON public.erp_return_refund (partner_id, return_no) WHERE return_no IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_erp_return_refund_partner ON public.erp_return_refund (partner_id);
CREATE INDEX IF NOT EXISTS idx_erp_return_refund_status ON public.erp_return_refund (status);
CREATE INDEX IF NOT EXISTS idx_erp_return_refund_transaction ON public.erp_return_refund (transaction_no);

CREATE TABLE IF NOT EXISTS public.erp_marketplace_settlement (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES public.hai_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  name VARCHAR(150) NOT NULL,
  settlement_no VARCHAR(80),
  marketplace VARCHAR(80),
  status VARCHAR(40) NOT NULL DEFAULT 'Menunggu Cair',
  gross_sales NUMERIC(18, 2) NOT NULL DEFAULT 0,
  marketplace_fee NUMERIC(18, 2) NOT NULL DEFAULT 0,
  shipping_fee NUMERIC(18, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  refund_amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  net_payout NUMERIC(18, 2) NOT NULL DEFAULT 0,
  payout_date TIMESTAMP WITH TIME ZONE,
  transaction_no VARCHAR(80),
  invoice_no VARCHAR(80),
  cashflow_reference VARCHAR(150),
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

CREATE UNIQUE INDEX IF NOT EXISTS uq_erp_marketplace_settlement_partner_no ON public.erp_marketplace_settlement (partner_id, settlement_no) WHERE settlement_no IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_erp_marketplace_settlement_partner ON public.erp_marketplace_settlement (partner_id);
CREATE INDEX IF NOT EXISTS idx_erp_marketplace_settlement_marketplace ON public.erp_marketplace_settlement (marketplace);
CREATE INDEX IF NOT EXISTS idx_erp_marketplace_settlement_status ON public.erp_marketplace_settlement (status);

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
  approval_status VARCHAR(40) NOT NULL DEFAULT 'Tidak Perlu Approval',
  approval_id INTEGER,
  approved_by VARCHAR(120),
  approved_at TIMESTAMP WITH TIME ZONE,
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

CREATE INDEX IF NOT EXISTS idx_erp_inventory_approval_status
  ON public.erp_inventory (approval_status);

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
  approval_status VARCHAR(40) NOT NULL DEFAULT 'Tidak Perlu Approval',
  approval_id INTEGER,
  approved_by VARCHAR(120),
  approved_at TIMESTAMP WITH TIME ZONE,
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

CREATE INDEX IF NOT EXISTS idx_erp_production_approval_status
  ON public.erp_production (approval_status);

CREATE INDEX IF NOT EXISTS idx_erp_production_search_name
  ON public.erp_production (LOWER(name));

CREATE TABLE IF NOT EXISTS public.erp_transaction (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES public.hai_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(1000),
  status VARCHAR(40) NOT NULL DEFAULT 'Order Masuk',
  meta VARCHAR(200),
  amount VARCHAR(100),
  transaction_no VARCHAR(80),
  transaction_type VARCHAR(40),
  channel VARCHAR(80),
  customer VARCHAR(150),
  customer_contact VARCHAR(120),
  product VARCHAR(150),
  quantity NUMERIC(18, 2) NOT NULL DEFAULT 0,
  unit VARCHAR(40),
  warehouse VARCHAR(150),
  invoice_no VARCHAR(80),
  payment_status VARCHAR(40),
  payment_method VARCHAR(80),
  subtotal NUMERIC(18, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  tax NUMERIC(18, 2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(18, 2) NOT NULL DEFAULT 0,
  total NUMERIC(18, 2) NOT NULL DEFAULT 0,
  transaction_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
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

CREATE UNIQUE INDEX IF NOT EXISTS uq_erp_transaction_partner_transaction_no
  ON public.erp_transaction (partner_id, transaction_no)
  WHERE transaction_no IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_erp_transaction_partner
  ON public.erp_transaction (partner_id);

CREATE INDEX IF NOT EXISTS idx_erp_transaction_status
  ON public.erp_transaction (status);

CREATE INDEX IF NOT EXISTS idx_erp_transaction_type
  ON public.erp_transaction (transaction_type);

CREATE INDEX IF NOT EXISTS idx_erp_transaction_channel
  ON public.erp_transaction (channel);

CREATE INDEX IF NOT EXISTS idx_erp_transaction_customer
  ON public.erp_transaction (customer);

CREATE INDEX IF NOT EXISTS idx_erp_transaction_payment_status
  ON public.erp_transaction (payment_status);

CREATE INDEX IF NOT EXISTS idx_erp_transaction_warehouse
  ON public.erp_transaction (warehouse);

CREATE INDEX IF NOT EXISTS idx_erp_transaction_invoice_no
  ON public.erp_transaction (invoice_no);

CREATE INDEX IF NOT EXISTS idx_erp_transaction_date
  ON public.erp_transaction (transaction_date);

CREATE INDEX IF NOT EXISTS idx_erp_transaction_search_name
  ON public.erp_transaction (LOWER(name));

CREATE TABLE IF NOT EXISTS public.erp_invoice (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES public.hai_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(1000),
  status VARCHAR(40) NOT NULL DEFAULT 'Draft',
  meta VARCHAR(200),
  amount VARCHAR(100),
  invoice_no VARCHAR(80),
  invoice_type VARCHAR(40),
  customer VARCHAR(150),
  customer_contact VARCHAR(120),
  issue_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  subtotal NUMERIC(18, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  tax NUMERIC(18, 2) NOT NULL DEFAULT 0,
  total NUMERIC(18, 2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(80),
  source_module VARCHAR(80),
  source_reference VARCHAR(150),
  reference VARCHAR(150),
  approval_status VARCHAR(40) NOT NULL DEFAULT 'Tidak Perlu Approval',
  approval_id INTEGER,
  approved_by VARCHAR(120),
  approved_at TIMESTAMP WITH TIME ZONE,
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

CREATE UNIQUE INDEX IF NOT EXISTS uq_erp_invoice_partner_invoice_no
  ON public.erp_invoice (partner_id, invoice_no)
  WHERE invoice_no IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_erp_invoice_partner
  ON public.erp_invoice (partner_id);

CREATE INDEX IF NOT EXISTS idx_erp_invoice_status
  ON public.erp_invoice (status);

CREATE INDEX IF NOT EXISTS idx_erp_invoice_type
  ON public.erp_invoice (invoice_type);

CREATE INDEX IF NOT EXISTS idx_erp_invoice_customer
  ON public.erp_invoice (customer);

CREATE INDEX IF NOT EXISTS idx_erp_invoice_payment_method
  ON public.erp_invoice (payment_method);

CREATE INDEX IF NOT EXISTS idx_erp_invoice_source_module
  ON public.erp_invoice (source_module);

CREATE INDEX IF NOT EXISTS idx_erp_invoice_due_date
  ON public.erp_invoice (due_date);

CREATE INDEX IF NOT EXISTS idx_erp_invoice_approval_status
  ON public.erp_invoice (approval_status);

CREATE INDEX IF NOT EXISTS idx_erp_invoice_search_name
  ON public.erp_invoice (LOWER(name));

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
  approval_status VARCHAR(40) NOT NULL DEFAULT 'Tidak Perlu Approval',
  approval_id INTEGER,
  approved_by VARCHAR(120),
  approved_at TIMESTAMP WITH TIME ZONE,
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

CREATE INDEX IF NOT EXISTS idx_erp_cash_flow_approval_status
  ON public.erp_cash_flow (approval_status);

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

-- Migration helper untuk database yang sudah punya tabel ERP lama.
-- Jalankan bagian ini jika tabel sudah ada sebelum fitur approval/ledger/retur/settlement ditambahkan.
ALTER TABLE public.erp_purchase_order ADD COLUMN IF NOT EXISTS approval_status VARCHAR(40) NOT NULL DEFAULT 'Tidak Perlu Approval';
ALTER TABLE public.erp_purchase_order ADD COLUMN IF NOT EXISTS approval_id INTEGER;
ALTER TABLE public.erp_purchase_order ADD COLUMN IF NOT EXISTS approved_by VARCHAR(120);
ALTER TABLE public.erp_purchase_order ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.erp_expense ADD COLUMN IF NOT EXISTS approval_status VARCHAR(40) NOT NULL DEFAULT 'Tidak Perlu Approval';
ALTER TABLE public.erp_expense ADD COLUMN IF NOT EXISTS approval_id INTEGER;
ALTER TABLE public.erp_expense ADD COLUMN IF NOT EXISTS approved_by VARCHAR(120);
ALTER TABLE public.erp_expense ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.erp_inventory ADD COLUMN IF NOT EXISTS approval_status VARCHAR(40) NOT NULL DEFAULT 'Tidak Perlu Approval';
ALTER TABLE public.erp_inventory ADD COLUMN IF NOT EXISTS approval_id INTEGER;
ALTER TABLE public.erp_inventory ADD COLUMN IF NOT EXISTS approved_by VARCHAR(120);
ALTER TABLE public.erp_inventory ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.erp_production ADD COLUMN IF NOT EXISTS approval_status VARCHAR(40) NOT NULL DEFAULT 'Tidak Perlu Approval';
ALTER TABLE public.erp_production ADD COLUMN IF NOT EXISTS approval_id INTEGER;
ALTER TABLE public.erp_production ADD COLUMN IF NOT EXISTS approved_by VARCHAR(120);
ALTER TABLE public.erp_production ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.erp_invoice ADD COLUMN IF NOT EXISTS approval_status VARCHAR(40) NOT NULL DEFAULT 'Tidak Perlu Approval';
ALTER TABLE public.erp_invoice ADD COLUMN IF NOT EXISTS approval_id INTEGER;
ALTER TABLE public.erp_invoice ADD COLUMN IF NOT EXISTS approved_by VARCHAR(120);
ALTER TABLE public.erp_invoice ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.erp_cash_flow ADD COLUMN IF NOT EXISTS approval_status VARCHAR(40) NOT NULL DEFAULT 'Tidak Perlu Approval';
ALTER TABLE public.erp_cash_flow ADD COLUMN IF NOT EXISTS approval_id INTEGER;
ALTER TABLE public.erp_cash_flow ADD COLUMN IF NOT EXISTS approved_by VARCHAR(120);
ALTER TABLE public.erp_cash_flow ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.erp_stock_ledger ADD COLUMN IF NOT EXISTS approved_by VARCHAR(120);
ALTER TABLE public.erp_stock_ledger ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.erp_stock_ledger ADD COLUMN IF NOT EXISTS reason VARCHAR(500);

ALTER TABLE public.erp_return_refund ADD COLUMN IF NOT EXISTS approved_by VARCHAR(120);
ALTER TABLE public.erp_return_refund ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.erp_employee_role ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES public.hai_user(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE public.erp_employee_role ADD COLUMN IF NOT EXISTS invited_by VARCHAR(120);
ALTER TABLE public.erp_employee_role ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.erp_employee_role ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.erp_employee_role ADD COLUMN IF NOT EXISTS invite_status VARCHAR(40) NOT NULL DEFAULT 'Belum Dikirim';
ALTER TABLE public.erp_employee_role ADD COLUMN IF NOT EXISTS invite_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.erp_employee_role ADD COLUMN IF NOT EXISTS invite_error VARCHAR(500);

CREATE INDEX IF NOT EXISTS idx_erp_employee_role_user
  ON public.erp_employee_role (user_id);

CREATE INDEX IF NOT EXISTS idx_erp_purchase_order_approval_status
  ON public.erp_purchase_order (approval_status);
CREATE INDEX IF NOT EXISTS idx_erp_expense_approval_status
  ON public.erp_expense (approval_status);
CREATE INDEX IF NOT EXISTS idx_erp_inventory_approval_status
  ON public.erp_inventory (approval_status);
CREATE INDEX IF NOT EXISTS idx_erp_production_approval_status
  ON public.erp_production (approval_status);
CREATE INDEX IF NOT EXISTS idx_erp_invoice_approval_status
  ON public.erp_invoice (approval_status);
CREATE INDEX IF NOT EXISTS idx_erp_cash_flow_approval_status
  ON public.erp_cash_flow (approval_status);

COMMIT;
