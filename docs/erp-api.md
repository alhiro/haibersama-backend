# ERP Produk API

Backend API untuk menu mobile:
`Profile > ERP Produk`.

Base path mengikuti `APP_API_PREFIX`, contoh: `/api/erp`.

## Modul

ERP Produk punya modul:

```text
supplier
warehouse
production
inventory
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
cashType, category, paymentMethod, sourceModule
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
erp_warehouse
erp_inventory
erp_production
erp_cash_flow
erp_report
erp_scan_history
partner_product
```

Project ini belum memakai migration formal. Untuk membuat tabel, aktifkan
sementara blok sync model terkait di `models/index.js`, jalankan workflow
backend, lalu comment kembali setelah tabel terbentuk.
