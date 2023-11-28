const mongoose = require('mongoose');
const Product = require("../models/ProductModel");
const Warehouse = require("../models/WarehouseModel");
const Category = require("../models/CategoryModel");

const products = require("../data/products.json");

const DB_HOST = "mongodb://127.0.0.1:27017/safka-v1";

mongoose.connect(DB_HOST, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    const warehouse = await Warehouse.findOne();
    if (!warehouse) throw "no warehouse";
    const category = await Category.findOne();
    if (!category) throw "no category";

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (product.is_active === true) {
        const productData = {
          merchant: product.vendor,
          warehouse: warehouse._id,
          category: category._id,
          name: product.name,
          barcode: product.barcode,
          sale_price: product.sale_price,
          purchase_price: product.purchase_price,
          description: product.description,
          note: product.note,
          media_url: product.media_url,
          properties: product.properties,
          is_active: true,
          access_type: product.access_type,
          access_to: product.access_to,
          created_at: product.createdAt,
          updated_at: product.updatedAt
        }
        await new Product(productData).save();
      }
    }
    console.log("products added!");
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });