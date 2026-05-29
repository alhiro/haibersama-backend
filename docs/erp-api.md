# ERP Produk API

Backend API untuk menu mobile:
`Profile > ERP Produk`.

Base path mengikuti `APP_API_PREFIX`, contoh: `/api/erp`.

## Modul

ERP Produk punya modul:

```text
supplier
employeerole
purchaseorder
expense
stockledger
returnrefund
settlement
warehouse
production
inventory
transaction
invoice
cashflow
report
```

Catatan: katalog produk memakai endpoint khusus `/product` karena struktur
produk memiliki upload foto dan kebutuhan marketplace sendiri. Lihat
`docs/product-api.md`.

## Auth

Gunakan header:

```http
Authorization: <jwt-token>
```

Endpoint read/write data partner memakai `isPartnerAuthenticated`, sehingga
hanya partner `type = 2` yang bisa mengelola datanya.

## Endpoint Umum

Ganti `:module` dengan salah satu modul di atas.

| Method | Path | Fungsi |
| --- | --- | --- |
| GET | `/erp/modules` | Daftar modul ERP dan status default |
| GET | `/erp/owner-dashboard/summary` | Ringkasan owner dari transaksi, kas, piutang, hutang, stok, produksi, dan margin |
| GET | `/erp/role-approval/summary` | Ringkasan role, approval pending, dan audit log |
| POST | `/erp/approval/approve` | Approve request approval |
| POST | `/erp/approval/reject` | Tolak request approval |
| GET | `/erp/:module/options` | Opsi form mobile: status, field option, barcode config |
| GET | `/erp/:module/getall` | List data modul milik partner login |
| GET | `/erp/:module/get?id=1` | Detail data modul |
| GET | `/erp/:module/metrics` | Ringkasan angka modul |
| GET | `/erp/:module/barcode` | Konfigurasi scan/barcode modul |
| POST | `/erp/:module/scan` | Simpan riwayat scan dan return hasil scan |
| POST | `/erp/:module/add` | Tambah data |
| POST | `/erp/:module/update` | Update data |
| PATCH | `/erp/:module/update` | Update parsial |
| DELETE | `/erp/:module/delete?id=1` | Hapus data |

Query list:

```text
page, limit, search, status, startDate, endDate,
warehouse, supplier, reference, productionPlace, outputProduct, reportType,
cashType, category, paymentMethod, sourceModule, invoiceType, invoiceNo,
customer, transactionType, transactionNo, channel, paymentStatus,
purchaseOrderType, purchaseOrderNo, poType, poNo,
expenseType, expenseNo, vendor, employee,
product, productionBatch, cashflowReference,
role, department, movementType, returnNo, settlementNo, marketplace,
approvalStatus
```

## Response Owner Dashboard

```json
{
  "generatedAt": "2026-05-29T10:00:00.000Z",
  "metrics": [
    {
      "key": "todayRevenue",
      "title": "Omzet Hari Ini",
      "value": "Rp12.800.000",
      "subtitle": "4 transaksi hari ini",
      "status": "good"
    },
    {
      "key": "cashAvailable",
      "title": "Kas Tersedia",
      "value": "Rp24.500.000",
      "subtitle": "Masuk Rp38.000.000 / Keluar Rp13.500.000",
      "status": "good"
    }
  ],
  "sections": {
    "topProducts": [],
    "lowStocks": [],
    "lateProductions": [],
    "alerts": []
  }
}
```

Owner Dashboard tidak memakai tabel baru. Data dihitung dari tabel ERP yang
sudah ada: `erp_transaction`, `erp_invoice`, `erp_cash_flow`,
`erp_purchase_order`, `erp_expense`, `partner_product`, `erp_inventory`, dan
`erp_production`.

## Response Role & Approval

