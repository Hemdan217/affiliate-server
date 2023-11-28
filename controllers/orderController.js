// const Order = require('../models/OrderModel');
// const Product = require('../models/ProductModel');
// const PriceList = require('../models/PriceListModel');
// const { MerchantAccount, MarketerAccount } = require('../models/AccountModel');
// const { User } = require('../models/UserModel');
// const Notification = require('../models/NotificationModel');
// const { generator } = require('../utils/generator');
// const { checkDuplicatProducts } = require('../utils/order');

// const getOrders = async (req, res) => {
//   try {
//     let { page = 1, size = 10, query, filter } = req.query;

//     let searchQuery = {};
//     // if text does not includes comma and has a value will return ["test"] // lentgh: 1
//     if (query && query.split(",").length > 1) {
//       let finalArray = [];
//       query.split(",").forEach(el => {
//         finalArray.push({ serial_number: el });
//       });
//       searchQuery = { $or: finalArray }
//     } else if (query) {
//       searchQuery = { $text: { $search: query } };
//     }

//     const filterQuery = filter ? JSON.parse(filter) : {};
//     if (req.user.role === "merchant") {
//       filterQuery["items.merchant"] = { $in: [req.user._id] };
//     } else if (req.user.role === "marketer") {
//       filterQuery.marketer = req.user._id
//     } else if (req.user.role === "moderator") {
//       filterQuery.moderator = req.user._id
//     }
//     if (filterQuery.from && filterQuery.to) {
//       filterQuery['created_at'] = {
//         $gte: filterQuery.from,
//         $lte: filterQuery.to
//       }
//     };
//     if (filterQuery.warehouse) {
//       filterQuery['items.warehouse'] = { $in: [filterQuery.warehouse] }
//     }

//     delete filterQuery.warehouse;

//     const itemsCount = await Order.countDocuments({ ...searchQuery, ...filterQuery });
//     let data = await Order.find({ ...searchQuery, ...filterQuery })
//       .limit(size)
//       .skip((page - 1) * size)
//       .lean()
//       .sort('-updated_at')
//       .populate({
//         path: 'marketer moderator replies.sender actions.admin',
//         model: 'User',
//       }).populate({
//         path: 'shipping_governorate',
//         model: 'PriceList',
//       }).populate({
//         path: 'shipping_company',
//         model: 'ShippingCompany',
//       }).populate({
//         path: 'items.product',
//         model: 'Product'
//       });

//     const allOrders = await Order.countDocuments({ ...filterQuery, ...searchQuery });
//     const pendingOrders = await Order.countDocuments({ ...filterQuery, ...searchQuery, "status": "pending" });
//     const preparingOrders = await Order.countDocuments({ ...filterQuery, ...searchQuery, "status": "preparing" });
//     const shippedOrders = await Order.countDocuments({ ...filterQuery, ...searchQuery, "status": "shipped" });
//     const skipOrders = await Order.countDocuments({ ...filterQuery, ...searchQuery, "status": "skip" });
//     const availableOrders = await Order.countDocuments({ ...filterQuery, ...searchQuery, "status": "available" });
//     const asToReturnOrders = await Order.countDocuments({ ...filterQuery, ...searchQuery, "status": "ask_to_return" });
//     const holdingOrders = await Order.countDocuments({ ...filterQuery, ...searchQuery, "status": "holding" });
//     const returned1Orders = await Order.countDocuments({ ...filterQuery, ...searchQuery, "status": "returned1" });
//     const returned2Orders = await Order.countDocuments({ ...filterQuery, ...searchQuery, "status": "returned2" });
//     const declined1Orders = await Order.countDocuments({ ...filterQuery, ...searchQuery, "status": "declined1" });
//     const declined2Orders = await Order.countDocuments({ ...filterQuery, ...searchQuery, "status": "declined2" });

//     res.json({
//       success: true,
//       itemsCount,
//       pages: Math.ceil(itemsCount / size),
//       data,
//       allOrders,
//       pendingOrders,
//       preparingOrders,
//       shippedOrders,
//       skipOrders,
//       availableOrders,
//       asToReturnOrders,
//       holdingOrders,
//       returned1Orders,
//       returned2Orders,
//       declined1Orders,
//       declined2Orders
//     });
//   }
//   catch (error) {
//     console.log(error);
//     res.status(400).json({
//       success: false,
//       errors: [{ 'msg': 'something went wrong' }]
//     });
//   }
// }

// const createOrders = async (req, res) => {
//   try {
//     const { orders } = req.body;

//     // check the order items if it is array or not
//     if (typeof orders !== "object" || !Array.isArray(orders)) throw new Error("تم ادخل الاوردرات بشكل خاطىء");

//     // validate each order
//     for (let i = 0; i < orders.length; i++) {
//       const { items, shipping_governorate, total } = orders[i];

//       // check if total is valid
//       if (!total || isNaN(total) || total < 0) throw new Error("الاجمالي غير صحيح");

//       // check the order items if it is array or not
//       if (typeof items !== "object" || !Array.isArray(items)) throw new Error("تم ادخل الاوردرات بشكل خاطىء");

//       // check if product duplicated or not
//       const isProductDuplicates = checkDuplicatProducts(items);
//       if (isProductDuplicates) throw new Error("يوجد اوردر متكرر");

//       // check the shipping governorate
//       const shippingGovernorate = await PriceList.findOne({ governorate: Number(shipping_governorate) });
//       if (!shippingGovernorate) throw new Error(`من فضلك اختر شركة شحن في الاوردر رقم ${i + 1}`);

//       // get totalProductsSalePrice
//       let totalProductsSalePrice = 0;
//       // validate order items, properties and quantity
//       for (let i = 0; i < items.length; i++) {
//         // order product
//         const productData = items[i];

//         // check if the product ID exists in the Product collection
//         const product = await Product.findOne({ barcode: productData.barcode });
//         if (!product) throw new Error("تم ادخل منتج غير موجود");

//         // check if the property key exists in the product's properties array
//         const property = product.properties.find(prop => String(prop._id) === String(productData.property));
//         if (!property) throw new Error("تم ادخل خاصية غير موجوده");

//         // check if the quantity is valid
//         if (!productData.qty || isNaN(productData.qty)) throw new Error("ادخل الكمية بشكل صحيح");

//         // check if the quantity in the property key is valid
//         if (+productData.qty > property.value) throw new Error("الكمية المطلوبه غير متاحه");

//         // increase total products sale price
//         totalProductsSalePrice += product.sale_price * +productData.qty
//       }
//       // validate commission
//       const commission = +total - (totalProductsSalePrice + shippingGovernorate.price);
//       if (commission < 0) throw new Error("العمولة غير صحيحه");

//       // validate total
//       if (totalProductsSalePrice + shippingGovernorate.price > +total) throw new Error("ادخل الاجمالي بشكل صحيح");
//     }

//     for (let i = 0; i < orders.length; i++) {
//       const {
//         client_name, client_phone1,
//         client_phone2, client_address,
//         shipping_governorate,
//         page_name, items, city, note, total
//       } = orders[i];

//       // check the shipping governorate
//       const shippingGovernorate = await PriceList.findOne({ governorate: shipping_governorate });
//       if (!shippingGovernorate) throw new Error("من فضلك اختر محافظة شحن");

//       let account = {};
//       if (req.user.role === "moderator") {
//         const mainAccount = await User.findById(req.user.main_account);
//         account.marketer = mainAccount._id;
//         account.moderator = req.user._id
//       } else {
//         account.marketer = req.user._id
//       }

//       // generate unique order id
//       const serial_number = generator({ length: 6, isNumeric: true });

//       // check if any order contains this serial number
//       const checkOrder = await Order.findOne({ serial_number: `sk-${serial_number}` });
//       if (checkOrder) throw new Error(`order_at_serial${i}_exists`);

//       // get total products sale Price
//       let totalProductsSalePrice = 0;

//       // update the product quantity and the merchant, marketer wallet
//       for (let i = 0; i < items.length; i++) {
//         const productData = items[i];
//         const product = await Product.findOne({ barcode: productData.barcode });

