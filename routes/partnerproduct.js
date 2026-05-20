var express = require("express");
var partnerProductRouter = express.Router();
var controller = require("../controllers/partnerproduct");
var headerAuth = require('../authMiddleware');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const FILE_PATH = 'product';
const ENV = process.env;
const uploadDir = './public/' + FILE_PATH;

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 2048,
    files: 1,
  },
  fileFilter: function (req, file, cb) {
    let ext = path.extname(file.originalname);

    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      req.fileValidationError = "Forbidden extension";
      return cb(null, false, req.fileValidationError);
    }
    cb(null, true);
  }
});

const pickFirst = (...values) => values.find((value) => value !== undefined && value !== null);

const buildPayload = (req, res) => {
  const productImage = req.file;
  const data = {
    partner_id: res.locals.auth.id,
    name: pickFirst(req.body.name, req.body.title, req.body.Name),
    sku: pickFirst(req.body.sku, req.body.SKU),
    description: pickFirst(req.body.description, req.body.subtitle, req.body.Description),
    status: pickFirst(req.body.status, req.body.Status),
    price: pickFirst(req.body.price, req.body.Price),
    warehouse: pickFirst(req.body.warehouse, req.body.Warehouse),
    production_batch: pickFirst(req.body.production_batch, req.body.production, req.body.ProductionBatch, req.body.Production),
    stock_quantity: pickFirst(req.body.stock_quantity, req.body.quantity, req.body.Quantity),
    unit: pickFirst(req.body.unit, req.body.Unit),
    supplier_name: pickFirst(req.body.supplier_name, req.body.SupplierName),
    inventory_note: pickFirst(req.body.inventory_note, req.body.InventoryNote),
    has_photo: pickFirst(req.body.has_photo, req.body.HasPhoto),
    image_url: pickFirst(req.body.image_url, req.body.ImageUrl),
    relations: pickFirst(req.body.relations, req.body.Relations),
    flow_flags: pickFirst(req.body.flow_flags, req.body.flowFlags, req.body.FlowFlags),
    public: pickFirst(req.body.public, req.body.Public),
    active: pickFirst(req.body.active, req.body.Active),
  };

  if (productImage && productImage.filename) {
    data.image_url = ENV.API_URL + '/ftp/' + FILE_PATH + '/' + productImage.filename;
    data.has_photo = true;
  }

  return data;
};

partnerProductRouter.get("/options", headerAuth.isUserAuthenticated, (req, res, next) => {
  controller.getOptions(req, res);
});

partnerProductRouter.get("/getall", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  controller.getAll(req, res);
});

partnerProductRouter.get("/listpublic", headerAuth.isUserAuthenticated, (req, res, next) => {
  controller.getPublicList(req, res);
});

partnerProductRouter.get("/get", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  controller.getDetail(req, res);
});

partnerProductRouter.get("/getpublic", headerAuth.isUserAuthenticated, (req, res, next) => {
  controller.getPublicDetail(req, res);
});

partnerProductRouter.get("/metrics", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  controller.getMetrics(req, res);
});

partnerProductRouter.get("/marketplace", headerAuth.isUserAuthenticated, (req, res, next) => {
  controller.getMarketplaceList(req, res);
});

partnerProductRouter.post("/add", headerAuth.isPartnerAuthenticated, upload.single('product'), (req, res, next) => {
  if (req.fileValidationError) {
    return res.status(400).json({ success: false, message: "Invalid file type", data: {} });
  }

  const data = buildPayload(req, res);
  data.created_by = res.locals.auth.email;
  controller.create(data, res);
});

partnerProductRouter.post("/update", headerAuth.isPartnerAuthenticated, upload.single('product'), (req, res, next) => {
  if (req.fileValidationError) {
    return res.status(400).json({ success: false, message: "Invalid file type", data: {} });
  }

  const data = buildPayload(req, res);
  data.id = parseInt(req.body.id);
  data.updated_by = res.locals.auth.email;
  controller.update(data, res);
});

partnerProductRouter.patch("/update", headerAuth.isPartnerAuthenticated, upload.single('product'), (req, res, next) => {
  if (req.fileValidationError) {
    return res.status(400).json({ success: false, message: "Invalid file type", data: {} });
  }

  const data = buildPayload(req, res);
  data.id = parseInt(req.body.id);
  data.updated_by = res.locals.auth.email;
  controller.update(data, res);
});

partnerProductRouter.delete("/delete", headerAuth.isPartnerAuthenticated, (req, res, next) => {
  const data = {
    partner_id: res.locals.auth.id,
    id: parseInt(req.body.id || req.query.id),
  };
  controller.delete(data, res);
});

partnerProductRouter.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: "Image too large (max 2MB)", data: err });
  }

  if (err.message) {
    return res.status(500).json({ success: false, message: err.message, data: err });
  }

  return res.status(500).json({ success: false, message: "Something went wrong", data: err });
});

module.exports = partnerProductRouter;