```json
{
  "metrics": [
    { "title": "Menunggu Approval", "value": 2, "status": "warning" },
    { "title": "Disetujui Hari Ini", "value": 1, "status": "good" },
    { "title": "Ditolak", "value": 0, "status": "neutral" },
    { "title": "Audit Log", "value": 12, "status": "neutral" }
  ],
  "pendingApprovals": [
    {
      "id": 1,
      "requestNo": "APR-1770000000000",
      "module": "cashflow",
      "action": "Pembayaran Besar",
      "title": "Pembayaran Supplier",
      "status": "Menunggu Approval",
      "requestedBy": "staff@bisnis.com",
      "requesterRole": "Staff",
      "approverRole": "Owner",
      "amount": "Rp8.000.000",
      "riskLevel": "High"
    }
  ],
  "auditLogs": [],
  "roleRules": []
}
```

Rule otomatis:
- Staff bisa input data operasional.
- Supervisor approve stok keluar, transfer, QC, dan produksi selesai.
- Owner approve pembayaran besar di atas Rp5.000.000.
- Semua create, update, delete, scan, approve, dan reject dicatat di audit log.
- Data yang butuh approval akan diberi `approvalStatus = Menunggu Approval`
  agar mobile bisa menampilkan penanda sebelum supervisor/owner menyetujui.
- Backend membuat Stock Ledger otomatis dari inventory, produksi, PO,
  transaksi, dan retur. Backend juga membuat Cash Flow otomatis dari invoice,
  transaksi lunas, settlement marketplace cair, PO/expense dibayar, dan refund.

Payload approve/reject:

```json
{
  "id": 1,
  "note": "Dokumen sudah sesuai"
}
```

## Payload Supplier

```json
{
  "name": "CV Sumber Kain Bandung",
  "description": "Supplier kain cotton combed dan fleece.",
  "status": "Aktif",
  "meta": "Lead time 3 hari",
  "amount": "Termin 14 hari",
  "contact": "0812-7788-1100",
  "address": "Jl. Cigondewah, Bandung",
  "mapUrl": "https://maps.google.com/?q=Cigondewah%20Bandung",
  "relation": "Dipakai untuk produk: Outer Linen Oversize"
}
```

## Payload Purchase Order

```json
{
  "name": "PO Kain Cotton Combed 30s",
  "description": "Pembelian bahan baku untuk produksi Outer Linen Oversize.",
  "status": "Dikirim Supplier",
  "meta": "Supplier: CV Sumber Kain Bandung",
  "amount": "Rp7400000",
  "purchaseOrderNo": "PO-SUP-2405-018",
  "purchaseOrderType": "Bahan Baku",
  "supplier": "CV Sumber Kain Bandung",
  "supplierContact": "0812-7788-1100",
  "warehouse": "Warehouse Bahan Baku",
  "item": "Kain Cotton Combed 30s",
  "quantity": 10,
  "receivedQuantity": 0,
  "unit": "gulung",
  "expectedDate": "2026-05-24T10:00:00.000Z",
  "paymentStatus": "Belum Bayar",
  "paymentMethod": "Transfer Bank",
  "subtotal": 7400000,
  "discount": 0,
  "tax": 0,
  "shippingCost": 0,
  "total": 7400000,
  "sourceReference": "REQ-PROD-OUT-2405",
  "reference": "Bahan untuk batch OUT-2405",
  "note": "Saat barang diterima, backend dapat membuat mutasi inventory barang masuk."
}
```

## Payload Expense