//         // get static values
//         const salePrice = product.sale_price;
//         const purchasePrice = product.purchase_price;
//         const merchant = product.merchant;
//         const warehouse = product.warehouse;
//         const qty = productData.qty;
//         const totalSalePrice = salePrice * qty;
//         const totalPurchasePrice = purchasePrice * qty;

//         // set static values
//         productData.product = product._id;
//         productData.merchant = merchant;
//         productData.warehouse = warehouse;
//         productData.sale_price = salePrice;
//         productData.purchase_price = purchasePrice;
//         productData.total_sale_price = totalSalePrice;
//         productData.total_purchase_price = totalPurchasePrice;

//         // update total prudcts sale price
//         totalProductsSalePrice += totalSalePrice;

//         // init or update the merchant wallet
//         const merchantAccount = await MerchantAccount.findOne({ merchant });
//         if (merchantAccount) {
//           await MerchantAccount.findOneAndUpdate({ merchant }, { $inc: { pending: totalPurchasePrice } });
//         } else {
//           await new MerchantAccount({ merchant, pending: totalPurchasePrice }).save();
//         }

//         // update the product qty
//         const property = product.properties.find(prop => String(prop._id) === String(productData.property));
//         property.value -= qty;
//         await product.save();
//       }

//       // get commission
//       const commission = +total - (totalProductsSalePrice + shippingGovernorate.price);

//       // init or update the marketer wallet
//       const marketerAccount = await MarketerAccount.findOne({ marketer: account.marketer });
//       if (marketerAccount) {
//         await MarketerAccount.findOneAndUpdate({ marketer: account.marketer }, { $inc: { pending: +commission } });
//       } else {
//         await new MarketerAccount({ marketer: account.marketer, pending: commission }).save();
//       }

//       await new Order({
//         ...account,
//         serial_number: `sk-${serial_number}`,
//         client_name,
//         client_phone1,
//         client_phone2,
//         client_address,
//         shipping_governorate: shippingGovernorate._id,
//         shipping: shippingGovernorate.price,
//         city,
//         page_name,
//         commission,
//         items,
//         total,
//         note,
//       }).save();
//     }

//     res.json({
//       success: true,
//       data: {}
//     });

//   }
//   catch (error) {
//     console.log(error);
//     res.status(400).json({
//       success: false,
//       errors: [{ 'msg': error?.message || 'something went wrong' }]
//     });
//   }
// }

// const createOrder = async (req, res) => {
//   try {
//     const {
//       client_name, client_phone1,
//       client_phone2, client_address,
//       shipping_governorate, commission,
//       page_name, items, city, note, total
//     } = req.body;

//     // check the order items if it is array or not
//     if (typeof items !== "object" || !Array.isArray(items)) throw new Error("الاوردرات غير صحيحة");

//     // check if product duplicated or not
//     const isProductDuplicates = checkDuplicatProducts(items);
//     if (isProductDuplicates) throw new Error("يوجد منتج متكرر");

//     // check the commission
//     if (!commission || isNaN(commission) || commission < 0) throw new Error("العمولة غير صحيحه");

//     // check the shipping governorate
//     const shippingGovernorate = await PriceList.findById(shipping_governorate);
//     if (!shippingGovernorate) throw new Error("محافظة الشحن مطلوبة");

//     // validate order items, properties and quantity
//     for (let i = 0; i < items.length; i++) {
//       // order product
//       const productData = items[i];

//       // check if the product ID exists in the Product collection
//       const product = await Product.findById(productData.product);
//       if (!product) throw new Error("كود المنتج غير صحيح");

//       // check if the property key exists in the product's properties array
//       const property = product.properties.find(prop => String(prop._id) === String(productData.property));
//       if (!property) throw new Error("خاصية المنتج غير صحيحة");

//       // check if the quantity is valid
//       if (!productData.qty || isNaN(productData.qty)) throw new Error("ادخل العمولة بشكل صحيح");

//       // check if the quantity in the property key is valid
//       if (+productData.qty > property.value) throw new Error("الكمية غير متاحه");
//     }

//     let account = {};
//     if (req.user.role === "moderator") {
//       const mainAccount = await User.findById(req.user.main_account);
//       account.marketer = mainAccount._id;
//       account.moderator = req.user._id
//     } else {
//       account.marketer = req.user._id
//     }

//     // generate unique order id
//     const serial_number = generator({ length: 6, isNumeric: true });

//     // check if any order contains this serial number
//     const checkOrder = await Order.findOne({ serial_number: `sk-${serial_number}` });
//     if (checkOrder) throw new Error("كود الطلب موجود بالفعل");

//     // update the product quantity and the merchant, marketer wallet
//     for (let i = 0; i < items.length; i++) {
//       const productData = items[i];
//       const product = await Product.findById(productData.product);

//       // get static values
//       const salePrice = product.sale_price;
//       const purchasePrice = product.purchase_price;
//       const merchant = product.merchant;
//       const warehouse = product.warehouse;
//       const qty = productData.qty;
//       const totalSalePrice = salePrice * qty;
//       const totalPurchasePrice = purchasePrice * qty;

//       // set static values
//       productData.merchant = merchant;
//       productData.warehouse = warehouse;
//       productData.sale_price = salePrice;
//       productData.purchase_price = purchasePrice;
//       productData.total_sale_price = totalSalePrice;
//       productData.total_purchase_price = totalPurchasePrice;

//       // init or update the merchant wallet
//       const merchantAccount = await MerchantAccount.findOne({ merchant });
//       if (merchantAccount) {
//         await MerchantAccount.findOneAndUpdate({ merchant }, { $inc: { pending: totalPurchasePrice } });
//       } else {
//         await new MerchantAccount({ merchant, pending: totalPurchasePrice }).save();
//       }

//       // update the product qty
//       const property = product.properties.find(prop => String(prop._id) === String(productData.property));
//       property.value -= qty;
//       await product.save();
//     }

//     // init or update the marketer wallet
//     const marketerAccount = await MarketerAccount.findOne({ marketer: account.marketer });
//     if (marketerAccount) {
//       await MarketerAccount.findOneAndUpdate({ marketer: account.marketer }, { $inc: { pending: +commission } });
//     } else {
//       await new MarketerAccount({ marketer: account.marketer, pending: commission }).save();
//     }

//     const order = await new Order({
//       ...account,
//       serial_number: `sk-${serial_number}`,
//       client_name,
//       client_phone1,
//       client_phone2,
//       client_address,
//       shipping_governorate: shippingGovernorate._id,
//       shipping: shippingGovernorate.price,
//       city,
//       page_name,
//       commission,
//       items,
//       total,
//       note,
//     }).save();

//     res.json({
//       success: true,
//       data: order
//     });

//   }
//   catch (error) {
//     console.log(error);
//     res.status(400).json({
//       success: false,
//       errors: [{ 'msg': error?.message || 'something went wrong' }]
//     });
//   }
// }

// const updateOrder = async (req, res) => {
//   try {
//     const orderId = req.params.orderId;
//     const {
//       client_name, client_phone1,
//       client_phone2, client_address,
//       shipping_governorate, commission,
//       page_name, items, city, note, total
//     } = req.body;

//     const oldOrder = await Order.findById(orderId);
//     if (!oldOrder) throw new Error("orders.order_doesn't_exists");

//     // check the order items if it is array or not
//     if (typeof items !== "object" || !Array.isArray(items)) throw new Error("orders.items_must_be_array");

//     // check if product duplicated or not
//     const isProductDuplicates = checkDuplicatProducts(items);
//     if (isProductDuplicates) throw new Error("orders.there_is_product_duplicates");

//     // check the commission
//     if (!commission || isNaN(commission) || commission < 0) throw new Error("orders.commission_is_not_valid");

//     // check the shipping governorate
//     const shippingGovernorate = await PriceList.findById(shipping_governorate);
//     if (!shippingGovernorate) throw new Error("orders.shipping_governorate_is_required");

