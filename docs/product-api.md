# Partner Product API

Modul sistem untuk menu ERP Produk di mobile:
`Profile > ERP Produk > Produk`.

Base path mengikuti `APP_API_PREFIX`, contoh: `/api/product`.

## Auth

Gunakan header:

```http
Authorization: <jwt-token>
```

Endpoint partner memakai `isPartnerAuthenticated`, sehingga hanya user partner
`type = 2` yang bisa membuat, mengubah, dan menghapus produk.

## Endpoints

| Method | Path | Auth | Fungsi |
| --- | --- | --- | --- |
| GET | `/product/options` | User | Opsi form produk: status, warehouse, batch produksi, satuan, dan pilihan produk dari data warehouse/produksi partner |
| GET | `/product/getall` | Partner | List produk milik partner login |
| GET | `/product/get?id=1` | Partner | Detail produk milik partner login |
| GET | `/product/listpublic?partner_id=2` | User | List produk publish untuk marketplace/member |
| GET | `/product/getpublic?id=1` | User | Detail produk publish |
| GET | `/product/metrics` | Partner | Ringkasan total SKU, publish, draft, perlu foto, total stok, rata-rata harga |
| GET | `/product/marketplace?partner_id=2` | User | Produk siap marketplace |
| POST | `/product/add` | Partner | Tambah produk |
| POST | `/product/update` | Partner | Update penuh produk |
| PATCH | `/product/update` | Partner | Update parsial produk |
| DELETE | `/product/delete?id=1` | Partner | Hapus produk |

List endpoint mendukung query:

```text
page, limit, search, status, warehouse, production_batch, startDate, endDate
```

## Create/Update Payload

Gunakan `multipart/form-data` jika upload foto produk. Field file:

```text
product
```

Field data:

```json
{
  "name": "Outer Linen Oversize",
  "sku": "HB-OUT-001",
  "description": "Varian cream, sage, navy. Size S sampai XL.",
  "status": "Publish",
  "price": 189000,
  "warehouse": "Warehouse Produk Jadi",
  "production_batch": "Batch OUT-2405",
  "stock_quantity": 84,
  "unit": "pcs",
  "supplier_name": "CV Sumber Kain Bandung",
  "inventory_note": "84 pcs siap jual",
  "public": true,
  "active": true
}
```

Alias lama juga diterima untuk beberapa field, misalnya `Name`, `Price`,
`Warehouse`, `ProductionBatch`, `Quantity`, dan `Public`.

Catatan relasi:
- `warehouse` sebaiknya dipilih dari data `erp_warehouse` partner.
- `production_batch` dan pilihan nama produk siap jual diambil dari
  `erp_production.output_product` dan `erp_production.destination_warehouse`.
- Jika belum ada warehouse/produksi, endpoint options akan mengembalikan list
  kosong agar admin tidak tertukar dengan data contoh.

## Response Shape

Response produk sengaja membawa field database dan alias UI:

```json
{
  "id": 1,
  "name": "Outer Linen Oversize",
  "title": "Outer Linen Oversize",
  "description": "Varian cream, sage, navy. Size S sampai XL.",
  "subtitle": "Varian cream, sage, navy. Size S sampai XL.",
  "sku": "HB-OUT-001",
  "meta": "SKU HB-OUT-001",
  "status": "Publish",
  "price": 189000,
  "amount": "Rp 189.000",
  "warehouse": "Warehouse Produk Jadi",
  "production_batch": "Batch OUT-2405",
  "stock_quantity": 84,
  "unit": "pcs",
  "stock": "84 pcs",
  "image_url": "https://.../ftp/product/product-123.jpg",
  "has_photo": true,
  "hasPhoto": true,
  "relations": [
    "Supplier: CV Sumber Kain Bandung",
    "Warehouse: Warehouse Produk Jadi",
    "Inventory: 84 pcs siap jual",
    "Produksi: Batch OUT-2405"
  ],
  "flowFlags": [
    { "label": "Dari Produksi", "value": "Batch OUT-2405" },
    { "label": "Gudang", "value": "Warehouse Produk Jadi" },
    { "label": "Siap Jual", "value": "84 pcs" }
  ]
}
```

## Database

Model Sequelize: `models/partnerProduct.js`

Table name:

```text
partner_product
```

Project ini belum memakai folder migration formal. Untuk membuat tabel,
aktifkan sementara blok sync `PartnerProduct.sequelize.sync({ alter: true })`
di `models/index.js`, jalankan sesuai workflow sistem, lalu comment kembali
setelah tabel terbentuk.