```json
{
  "name": "Biaya Jahit Batch OUT-2405",
  "description": "Pembayaran jasa produksi untuk Outer Linen Oversize.",
  "status": "Menunggu Bayar",
  "meta": "Vendor: Tempat Jahit Bu Rina",
  "amount": "Rp3600000",
  "expenseNo": "EXP-PROD-2405-018",
  "expenseType": "Produksi",
  "category": "Biaya Produksi",
  "vendor": "Tempat Jahit Bu Rina",
  "supplier": "CV Sumber Kain Bandung",
  "purchaseOrderNo": "PO-SUP-2405-018",
  "warehouse": "Warehouse Bahan Baku",
  "productionBatch": "Batch OUT-2405",
  "product": "Outer Linen Oversize",
  "transactionNo": "TRX-MP-2405-018",
  "invoiceNo": "INV-MP-2405-018",
  "employee": "Supervisor Produksi - Dimas",
  "paymentStatus": "Belum Bayar",
  "paymentMethod": "Transfer Bank",
  "expenseDate": "2026-05-20T10:30:00.000Z",
  "dueDate": "2026-05-25T10:30:00.000Z",
  "subtotal": 3600000,
  "discount": 0,
  "tax": 0,
  "total": 3600000,
  "sourceModule": "Production",
  "sourceReference": "BATCH-OUT-2405",
  "cashflowReference": "CF-OUT-2405-EXP",
  "reference": "Jahit 320 pcs Outer Linen Oversize",
  "note": "Saat expense dibayar, backend dapat membuat Cash Flow uang keluar."
}
```

Expense dipakai untuk biaya operasional, produksi, gaji, ongkir, marketing,
refund, marketplace fee, dan biaya lain yang nantinya masuk Cash Flow sebagai
`Uang Keluar`. Field relasi seperti `supplier`, `purchaseOrderNo`,
`warehouse`, `productionBatch`, `product`, `transactionNo`, `invoiceNo`, dan
`cashflowReference` menjaga biaya tetap terhubung dengan alur ERP lain.

## Payload Employee Role

```json
{
  "name": "Rani Admin Gudang",
  "email": "rani@gudang.co.id",
  "phone": "0812-7788-8899",
  "role": "Warehouse Staff",
  "department": "Warehouse",
  "status": "Aktif",
  "permissions": "Inventory: create, Warehouse: scan, Stock Ledger: read",
  "note": "Boleh input barang masuk, stok keluar perlu approval supervisor."
}
```

Gunakan header `x-erp-role` saat request dari mobile, misalnya `Owner`,
`Supervisor`, `Warehouse Staff`, `Admin`, `Kasir`, atau `Marketplace Admin`.

## Payload Stock Ledger

Normalnya Stock Ledger dibuat otomatis oleh backend dari PO, inventory,
produksi, transaksi, dan retur. Endpoint add/update untuk `stockledger`
dipakai hanya untuk **Koreksi Stok** manual, misalnya selisih opname, barang
rusak/hilang, stok awal, atau migrasi data.

```json
{
  "name": "Kain Cotton Combed 30s",
  "sku": "MAT-COT30-001",
  "movementType": "Koreksi",
  "status": "Tercatat",
  "quantityIn": 0,
  "quantityOut": 2,
  "balanceAfter": 8,
  "unit": "gulung",
  "warehouse": "Warehouse Bahan Baku",
  "sourceModule": "Manual",
  "sourceReference": "SO-OPNAME-2405",
  "supplier": "CV Sumber Kain Bandung",
  "product": "Outer Linen Oversize",
  "reason": "Selisih stok saat opname gudang",
  "approvalStatus": "Menunggu Approval",
  "note": "Koreksi stok manual, wajib ada alasan."
}
```

Jika `movementType = Koreksi/Adjustment` dan `quantityOut > 0`, backend membuat
approval supervisor. Field `reason` atau `note` wajib diisi untuk koreksi
manual.

## Payload Return & Refund

```json
{
  "name": "Retur Outer Linen Oversize",
  "returnNo": "RET-MP-2405-018",
  "status": "Pengajuan",
  "customer": "Toko Bintang",
  "product": "Outer Linen Oversize",
  "quantity": 2,
  "unit": "pcs",
  "transactionNo": "TRX-MP-2405-018",
  "invoiceNo": "INV-MP-2405-018",
  "warehouse": "Gudang Retur",
  "refundAmount": 400000,
  "refundMethod": "Marketplace",
  "reason": "Ukuran tidak sesuai",
  "cashflowReference": "CF-RET-2405-018",
  "approvalStatus": "Menunggu Approval",
  "note": "Retur masuk ke gudang retur dan refund masuk cash out setelah disetujui."
}
```