//     // loop throw the new order to check if there is an product is out of stock or not
//     for (let i = 0; i < items.length; i++) {
//       const productData = items[i];

//       // check if the current item has an effect in the old order
//       const oldItem = oldOrder.items.find(el => {
//         return String(el.product) === String(productData.product) && String(el.property) === String(productData.property);
//       });

//       if (oldItem) {
//         // get current product
//         const product = await Product.findById(oldItem.product);
//         if (!product) throw new Error("orders.invalid_product_id");

//         // check if the property key exists in the product's properties array
//         const property = product.properties.find(prop => String(prop._id) === String(oldItem.property));
//         if (!property) throw new Error("orders.invalid_property_key");

//         // check if the quantity is valid
//         if (!productData.qty || isNaN(productData.qty)) throw new Error("orders.qty_must_be_number_or_greater_than_0");

//         // the final quantity after add the old quantity to the current product
//         let lastQuantity = property.value + oldItem.qty;
//         if (+productData.qty > lastQuantity) throw new Error(`${product.name} لا يحتوي على الكمية الكافية!`);
//       } else {
//         // check if the product ID exists in the Product collection
//         const product = await Product.findById(productData.product);
//         if (!product) throw new Error("orders.invalid_product_id");

//         // check if the property key exists in the product's properties array
//         const property = product.properties.find(prop => String(prop._id) === String(productData.property));
//         if (!property) throw new Error("orders.invalid_property_key");

//         // check if the quantity is valid
//         if (!productData.qty || isNaN(productData.qty)) throw new Error("orders.qty_must_be_number_or_greater_than_0");

//         // check if the quantity in the property key is valid
//         if (+productData.qty > property.value) throw new Error("orders.quantity_is_not_enough");
//       }
//     }

//     if (oldOrder.key > +req.body.key) throw 'key_not_valid!';
//     delete req.body.key;

//     // loop through the new items
//     for (let i = 0; i < items.length; i++) {
//       const productData = items[i];
//       const oldItem = oldOrder.items.find(el => String(el.product) === productData.product && String(el.property) === productData.property);
//       const product = await Product.findById(productData.product);

//       // get static values
//       const salePrice = product.sale_price;
//       const purchasePrice = product.purchase_price;
//       const merchant = product.merchant;
//       const warehouse = product.warehouse;
//       const qty = productData.qty;
//       const totalSalePrice = salePrice * qty;
//       const totalPurchasePrice = purchasePrice * qty;

//       // set static values
//       productData.merchant = merchant;
//       productData.warehouse = warehouse;
//       productData.sale_price = salePrice;
//       productData.purchase_price = purchasePrice;
//       productData.total_sale_price = totalSalePrice;
//       productData.total_purchase_price = totalPurchasePrice;

//       if (oldItem) {
//         // update the merchant account
//         const merchantAccount = await MerchantAccount.findOne({ merchant: oldItem.merchant });
//         await MerchantAccount.findByIdAndUpdate(merchantAccount._id, {
//           $inc: { pending: totalPurchasePrice - oldItem.total_purchase_price }
//         });

//         // update the product qty
//         const property = product.properties.find(prop => String(prop._id) === String(productData.property));
//         property.value -= oldItem.qty - qty;
//         await product.save();
//       }
//       else {
//         // init or update the merchant wallet
//         const merchantAccount = await MerchantAccount.findOne({ merchant });
//         if (merchantAccount) {
//           await MerchantAccount.findOneAndUpdate({ merchant }, { $inc: { pending: totalPurchasePrice } });
//         } else {
//           await new MerchantAccount({ merchant, pending: totalPurchasePrice }).save();
//         }

//         // update the product qty
//         const property = product.properties.find(prop => String(prop._id) === String(productData.property));
//         property.value -= +qty;
//         await product.save();
//       }
//     }

//     // loop through the old items to get the deleted items
//     for (let i = 0; i < oldOrder.items.length; i++) {
//       const oldItem = oldOrder.items[i];
//       const existsItem = items.find(item => item.product === String(oldItem.product) && item.property === String(oldItem.property));
//       if (!existsItem) {
//         const product = await Product.findById(oldItem.product);

//         // update the product qty
//         const property = product.properties.find(prop => String(prop._id) === String(oldItem.property));
//         property.value += oldItem.qty;
//         await product.save();

//         // update the merchant account
//         const merchantAccount = await MerchantAccount.findOne({ merchant: oldItem.merchant });
//         await MerchantAccount.findByIdAndUpdate(merchantAccount._id, {
//           $inc: { pending: -oldItem.total_purchase_price }
//         });
//       }
//     }

//     // update the sales account
//     await MarketerAccount.findOneAndUpdate({ marketer: oldOrder.marketer }, {
//       $inc: { pending: commission - oldOrder.commission },
//     }, { new: true });

//     const order = await Order.findByIdAndUpdate(oldOrder._id,
//       {
//         client_name,
//         client_phone1,
//         client_phone2,
//         client_address,
//         shipping_governorate: shippingGovernorate._id,
//         shipping: shippingGovernorate.price,
//         city,
//         page_name,
//         commission,
//         items,
//         total,
//         note,
//         $inc: { key: 1 },
//       },
//       { new: true, timestamps: false }
//     );

//     res.status(200).json({
//       success: true,
//       data: order
//     });
//   }
//   catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       errors: [{ 'msg': error?.message || 'something went wrong' }]
//     });
//   }
// }


// const updateOrdersStatus = async (req, res) => {
//   try {
//     const { status, holding_to, orders } = req.body;

//     // check if the orders are array
//     if (typeof orders !== "object" || !Array.isArray(orders)) throw new Error("orders.orders_must_be_array");

//     // check if all the objects id are valid
//     const checkObjectsIds = await Order.find({ _id: { $in: orders } });
//     if (orders.length > checkObjectsIds) throw new Error("orders.orders_contains_invalid_objectId");

//     for (let i = 0; i < orders.length; i++) {
//       const order = await Order.findById(orders[i]._id);
//       const currentOrder = orders[i];
//       if (order.key > currentOrder.key) throw new Error("orders.order_status_changed");
//     }

//     for (let i = 0; i < orders.length; i++) {
//       const currentOrder = orders[i];

//       const order = await Order.findByIdAndUpdate(
//         currentOrder._id,
//         {
//           holding_to,
//           status,
//           $inc: { key: 1 },
//           $push: { actions: { admin: req.user._id, status } },
//         },
//         { new: true, runValidators: true }
//       );
//       await handleOrderStatus(order);
//     }

//     res.json({
//       success: true,
//       data: {}
//     });
//   }
//   catch (error) {
//     console.log(error);
//     res.status(400).json({
//       success: false,
//       errors: [{ 'msg': error?.message || 'something went wrong' }]
//     });
//   }
// }

// const updateOrderShippingCompany = async (req, res) => {
//   try {
//     const { orders, shipping_company } = req.body;

//     for (let i = 0; i < orders.length; i++) {
//       const currentOrders = orders[i];

//       await Order.findByIdAndUpdate(
//         currentOrders._id,
//         {
//           shipping_company,
//           $inc: { key: 1 }
//         },
//         { new: true, timestamps: false }
//       );
//     }

//     res.json({
//       success: true,
//       data: {}
//     });
//   }
//   catch (error) {
//     console.log(error);
//     res.status(400).json({
//       success: false,
//       errors: [{ 'msg': 'something went wrong' }]
//     });
//   }
// }

// const createOrderNote = async (req, res) => {
//   try {
//     const order = await Order.findByIdAndUpdate(
//       req.params.orderId,
//       { $push: { replies: req.body } },
//       { new: true, timestamps: false }
//     ).populate({
//       path: 'marketer moderator replies.sender actions.admin',
//       model: 'User',
//     }).populate({
//       path: 'shipping_governorate',
//       model: 'PriceList',
//     }).populate({
//       path: 'shipping_company',
//       model: 'ShippingCompany',
//     }).populate({
//       path: 'items.product',
//       model: 'Product'
//     });

