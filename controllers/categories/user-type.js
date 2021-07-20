const multer = require('multer');
const sharp = require('sharp');
const Categories = require('../../models/categories/user-type');
const catchAsyncFunc = require('../../utils/catchAsyncFuncs');
const APIresourceFunc = require('../../utils/APIresourceFunc');
const AppError = require('../../utils/appError');
const factory = require('./../handleFactory');

exports.createUsertype = catchAsyncFunc(async (req, res, next) => {
  let data;
  if (req.body._id != null || req.body._id != undefined) {
    data = await Categories.findByIdAndUpdate({ _id: req.body.id }, req.body, {
      new: true,
      runValidators: true
    });
  } else {
    data = await Categories.create(req.body);
  }

  res.status(201).send({
    status: 'success',
    data
  });
});

exports.getAllUsertypes = catchAsyncFunc(async (req, res, next) => {
  let filter = { active: true };
  const categoriees = new APIresourceFunc(Categories.find(filter), req.query)
    .AdvancedFilter()
    .sort()
    .fieldSort()
    .paginate();

  const data = await categoriees.query;
  // console.log(data);
  res.status(200).send({
    status: 'Success',
    results: data.length,
    data
  });
});

exports.getOneUsertype = factory.getOne(Categories);

exports.updateUsertype = factory.updateOne(Categories);

exports.deleteUsertype = factory.deleteOne(Categories);