## Payload Marketplace Settlement

```json
{
  "name": "Settlement Shopee 20 Mei",
  "settlementNo": "SET-SHP-2405-020",
  "marketplace": "Shopee",
  "status": "Cair",
  "grossSales": 12800000,
  "marketplaceFee": 640000,
  "shippingFee": 180000,
  "discount": 200000,
  "refundAmount": 400000,
  "netPayout": 11380000,
  "payoutDate": "2026-05-20T17:00:00.000Z",
  "transactionNo": "TRX-MP-2405-018",
  "invoiceNo": "INV-MP-2405-018",
  "cashflowReference": "CF-SET-SHP-2405-020",
  "note": "Saat status Cair, backend membuat cash in otomatis sesuai net payout."
}
```

## Payload Warehouse

```json
{
  "name": "Warehouse Produk Jadi",
  "description": "Barang selesai QC dan siap masuk channel penjualan.",
  "status": "Aktif",
  "meta": "Zona picking marketplace",
  "amount": "64% kapasitas",
  "contact": "Supervisor: 0822-1199-8877",
  "address": "Pergudangan Sentra Niaga Blok C",
  "rack": "Zona A",
  "capacity": "64%",
  "relation": "Produk: Outer Linen Oversize"
}
```

## Payload Inventory

```json
{
  "name": "Kain Cotton Combed 30s",
  "description": "Barang masuk dari supplier.",
  "status": "Barang Masuk",
  "meta": "Supplier: CV Sumber Kain Bandung",
  "amount": "+10 gulung",
  "supplier": "CV Sumber Kain Bandung",
  "quantity": 10,
  "unit": "gulung",
  "warehouse": "Warehouse Bahan Baku",
  "addedBy": "Admin Gudang - Rani",
  "addedAt": "2026-05-17T09:25:00.000Z",
  "reference": "PO-SUP-2405-018",
  "relation": "Bahan untuk: Outer Linen Oversize"
}
```

## Payload Produksi

```json
{
  "name": "Batch OUT-2405",
  "description": "Outer linen 320 pcs, proses jahit tahap 2.",
  "status": "Berjalan",
  "meta": "Tempat Jahit Bu Rina",
  "amount": "210/320 pcs",
  "inventorySource": "Kain Cotton Combed 30s - Warehouse Bahan Baku - 7 gulung",
  "sourceWarehouse": "Warehouse Bahan Baku",
  "outputProduct": "Outer Linen Oversize",
  "destinationWarehouse": "Warehouse Produk Jadi",
  "quantity": 320,
  "unit": "pcs",
  "productionPlace": "Tempat Jahit Bu Rina",
  "failedQuantity": 0,
  "qcPassQuantity": 210
}
```

## Payload Transaction

```json
{
  "name": "Order Marketplace OUT-2405",
  "description": "Penjualan produk jadi dari warehouse produk jadi.",
  "status": "Order Masuk",
  "meta": "Shopee - Toko Bintang",
  "amount": "Rp12800000",
  "transactionNo": "TRX-MP-2405-018",
  "transactionType": "Produk",
  "channel": "Marketplace",
  "customer": "Toko Bintang",
  "customerContact": "0812-8899-1122",
  "product": "Outer Linen Oversize",
  "quantity": 64,
  "unit": "pcs",
  "warehouse": "Warehouse Produk Jadi",
  "invoiceNo": "INV-MP-2405-018",
  "paymentStatus": "Belum Bayar",
  "paymentMethod": "Marketplace",
  "subtotal": 12800000,
  "discount": 0,
  "tax": 0,
  "shippingCost": 0,
  "total": 12800000,
  "transactionDate": "2026-05-20T10:30:00.000Z",
  "dueDate": "2026-05-27T10:30:00.000Z",
  "sourceReference": "ORD-SHP-2405-018",
  "reference": "Siap dibuatkan invoice",
  "note": "Stok akan berkurang dari warehouse produk jadi saat transaksi diproses backend."
}
```