//     const senderId = req.body.sender;
//     const user = await User.findOne({ _id: senderId });
//     if (user?.role === "marketer" || user?.role === "moderator") {
//       await new Notification({
//         type: "order_note",
//         order: order?._id,
//         content: `لديك رساله في ملاحظات الطلب رقم (${order?.serial_number})`,
//         for: "admin",
//         who: []
//       }).save();
//     } else if (user?.role === "admin") {
//       if (order.moderator) {
//         await new Notification({
//           type: "order_note",
//           order: order?._id,
//           content: `لديك رساله في ملاحظات الطلب رقم (${order?.serial_number})`,
//           for: "moderator",
//           who: [order.moderator?._id]
//         }).save();
//       } else {
//         await new Notification({
//           type: "order_note",
//           order: order?._id,
//           content: `لديك رساله في ملاحظات الطلب رقم (${order?.serial_number})`,
//           for: "marketer",
//           who: [order.marketer?._id]
//         }).save();
//       }
//     }

//     res.json({
//       success: true,
//       data: order
//     });
//   }
//   catch (error) {
//     console.log(error);
//     res.status(400).json({
//       success: false,
//       errors: [{ 'msg': 'something went wrong' }]
//     });
//   }
// }

// const handleOrderStatus = async (order) => {
//   // handle each order status
//   if (order.status === "preparing") {
//     const items = order.items;
//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];
//       const merchant = item.merchant;
//       const totalPurchasePrice = item.total_purchase_price;

//       await MerchantAccount.findOneAndUpdate({ merchant }, {
//         $inc: { pending: -totalPurchasePrice, preparing: totalPurchasePrice },
//       });
//     }
//     await MarketerAccount.findOneAndUpdate({ marketer: order.marketer }, {
//       $inc: { pending: -order.commission, preparing: order.commission },
//     });
//   }

//   else if (order.status === "declined1") {
//     const items = order.items;
//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];
//       const merchant = item.merchant;
//       await Product.findOneAndUpdate({ 'properties._id': items[i].property }, {
//         $inc: { 'properties.$.value': item.qty }
//       }, { new: true });
//       const totalPurchasePrice = item.total_purchase_price;
//       await MerchantAccount.findOneAndUpdate({ merchant }, {
//         $inc: { pending: -totalPurchasePrice },
//       });
//     }
//     await MarketerAccount.findOneAndUpdate({ marketer: order.marketer }, {
//       $inc: { pending: -order.commission },
//     });
//   }

//   else if (order.status === "shipped") {
//     const items = order.items;
//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];
//       const merchant = item.merchant;
//       const totalPurchasePrice = item.total_purchase_price;
//       await MerchantAccount.findOneAndUpdate({ merchant }, {
//         $inc: { preparing: -totalPurchasePrice, shipped: totalPurchasePrice },
//       });
//     }
//     await MarketerAccount.findOneAndUpdate({ marketer: order.marketer }, {
//       $inc: { preparing: -order.commission, shipped: order.commission },
//     });
//   }

//   else if (order.status === "skip") {
//     const items = order.items;
//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];
//       const merchant = item.merchant;
//       const totalPurchasePrice = item.total_purchase_price;
//       await MerchantAccount.findOneAndUpdate({ merchant }, {
//         $inc: { shipped: -totalPurchasePrice },
//       });
//     }
//     await MarketerAccount.findOneAndUpdate({ marketer: order.marketer }, {
//       $inc: { shipped: -order.commission },
//     });
//   }

//   else if (order.status === "returned1") {
//     const items = order.items;
//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];
//       await Product.findOneAndUpdate({ 'properties._id': item.property }, {
//         $inc: { 'properties.$.value': item.qty }
//       }, { new: true });
//     }
//   }

//   else if (order.status === "declined2") {
//     const items = order.items;
//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];
//       const merchant = item.merchant;
//       await Product.findOneAndUpdate({ 'properties._id': item.property }, {
//         $inc: { 'properties.$.value': item.qty }
//       }, { new: true });
//       const totalPurchasePrice = item.total_purchase_price;
//       await MerchantAccount.findOneAndUpdate({ merchant }, {
//         $inc: { preparing: -totalPurchasePrice },
//       });
//     }
//     await MarketerAccount.findOneAndUpdate({ marketer: order.marketer }, {
//       $inc: { preparing: -order.commission },
//     });
//   }

//   else if (order.status === "available") {
//     const items = order.items;
//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];
//       const merchant = item.merchant;
//       const totalPurchasePrice = item.total_purchase_price;
//       await MerchantAccount.findOneAndUpdate({ merchant }, {
//         $inc: { shipped: -totalPurchasePrice, available: totalPurchasePrice },
//       });
//     }
//     await MarketerAccount.findOneAndUpdate({ marketer: order.marketer }, {
//       $inc: { shipped: -order.commission, available: order.commission },
//     });
//   }

//   else if (order.status === "ask_to_return") {
//     const items = order.items;
//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];
//       const merchant = item.merchant;
//       const totalPurchasePrice = item.total_purchase_price;
//       await MerchantAccount.findOneAndUpdate({ merchant }, {
//         $inc: { available: -totalPurchasePrice, returned: totalPurchasePrice },
//       });
//     }
//     await MarketerAccount.findOneAndUpdate({ marketer: order.marketer }, {
//       $inc: { available: -order.commission, returned: order.commission },
//     });
//   }

//   else if (order.status === "returned2") {
//     const items = order.items;
//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];
//       await Product.findOneAndUpdate({ 'properties._id': item.property }, {
//         $inc: { 'properties.$.value': item.qty }
//       }, { new: true });
//     }
//   }

//   if (order.moderator) {
//     await new Notification({
//       type: "order_status",
//       order: order?._id,
//       content: `تم تغير حالة طلبك رقم (${order?.serial_number}) الي ${order.status}`,
//       for: "moderator",
//       who: [order.moderator?._id]
//     }).save();
//   } else {
//     await new Notification({
//       type: "order_status",
//       order: order?._id,
//       content: `تم تغير حالة طلبك رقم (${order?.serial_number}) الي ${order.status}`,
//       for: "marketer",
//       who: [order.marketer?._id]
//     }).save();
//   }
// }

// const checkDuplicateOrder = async (req, res) => {
//   try {
//     const { client_name, client_phone1, items } = req.body;
//     const existingOrders = await Order.find({
//       $or: [{ status: "pending" }, { status: "shipped" }, { status: "available" }, { status: "preparing" }],
//       client_phone1,
//       client_name
//     });

//     const existingOrder = existingOrders.find(order => {
//       return order.items.length === items.length && order.items.every((item, index) => {
//         return String(item.product) === String(items[index].product) && String(item.property) === String(items[index].property);
//       });
//     });

//     if (existingOrder) return res.json({ exists: true });

//     res.json({ exists: false });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       errors: [{ 'msg': 'something went wrong' }]
//     });
//   }
// }

// const getNextOrder = async (req, res) => {
//   try {
//     const date = req.params.date;
//     const order = await Order.findOne({ status: "pending", created_at: { $gt: date } });
//     res.json({ order });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       errors: [{ 'msg': 'something went wrong' }]
//     });
//   }
// }

// const updatedOrderCallAction = async (req, res) => {
//   try {
//     const orderId = req.params.orderId;
//     let message;

//     if (req.body.action_name === "whats1_clicked") {
//       message = `تم التواصل مع العميل عن طريق الواتساب`;
//     } else if (req.body.action_name === "whats2_clicked") {
//       message = `تم التواصل مع العميل عن طريق رقم الهاتف الثاني`;
//     } else if (req.body.action_name === "sms1_clicked") {
//       message = `تم التواصل مع العميل عن طريق رسالة sms لانه لم يرد على الواتساب`;
//     } else if (req.body.action_name === "sms2_clicked") {
//       message = `تم التواصل مع العميل عن طريق sms على رقم الهاتف الثاني`;
//     }

