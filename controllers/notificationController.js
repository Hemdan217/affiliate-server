const Notification = require('../models/NotificationModel');

const getNotifications = async (req, res) => {
  let { page = 1, size = 100, filter } = req.query;

  const filterQuery = filter ? JSON.parse(filter) : {};
  if (req.user.role === "marketer") {
    filterQuery["for"] = "marketer";
    filterQuery["who"] = { $in: [req.user._id] };
  } else if (req.user.role === "moderator") {
    filterQuery["for"] = "moderator";
    filterQuery["who"] = { $in: [req.user._id] };
  } else if (req.user.role === "merchant") {
    filterQuery["for"] = "merchant";
    filterQuery["who"] = { $in: [req.user._id] };
  } else if (req.user.role === "admin") {
    filterQuery["for"] = "admin";
  }

  try {
    const itemsCount = await Notification.countDocuments({ ...filterQuery });
    const isNotRead = await Notification.countDocuments({ ...filterQuery, is_read: false })
    let data = await Notification.find({ ...filterQuery })
      .limit(size)
      .skip((page - 1) * size)
      .sort('is_read')
      .populate({
        path: 'who',
        model: 'User',
      }).populate({
        path: 'product',
        model: 'Product',
      }).populate({
        path: 'order',
        model: 'Order',
        populate: [{
          path: 'marketer moderator replies.sender actions.admin',
          model: 'User',
        },
        {
          path: 'shipping_governorate',
          model: 'PriceList',
        },
        {
          path: 'shipping_company',
          model: 'ShippingCompany',
        },
        {
          path: 'items.product',
          model: 'Product'
        }]
      });

    res.json({
      success: true,
      itemsCount,
      isNotRead,
      pages: Math.ceil(itemsCount / size),
      data
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

const updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      req.body,
      { new: true }
    ).populate({
      path: "product",
      model: "Product"
    }).populate({
      path: "who",
      model: "User"
    }).populate({
      path: 'order',
      model: 'Order',
      populate: [{
        path: 'marketer moderator replies.sender actions.admin',
        model: 'User',
      },
      {
        path: 'shipping_governorate',
        model: 'PriceList',
      },
      {
        path: 'shipping_company',
        model: 'ShippingCompany',
      },
      {
        path: 'items.product',
        model: 'Product'
      }]
    });

    res.json({
      success: true,
      data: notification
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

const updateNotifications = async (req, res) => {
  try {
    const user = req.user;
    if (user.role === "admin") {
      await Notification.updateMany({ for: "admin" }, { is_read: true });
    } else if (user.role === "marketer") {
      await Notification.updateMany({ for: "marketer", who: { $in: [user._id] } }, { is_read: true });
    } else if (user.role === "moderator") {
      await Notification.updateMany({ for: "moderator", who: { $in: [user._id] } }, { is_read: true });
    } else if (user.role === "merchant") {
      await Notification.updateMany({ for: "merchant", who: { $in: [user._id] } }, { is_read: true });
    }

    res.json({
      success: true
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

module.exports = {
  getNotifications,
  updateNotification,
  updateNotifications
}