## Payload Invoice

```json
{
  "name": "Invoice Marketplace OUT-2405",
  "description": "Tagihan untuk penjualan produk jadi batch OUT-2405.",
  "status": "Dikirim",
  "meta": "Customer: Toko Bintang",
  "amount": "Rp12800000",
  "invoiceNo": "INV-MP-2405-018",
  "invoiceType": "Produk",
  "customer": "Toko Bintang",
  "customerContact": "0812-8899-1122",
  "issueDate": "2026-05-20T10:30:00.000Z",
  "dueDate": "2026-05-27T10:30:00.000Z",
  "subtotal": 12800000,
  "discount": 0,
  "tax": 0,
  "total": 12800000,
  "paidAmount": 0,
  "paymentMethod": "Transfer Bank",
  "sourceModule": "Transaction",
  "sourceReference": "TRX-MP-2405-018",
  "reference": "Outer Linen Oversize x 64 pcs",
  "note": "Invoice akan masuk Cash Flow saat pembayaran diterima."
}
```

## Payload Laporan

```json
{
  "title": "Laporan Penjualan Marketplace",
  "description": "Shopee dan Tokopedia naik 18% dibanding minggu lalu.",
  "status": "Publish",
  "meta": "Update hari ini",
  "amount": "Rp38 jt",
  "reportType": "Penjualan Marketplace",
  "period": "Minggu Ini",
  "note": "Performa channel meningkat."
}
```

## Payload Cash Flow

```json
{
  "name": "Penjualan Marketplace OUT-2405",
  "description": "Pembayaran masuk dari pesanan marketplace produk jadi.",
  "status": "Lunas",
  "meta": "Invoice",
  "amount": "Rp12800000",
  "nominal": 12800000,
  "cashType": "Uang Masuk",
  "category": "Penjualan Produk",
  "paymentMethod": "Marketplace",
  "transactionDate": "2026-05-20T10:30:00.000Z",
  "sourceModule": "Invoice",
  "sourceReference": "INV-MP-2405-018",
  "reference": "Order marketplace batch OUT-2405",
  "note": "Masuk dari penjualan produk jadi."
}
```

`cashType = Uang Masuk` menambah saldo kas, sedangkan `Uang Keluar`
mengurangi saldo. Nanti invoice, transaksi customer, pembelian supplier, dan
biaya produksi bisa membuat data cash flow otomatis dari backend.

## Payload Scan

```json
{
  "code": "HB-MAT-COT30-0001",
  "action": "Barang Masuk",
  "quantity": "1 gulung"
}
```

Response scan berisi `scannedItem`, `action`, `quantity`, dan `id` riwayat scan.

## Response Shape

Setiap list/detail mengembalikan field database dan alias yang mudah dipakai
oleh `ErpModulePage` mobile:

```json
{
  "id": 1,
  "module": "inventory",
  "name": "Kain Cotton Combed 30s",
  "title": "Kain Cotton Combed 30s",
  "description": "Barang masuk dari supplier.",
  "subtitle": "Barang masuk dari supplier.",
  "status": "Barang Masuk",
  "meta": "Supplier: CV Sumber Kain Bandung",
  "amount": "+10 gulung",
  "relations": ["Supplier: CV Sumber Kain Bandung"],
  "flowFlags": [{ "label": "Warehouse", "value": "Warehouse Bahan Baku" }]
}
```

## Database

Tabel yang perlu dibuat:

```text
erp_supplier
erp_purchase_order
erp_expense
erp_approval
erp_audit_log
erp_employee_role
erp_stock_ledger
erp_return_refund
erp_marketplace_settlement
erp_warehouse
erp_inventory
erp_production
erp_transaction
erp_invoice
erp_cash_flow
erp_report
erp_scan_history
partner_product
```

Project ini belum memakai migration formal. Untuk membuat tabel, aktifkan
sementara blok sync model terkait di `models/index.js`, jalankan workflow
backend, lalu comment kembali setelah tabel terbentuk.