//     if (message) {
//       await Order.findByIdAndUpdate(
//         orderId,
//         {
//           $inc: {
//             [req.body.action_name]: 1,
//             key: 1
//           },
//           $push: { replies: { sender: req.user._id, body: message } }
//         }, { new: true, timestamps: false });
//     } else {
//       await Order.findByIdAndUpdate(
//         orderId,
//         { $inc: { [req.body.action_name]: 1, key: 1 } }, { new: true, timestamps: false });
//     }

//     res.json({});
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       errors: [{ 'msg': 'something went wrong' }]
//     });
//   }
// }

// module.exports = {
//   getOrders,
//   createOrder,
//   createOrders,
//   updateOrder,
//   updateOrdersStatus,
//   updateOrderShippingCompany,
//   createOrderNote,
//   checkDuplicateOrder,
//   getNextOrder,
//   updatedOrderCallAction
// }






const Order = require('../models/OrderModel');
const Product = require('../models/ProductModel');
const PriceList = require('../models/PriceListModel');
const { MerchantAccount, MarketerAccount } = require('../models/AccountModel');
const { User } = require('../models/UserModel');
const Notification = require('../models/NotificationModel');
const { generator } = require('../utils/generator');
const { checkDuplicatProducts } = require('../utils/order');

const getOrders = async (req, res) => {
  try {
    // let { page = 1, size = 10, query, filter } = req.query;

    // let searchQuery = {};
    // let finalArray = [];
    // // if text does not includes comma and has a value will return ["test"] // lentgh: 1
    // if (query && query.trim().length > 1) {
    //   // console.log("query : ");
    //   // console.log(query);
    //   query.split(" ").forEach(el => {
    //     finalArray.push({ serial_number: el }, { client_phone1: el }, { client_phone2: el });
    //     if(el === ""){
    //       finalArray.pop()
    //     }

    //   });
    //   searchQuery = { $or: finalArray }
    // } else if (query) {
    //   searchQuery = { $text: { $search: query } };
    // }




    // let { page = 1, size = 10, query, filter } = req.query;

    // let searchQuery = {};
    // if (query && query.split(' ').length > 1) {
    //   let finalArray = [];
    //   query.split(" ").forEach(el => {
    //     finalArray.push({ serial_number: el });
    //   });
    //   searchQuery = { $or: finalArray }
    // } else if (query) {
    //   searchQuery = { $text: { $search: query } };
    // }


    let { page = 1, size = 10, query, filter } = req.query;

    let searchQuery = {};
    if (query && /^\d{11}$/.test(query)) {
      // Matches a phone number format of 11 digits
      searchQuery = { client_phone1: query };
    }
    else if (query) {
      let finalArray = [];
      query.split(" ").forEach(el => {
        finalArray.push({ serial_number: el });
      });
      searchQuery = { $or: finalArray };
    }
  //  else {
  //   searchQuery = { client_name: { $search: query } };
  // }


  const filterQuery = filter ? JSON.parse(filter) : {};
  if (req.user.role === "merchant") {
    filterQuery["items.merchant"] = { $in: [req.user._id] };
  } else if (req.user.role === "marketer") {
    filterQuery.marketer = req.user._id
  } else if (req.user.role === "moderator") {
    filterQuery.moderator = req.user._id
  }
  if (filterQuery.from && filterQuery.to) {
    filterQuery['created_at'] = {
      $gte: filterQuery.from,
      $lte: filterQuery.to
    }
  };
  if (filterQuery.warehouse) {
    filterQuery['items.warehouse'] = { $in: [filterQuery.warehouse] }
  }
  delete filterQuery.warehouse;

  const itemsCount = await Order.countDocuments({ ...searchQuery, ...filterQuery });
  let data = await Order.find({ ...searchQuery, ...filterQuery })
    .limit(size)
    .skip((page - 1) * size)
    .lean()
    .sort('-updated_at')
    .populate({
      path: 'marketer moderator replies.sender actions.admin',
      model: 'User',
    }).populate({
      path: 'shipping_governorate',
      model: 'PriceList',
    }).populate({
      path: 'shipping_company',
      model: 'ShippingCompany',
    }).populate({
      path: 'items.product',
      model: 'Product'
    });


  // console.log("{ ...searchQuery, ...filterQuery }");
  // console.log({ ...searchQuery, ...filterQuery });

  const allOrders = await Order.countDocuments({ ...filterQuery, ...searchQuery });
  const pendingOrders = await Order.countDocuments({ ...filterQuery, ...searchQuery, "status": "pending" });
  const preparingOrders = await Order.countDocuments({ ...filterQuery, ...searchQuery, "status": "preparing" });
  const shippedOrders = await Order.countDocuments({ ...filterQuery, ...searchQuery, "status": "shipped" });
  const skipOrders = await Order.countDocuments({ ...filterQuery, ...searchQuery, "status": "skip" });
  const availableOrders = await Order.countDocuments({ ...filterQuery, ...searchQuery, "status": "available" });
  const asToReturnOrders = await Order.countDocuments({ ...filterQuery, ...searchQuery, "status": "ask_to_return" });
  const holdingOrders = await Order.countDocuments({ ...filterQuery, ...searchQuery, "status": "holding" });
  const returned1Orders = await Order.countDocuments({ ...filterQuery, ...searchQuery, "status": "returned1" });
  const returned2Orders = await Order.countDocuments({ ...filterQuery, ...searchQuery, "status": "returned2" });
  const declined1Orders = await Order.countDocuments({ ...filterQuery, ...searchQuery, "status": "declined1" });
  const declined2Orders = await Order.countDocuments({ ...filterQuery, ...searchQuery, "status": "declined2" });

  res.json({
    success: true,
    itemsCount,
    pages: Math.ceil(itemsCount / size),
    data,
    allOrders,
    pendingOrders,
    preparingOrders,
    shippedOrders,
    skipOrders,
    availableOrders,
    asToReturnOrders,
    holdingOrders,
    returned1Orders,
    returned2Orders,
    declined1Orders,
    declined2Orders
  });
}
  catch (error) {
  console.log(error);
  res.status(400).json({
    success: false,
    errors: [{ 'msg': 'something went wrong' }]
  });
}
}

