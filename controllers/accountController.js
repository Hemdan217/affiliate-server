const { MerchantAccount, MarketerAccount, Account } = require('../models/AccountModel');
const paginate = require('../utils/paginate');

const getAccounts = async (req, res) => {
  try {
    let { page = 1, size = 10, query, filter } = req.query;
    const filterQ = filter ? JSON.parse(filter) : {};
    let data;

    if (req.user.role === "merchant") {
      filterQ.merchant = req.user._id;
      filter = JSON.stringify(filterQ);
      data = await paginate(MerchantAccount, page, size, query, filter);
      await MerchantAccount.populate(data.data, { path: 'merchant', model: 'User' });
    } else if (req.user.role === "marketer") {
      filterQ.marketer = req.user._id;
      filter = JSON.stringify(filterQ);
      data = await paginate(MarketerAccount, page, size, query, filter);
      await MarketerAccount.populate(data.data, { path: 'marketer', model: 'User' });
    } else if (req.user.role === "admin") {
      if (filterQ.role === "marketer") {
        data = await paginate(MarketerAccount, page, size, query, filter);
        await MarketerAccount.populate(data.data, { path: 'marketer', model: 'User' });
        const pendingBalance = await MarketerAccount.aggregate([{
          $group: { _id: null, total: { $sum: '$pending' } }
        }]);
        const preparingBalance = await MarketerAccount.aggregate([{
          $group: { _id: null, total: { $sum: '$preparing' } }
        }]);
        const shippedBalance = await MarketerAccount.aggregate([{
          $group: { _id: null, total: { $sum: '$shipped' } }
        }]);
        const availableBalance = await MarketerAccount.aggregate([{
          $group: { _id: null, total: { $sum: '$available' } }
        }]);
        data.pendingBalance = pendingBalance[0]?.total || 0;
        data.preparingBalance = preparingBalance[0]?.total || 0;
        data.shippedBalance = shippedBalance[0]?.total || 0;
        data.availableBalance = availableBalance[0]?.total || 0;
      } else if (filterQ.role === "merchant") {
        data = await paginate(MerchantAccount, page, size, query, filter);
        await MerchantAccount.populate(data.data, { path: 'merchant', model: 'User' });
        const pendingBalance = await MerchantAccount.aggregate([{
          $group: { _id: null, total: { $sum: '$pending' } }
        }]);
        const preparingBalance = await MerchantAccount.aggregate([{
          $group: { _id: null, total: { $sum: '$preparing' } }
        }]);
        const shippedBalance = await MerchantAccount.aggregate([{
          $group: { _id: null, total: { $sum: '$shipped' } }
        }]);
        const availableBalance = await MerchantAccount.aggregate([{
          $group: { _id: null, total: { $sum: '$available' } }
        }]);
        data.pendingBalance = pendingBalance[0]?.total || 0;
        data.preparingBalance = preparingBalance[0]?.total || 0;
        data.shippedBalance = shippedBalance[0]?.total || 0;
        data.availableBalance = availableBalance[0]?.total || 0;
      }
    }

    res.json(data);
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
  getAccounts,
}