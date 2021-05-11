const catchAsyncFunc = require('../../utils/catchAsyncFuncs');
const AppError = require('../../utils/appError');
const factory = require('./../handleFactory');
const data = require('./mock-analytics');

exports.getAnalytics = catchAsyncFunc(async (req, res, next) => {
  //   console.log(data.analytics.widgets);
  res.status(200).json({
    status: 'success',
    results: data.length,
    data: data.analytics.widgets
  });
});