const createOrders = async (req, res) => {
  try {
    const { orders } = req.body;

    // check the order items if it is array or not
    if (typeof orders !== "object" || !Array.isArray(orders)) throw new Error("تم ادخل الاوردرات بشكل خاطىء");

    // validate each order
    for (let i = 0; i < orders.length; i++) {
      const { items, shipping_governorate, total } = orders[i];

      // check if total is valid
      if (!total || isNaN(total) || total < 0) throw new Error("الاجمالي غير صحيح");

      // check the order items if it is array or not
      if (typeof items !== "object" || !Array.isArray(items)) throw new Error("تم ادخل الاوردرات بشكل خاطىء");

      // check if product duplicated or not
      const isProductDuplicates = checkDuplicatProducts(items);
      if (isProductDuplicates) throw new Error("يوجد اوردر متكرر");

      // check the shipping governorate
      const shippingGovernorate = await PriceList.findOne({ governorate: Number(shipping_governorate) });
      if (!shippingGovernorate) throw new Error(`من فضلك اختر شركة شحن في الاوردر رقم ${i + 1}`);

      // get totalProductsSalePrice
      let totalProductsSalePrice = 0;
      // validate order items, properties and quantity
      for (let i = 0; i < items.length; i++) {
        // order product
        const productData = items[i];

        // check if the product ID exists in the Product collection
        const product = await Product.findOne({ barcode: productData.barcode });
        if (!product) throw new Error("تم ادخل منتج غير موجود");

        // check if the property key exists in the product's properties array
        const property = product.properties.find(prop => String(prop._id) === String(productData.property));
        if (!property) throw new Error("تم ادخل خاصية غير موجوده");

        // check if the quantity is valid
        if (!productData.qty || isNaN(productData.qty)) throw new Error("ادخل الكمية بشكل صحيح");

        // check if the quantity in the property key is valid
        if (+productData.qty > property.value) throw new Error("الكمية المطلوبه غير متاحه");

        // increase total products sale price
        totalProductsSalePrice += product.sale_price * +productData.qty
      }
      // validate commission
      const commission = +total - (totalProductsSalePrice + shippingGovernorate.price);
      if (commission < 0) throw new Error("العمولة غير صحيحه");

      // validate total
      if (totalProductsSalePrice + shippingGovernorate.price > +total) throw new Error("ادخل الاجمالي بشكل صحيح");
    }

    for (let i = 0; i < orders.length; i++) {
      const {
        client_name, client_phone1,
        client_phone2, client_address,
        shipping_governorate,
        page_name, items, city, note, total
      } = orders[i];

      // check the shipping governorate
      const shippingGovernorate = await PriceList.findOne({ governorate: shipping_governorate });
      if (!shippingGovernorate) throw new Error("من فضلك اختر محافظة شحن");

      let account = {};
      if (req.user.role === "moderator") {
        const mainAccount = await User.findById(req.user.main_account);
        account.marketer = mainAccount._id;
        account.moderator = req.user._id
      } else {
        account.marketer = req.user._id
      }

      // generate unique order id
      const serial_number = generator({ length: 6, isNumeric: true });

      // check if any order contains this serial number
      const checkOrder = await Order.findOne({ serial_number: `sk-${serial_number}` });
      if (checkOrder) throw new Error(`order_at_serial${i}_exists`);

      // get total products sale Price
      let totalProductsSalePrice = 0;

      // update the product quantity and the merchant, marketer wallet
      for (let i = 0; i < items.length; i++) {
        const productData = items[i];
        const product = await Product.findOne({ barcode: productData.barcode });

        // get static values
        const salePrice = product.sale_price;
        const purchasePrice = product.purchase_price;
        const merchant = product.merchant;
        const warehouse = product.warehouse;
        const qty = productData.qty;
        const totalSalePrice = salePrice * qty;
        const totalPurchasePrice = purchasePrice * qty;

        // set static values
        productData.product = product._id;
        productData.merchant = merchant;
        productData.warehouse = warehouse;
        productData.sale_price = salePrice;
        productData.purchase_price = purchasePrice;
        productData.total_sale_price = totalSalePrice;
        productData.total_purchase_price = totalPurchasePrice;

        // update total prudcts sale price
        totalProductsSalePrice += totalSalePrice;

        // init or update the merchant wallet
        const merchantAccount = await MerchantAccount.findOne({ merchant });
        if (merchantAccount) {
          await MerchantAccount.findOneAndUpdate({ merchant }, { $inc: { pending: totalPurchasePrice } });
        } else {
          await new MerchantAccount({ merchant, pending: totalPurchasePrice }).save();
        }

        // update the product qty
        const property = product.properties.find(prop => String(prop._id) === String(productData.property));
        property.value -= qty;
        await product.save();
      }

      // get commission
      const commission = +total - (totalProductsSalePrice + shippingGovernorate.price);

      // init or update the marketer wallet
      const marketerAccount = await MarketerAccount.findOne({ marketer: account.marketer });
      if (marketerAccount) {
        await MarketerAccount.findOneAndUpdate({ marketer: account.marketer }, { $inc: { pending: +commission } });
      } else {
        await new MarketerAccount({ marketer: account.marketer, pending: commission }).save();
      }

      await new Order({
        ...account,
        serial_number: `sk-${serial_number}`,
        client_name,
        client_phone1,
        client_phone2,
        client_address,
        shipping_governorate: shippingGovernorate._id,
        shipping: shippingGovernorate.price,
        city,
        page_name,
        commission,
        items,
        total,
        note,
      }).save();
    }

    res.json({
      success: true,
      data: {}
    });

  }
  catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      errors: [{ 'msg': error?.message || 'something went wrong' }]
    });
  }
}

const createOrder = async (req, res) => {
  try {
    const {
      client_name, client_phone1,
      client_phone2, client_address,
      shipping_governorate, commission,
      page_name, items, city, note, total
    } = req.body;

    // check the order items if it is array or not
    if (typeof items !== "object" || !Array.isArray(items)) throw new Error("الاوردرات غير صحيحة");

    // check if product duplicated or not
    const isProductDuplicates = checkDuplicatProducts(items);
    if (isProductDuplicates) throw new Error("يوجد منتج متكرر");

    // check the commission
    if (!commission || isNaN(commission) || commission < 0) throw new Error("العمولة غير صحيحه");

    // check the shipping governorate
    const shippingGovernorate = await PriceList.findById(shipping_governorate);
    if (!shippingGovernorate) throw new Error("محافظة الشحن مطلوبة");

    // validate order items, properties and quantity
    for (let i = 0; i < items.length; i++) {
      // order product
      const productData = items[i];

      // check if the product ID exists in the Product collection
      const product = await Product.findById(productData.product);
      if (!product) throw new Error("كود المنتج غير صحيح");

      // check if the property key exists in the product's properties array
      const property = product.properties.find(prop => String(prop._id) === String(productData.property));
      if (!property) throw new Error("خاصية المنتج غير صحيحة");

      // check if the quantity is valid
      if (!productData.qty || isNaN(productData.qty)) throw new Error("ادخل العمولة بشكل صحيح");

      // check if the quantity in the property key is valid
      if (+productData.qty > property.value) throw new Error("الكمية غير متاحه");
    }

    let account = {};
    if (req.user.role === "moderator") {
      const mainAccount = await User.findById(req.user.main_account);
      account.marketer = mainAccount._id;
      account.moderator = req.user._id
    } else {
      account.marketer = req.user._id
    }

    // generate unique order id
    const serial_number = generator({ length: 6, isNumeric: true });

    // check if any order contains this serial number
    const checkOrder = await Order.findOne({ serial_number: `sk-${serial_number}` });
    if (checkOrder) throw new Error("كود الطلب موجود بالفعل");

    // update the product quantity and the merchant, marketer wallet
    for (let i = 0; i < items.length; i++) {
      const productData = items[i];
      const product = await Product.findById(productData.product);

      // get static values
      const salePrice = product.sale_price;
      const purchasePrice = product.purchase_price;
      const merchant = product.merchant;
      const warehouse = product.warehouse;
      const qty = productData.qty;
      const totalSalePrice = salePrice * qty;
      const totalPurchasePrice = purchasePrice * qty;

      // set static values
      productData.merchant = merchant;
      productData.warehouse = warehouse;
      productData.sale_price = salePrice;
      productData.purchase_price = purchasePrice;
      productData.total_sale_price = totalSalePrice;
      productData.total_purchase_price = totalPurchasePrice;

      // init or update the merchant wallet
      const merchantAccount = await MerchantAccount.findOne({ merchant });
      if (merchantAccount) {
        await MerchantAccount.findOneAndUpdate({ merchant }, { $inc: { pending: totalPurchasePrice } });
      } else {
        await new MerchantAccount({ merchant, pending: totalPurchasePrice }).save();
      }

      // update the product qty
      const property = product.properties.find(prop => String(prop._id) === String(productData.property));
      property.value -= qty;
      await product.save();
    }

    // init or update the marketer wallet
    const marketerAccount = await MarketerAccount.findOne({ marketer: account.marketer });
    if (marketerAccount) {
      await MarketerAccount.findOneAndUpdate({ marketer: account.marketer }, { $inc: { pending: +commission } });
    } else {
      await new MarketerAccount({ marketer: account.marketer, pending: commission }).save();
    }

    const order = await new Order({
      ...account,
      serial_number: `sk-${serial_number}`,
      client_name,
      client_phone1,
      client_phone2,
      client_address,
      shipping_governorate: shippingGovernorate._id,
      shipping: shippingGovernorate.price,
      city,
      page_name,
      commission,
      items,
      total,
      note,
    }).save();

    res.json({
      success: true,
      data: order
    });

  }
  catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      errors: [{ 'msg': error?.message || 'something went wrong' }]
    });
  }
}

const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const {
      client_name, client_phone1,
      client_phone2, client_address,
      shipping_governorate, commission,
      page_name, items, city, note, total
    } = req.body;

    const oldOrder = await Order.findById(orderId);
    if (!oldOrder) throw new Error("orders.order_doesn't_exists");

    // check the order items if it is array or not
    if (typeof items !== "object" || !Array.isArray(items)) throw new Error("orders.items_must_be_array");

    // check if product duplicated or not
    const isProductDuplicates = checkDuplicatProducts(items);
    if (isProductDuplicates) throw new Error("orders.there_is_product_duplicates");

    // check the commission
    if (!commission || isNaN(commission) || commission < 0) throw new Error("orders.commission_is_not_valid");

    // check the shipping governorate
    const shippingGovernorate = await PriceList.findById(shipping_governorate);
    if (!shippingGovernorate) throw new Error("orders.shipping_governorate_is_required");

    // loop throw the new order to check if there is an product is out of stock or not
    for (let i = 0; i < items.length; i++) {
      const productData = items[i];

      // check if the current item has an effect in the old order
      const oldItem = oldOrder.items.find(el => {
        return String(el.product) === String(productData.product) && String(el.property) === String(productData.property);
      });

      if (oldItem) {
        // get current product
        const product = await Product.findById(oldItem.product);
        if (!product) throw new Error("orders.invalid_product_id");

        // check if the property key exists in the product's properties array
        const property = product.properties.find(prop => String(prop._id) === String(oldItem.property));
        if (!property) throw new Error("orders.invalid_property_key");

        // check if the quantity is valid
        if (!productData.qty || isNaN(productData.qty)) throw new Error("orders.qty_must_be_number_or_greater_than_0");

        // the final quantity after add the old quantity to the current product
        let lastQuantity = property.value + oldItem.qty;
        if (+productData.qty > lastQuantity) throw new Error(`${product.name} لا يحتوي على الكمية الكافية!`);
      } else {
        // check if the product ID exists in the Product collection
        const product = await Product.findById(productData.product);
        if (!product) throw new Error("orders.invalid_product_id");

        // check if the property key exists in the product's properties array
        const property = product.properties.find(prop => String(prop._id) === String(productData.property));
        if (!property) throw new Error("orders.invalid_property_key");

        // check if the quantity is valid
        if (!productData.qty || isNaN(productData.qty)) throw new Error("orders.qty_must_be_number_or_greater_than_0");

        // check if the quantity in the property key is valid
        if (+productData.qty > property.value) throw new Error("orders.quantity_is_not_enough");
      }
    }

    if (oldOrder.key > +req.body.key) throw 'key_not_valid!';
    delete req.body.key;

    // loop through the new items
    for (let i = 0; i < items.length; i++) {
      const productData = items[i];
      const oldItem = oldOrder.items.find(el => String(el.product) === productData.product && String(el.property) === productData.property);
      const product = await Product.findById(productData.product);

      // get static values
      const salePrice = product.sale_price;
      const purchasePrice = product.purchase_price;
      const merchant = product.merchant;
      const warehouse = product.warehouse;
      const qty = productData.qty;
      const totalSalePrice = salePrice * qty;
      const totalPurchasePrice = purchasePrice * qty;

      // set static values
      productData.merchant = merchant;
      productData.warehouse = warehouse;
      productData.sale_price = salePrice;
      productData.purchase_price = purchasePrice;
      productData.total_sale_price = totalSalePrice;
      productData.total_purchase_price = totalPurchasePrice;

      if (oldItem) {
        // update the merchant account
        const merchantAccount = await MerchantAccount.findOne({ merchant: oldItem.merchant });
        await MerchantAccount.findByIdAndUpdate(merchantAccount._id, {
          $inc: { pending: totalPurchasePrice - oldItem.total_purchase_price }
        });

        // update the product qty
        const property = product.properties.find(prop => String(prop._id) === String(productData.property));
        property.value -= oldItem.qty - qty;
        await product.save();
      }
      else {
        // init or update the merchant wallet
        const merchantAccount = await MerchantAccount.findOne({ merchant });
        if (merchantAccount) {
          await MerchantAccount.findOneAndUpdate({ merchant }, { $inc: { pending: totalPurchasePrice } });
        } else {
          await new MerchantAccount({ merchant, pending: totalPurchasePrice }).save();
        }

        // update the product qty
        const property = product.properties.find(prop => String(prop._id) === String(productData.property));
        property.value -= +qty;
        await product.save();
      }
    }

    // loop through the old items to get the deleted items
    for (let i = 0; i < oldOrder.items.length; i++) {
      const oldItem = oldOrder.items[i];
      const existsItem = items.find(item => item.product === String(oldItem.product) && item.property === String(oldItem.property));
      if (!existsItem) {
        const product = await Product.findById(oldItem.product);

        // update the product qty
        const property = product.properties.find(prop => String(prop._id) === String(oldItem.property));
        property.value += oldItem.qty;
        await product.save();

        // update the merchant account
        const merchantAccount = await MerchantAccount.findOne({ merchant: oldItem.merchant });
        await MerchantAccount.findByIdAndUpdate(merchantAccount._id, {
          $inc: { pending: -oldItem.total_purchase_price }
        });
      }
    }

    // update the sales account
    await MarketerAccount.findOneAndUpdate({ marketer: oldOrder.marketer }, {
      $inc: { pending: commission - oldOrder.commission },
    }, { new: true });

    const order = await Order.findByIdAndUpdate(oldOrder._id,
      {
        client_name,
        client_phone1,
        client_phone2,
        client_address,
        shipping_governorate: shippingGovernorate._id,
        shipping: shippingGovernorate.price,
        city,
        page_name,
        commission,
        items,
        total,
        note,
        $inc: { key: 1 },
      },
      { new: true, timestamps: false }
    );

    res.status(200).json({
      success: true,
      data: order
    });
  }
  catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      errors: [{ 'msg': error?.message || 'something went wrong' }]
    });
  }
}


const updateOrdersStatus = async (req, res) => {
  try {
    const { status, holding_to, orders } = req.body;

    // check if the orders are array
    if (typeof orders !== "object" || !Array.isArray(orders)) throw new Error("orders.orders_must_be_array");

    // check if all the objects id are valid
    const checkObjectsIds = await Order.find({ _id: { $in: orders } });
    if (orders.length > checkObjectsIds) throw new Error("orders.orders_contains_invalid_objectId");

    for (let i = 0; i < orders.length; i++) {
      const order = await Order.findById(orders[i]._id);
      const currentOrder = orders[i];
      if (order.key > currentOrder.key) throw new Error("orders.order_status_changed");
    }

    for (let i = 0; i < orders.length; i++) {
      const currentOrder = orders[i];

      const order = await Order.findByIdAndUpdate(
        currentOrder._id,
        {
          holding_to,
          status,
          $inc: { key: 1 },
          $push: { actions: { admin: req.user._id, status } },
        },
        { new: true, runValidators: true }
      );
      await handleOrderStatus(order);
    }

    res.json({
      success: true,
      data: {}
    });
  }
  catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      errors: [{ 'msg': error?.message || 'something went wrong' }]
    });
  }
}

const updateOrderShippingCompany = async (req, res) => {
  try {
    const { orders, shipping_company } = req.body;

    for (let i = 0; i < orders.length; i++) {
      const currentOrders = orders[i];

      await Order.findByIdAndUpdate(
        currentOrders._id,
        {
          shipping_company,
          $inc: { key: 1 }
        },
        { new: true, timestamps: false }
      );
    }

    res.json({
      success: true,
      data: {}
    });
  }
  catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      errors: [{ 'msg': 'something went wrong' }]
    });
  }
}

const createOrderNote = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { $push: { replies: req.body } },
      { new: true, timestamps: false }
    ).populate({
      path: 'marketer moderator replies.sender actions.admin',
      model: 'User',
    }).populate({
      path: 'shipping_governorate',
      model: 'PriceList',
    }).populate({
      path: 'shipping_company',
      model: 'ShippingCompany',
    }).populate({
      path: 'items.product',
      model: 'Product'
    });

    const senderId = req.body.sender;
    const user = await User.findOne({ _id: senderId });
    if (user?.role === "marketer" || user?.role === "moderator") {
      await new Notification({
        type: "order_note",
        order: order?._id,
        content: `لديك رساله في ملاحظات الطلب رقم (${order?.serial_number})`,
        for: "admin",
        who: []
      }).save();
    } else if (user?.role === "admin") {
      if (order.moderator) {
        await new Notification({
          type: "order_note",
          order: order?._id,
          content: `لديك رساله في ملاحظات الطلب رقم (${order?.serial_number})`,
          for: "moderator",
          who: [order.moderator?._id]
        }).save();
      } else {
        await new Notification({
          type: "order_note",
          order: order?._id,
          content: `لديك رساله في ملاحظات الطلب رقم (${order?.serial_number})`,
          for: "marketer",
          who: [order.marketer?._id]
        }).save();
      }
    }

    res.json({
      success: true,
      data: order
    });
  }
  catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      errors: [{ 'msg': 'something went wrong' }]
    });
  }
}

const handleOrderStatus = async (order) => {
  // handle each order status
  if (order.status === "preparing") {
    const items = order.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const merchant = item.merchant;
      const totalPurchasePrice = item.total_purchase_price;

      await MerchantAccount.findOneAndUpdate({ merchant }, {
        $inc: { pending: -totalPurchasePrice, preparing: totalPurchasePrice },
      });
    }
    await MarketerAccount.findOneAndUpdate({ marketer: order.marketer }, {
      $inc: { pending: -order.commission, preparing: order.commission },
    });
  }

  else if (order.status === "declined1") {
    const items = order.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const merchant = item.merchant;
      await Product.findOneAndUpdate({ 'properties._id': items[i].property }, {
        $inc: { 'properties.$.value': item.qty }
      }, { new: true });
      const totalPurchasePrice = item.total_purchase_price;
      await MerchantAccount.findOneAndUpdate({ merchant }, {
        $inc: { pending: -totalPurchasePrice },
      });
    }
    await MarketerAccount.findOneAndUpdate({ marketer: order.marketer }, {
      $inc: { pending: -order.commission },
    });
  }

  else if (order.status === "shipped") {
    const items = order.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const merchant = item.merchant;
      const totalPurchasePrice = item.total_purchase_price;
      await MerchantAccount.findOneAndUpdate({ merchant }, {
        $inc: { preparing: -totalPurchasePrice, shipped: totalPurchasePrice },
      });
    }
    await MarketerAccount.findOneAndUpdate({ marketer: order.marketer }, {
      $inc: { preparing: -order.commission, shipped: order.commission },
    });
  }

  else if (order.status === "skip") {
    const items = order.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const merchant = item.merchant;
      const totalPurchasePrice = item.total_purchase_price;
      await MerchantAccount.findOneAndUpdate({ merchant }, {
        $inc: { shipped: -totalPurchasePrice },
      });
    }
    await MarketerAccount.findOneAndUpdate({ marketer: order.marketer }, {
      $inc: { shipped: -order.commission },
    });
  }

  else if (order.status === "returned1") {
    const items = order.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await Product.findOneAndUpdate({ 'properties._id': item.property }, {
        $inc: { 'properties.$.value': item.qty }
      }, { new: true });
    }
  }

  else if (order.status === "declined2") {
    const items = order.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const merchant = item.merchant;
      await Product.findOneAndUpdate({ 'properties._id': item.property }, {
        $inc: { 'properties.$.value': item.qty }
      }, { new: true });
      const totalPurchasePrice = item.total_purchase_price;
      await MerchantAccount.findOneAndUpdate({ merchant }, {
        $inc: { preparing: -totalPurchasePrice },
      });
    }
    await MarketerAccount.findOneAndUpdate({ marketer: order.marketer }, {
      $inc: { preparing: -order.commission },
    });
  }

  else if (order.status === "available") {
    const items = order.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const merchant = item.merchant;
      const totalPurchasePrice = item.total_purchase_price;
      await MerchantAccount.findOneAndUpdate({ merchant }, {
        $inc: { shipped: -totalPurchasePrice, available: totalPurchasePrice },
      });
    }
    await MarketerAccount.findOneAndUpdate({ marketer: order.marketer }, {
      $inc: { shipped: -order.commission, available: order.commission },
    });
  }

  else if (order.status === "ask_to_return") {
    const items = order.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const merchant = item.merchant;
      const totalPurchasePrice = item.total_purchase_price;
      await MerchantAccount.findOneAndUpdate({ merchant }, {
        $inc: { available: -totalPurchasePrice, returned: totalPurchasePrice },
      });
    }
    await MarketerAccount.findOneAndUpdate({ marketer: order.marketer }, {
      $inc: { available: -order.commission, returned: order.commission },
    });
  }

  else if (order.status === "returned2") {
    const items = order.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await Product.findOneAndUpdate({ 'properties._id': item.property }, {
        $inc: { 'properties.$.value': item.qty }
      }, { new: true });
    }
  }

  if (order.moderator) {
    await new Notification({
      type: "order_status",
      order: order?._id,
      content: `تم تغير حالة طلبك رقم (${order?.serial_number}) الي ${order.status}`,
      for: "moderator",
      who: [order.moderator?._id]
    }).save();
  } else {
    await new Notification({
      type: "order_status",
      order: order?._id,
      content: `تم تغير حالة طلبك رقم (${order?.serial_number}) الي ${order.status}`,
      for: "marketer",
      who: [order.marketer?._id]
    }).save();
  }
}

const checkDuplicateOrder = async (req, res) => {
  try {
    const { client_name, client_phone1, items } = req.body;
    const existingOrders = await Order.find({
      $or: [{ status: "pending" }, { status: "shipped" }, { status: "available" }, { status: "preparing" }],
      client_phone1,
      client_name
    });

    const existingOrder = existingOrders.find(order => {
      return order.items.length === items.length && order.items.every((item, index) => {
        return String(item.product) === String(items[index].product) && String(item.property) === String(items[index].property);
      });
    });

    if (existingOrder) return res.json({ exists: true });

    res.json({ exists: false });
  } catch (error) {
    res.status(400).json({
      success: false,
      errors: [{ 'msg': 'something went wrong' }]
    });
  }
}

const getNextOrder = async (req, res) => {
  try {
    const date = req.params.date;
    const order = await Order.findOne({ status: "pending", created_at: { $gt: date } });
    res.json({ order });
  } catch (error) {
    res.status(400).json({
      success: false,
      errors: [{ 'msg': 'something went wrong' }]
    });
  }
}

const updatedOrderCallAction = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    let message;

    if (req.body.action_name === "whats1_clicked") {
      message = `تم التواصل مع العميل عن طريق الواتساب`;
    } else if (req.body.action_name === "whats2_clicked") {
      message = `تم التواصل مع العميل عن طريق رقم الهاتف الثاني`;
    } else if (req.body.action_name === "sms1_clicked") {
      message = `تم التواصل مع العميل عن طريق رسالة sms لانه لم يرد على الواتساب`;
    } else if (req.body.action_name === "sms2_clicked") {
      message = `تم التواصل مع العميل عن طريق sms على رقم الهاتف الثاني`;
    }

    if (message) {
      await Order.findByIdAndUpdate(
        orderId,
        {
          $inc: {
            [req.body.action_name]: 1,
            key: 1
          },
          $push: { replies: { sender: req.user._id, body: message } }
        }, { new: true, timestamps: false });
    } else {
      await Order.findByIdAndUpdate(
        orderId,
        { $inc: { [req.body.action_name]: 1, key: 1 } }, { new: true, timestamps: false });
    }

    res.json({});
  } catch (error) {
    res.status(400).json({
      success: false,
      errors: [{ 'msg': 'something went wrong' }]
    });
  }
}

module.exports = {
  getOrders,
  createOrder,
  createOrders,
  updateOrder,
  updateOrdersStatus,
  updateOrderShippingCompany,
  createOrderNote,
  checkDuplicateOrder,
  getNextOrder,
  updatedOrderCallAction
}