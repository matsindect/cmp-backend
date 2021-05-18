const User = require('../models/userModel');
const APIresourceFunc = require('../utils/APIresourceFunc');
const catchAsyncFunc = require('../utils/catchAsyncFuncs');
const AppError = require('../utils/appError');

const filterInputObj = (obj, ...allowedFields) => {
  const newInputsObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newInputsObj[el] = obj[el];
  });
  return newInputsObj;
};
exports.createUser = catchAsyncFunc(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(201).send({
    status: 'success',
    data: {
      user: newUser
    }
  });
});

exports.updateCurrentUser = catchAsyncFunc(async (req, res, next) => {
  // User cannot update password
  if (req.body.password || req.body.confirmpassword) {
    return next(
      new AppError('You cannot update password using this route', 400)
    );
  }
  // update user document
  const filteredInputsBody = filterInputObj(
    req.body,
    'user_firstname',
    'user_lastname',
    'user_email_address'
  );
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filteredInputsBody,
    { new: true, runValidators: true }
  );
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteCurrentUser = catchAsyncFunc(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { is_active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});
exports.getUsers = catchAsyncFunc(async (req, res, next) => {
  //EXECUTE A QUERY
  const apiHelpers = new APIresourceFunc(User.find(), req.query)
    .AdvancedFilter()
    .sort()
    .fieldSort()
    .paginate();

  const users = await apiHelpers.query.populate({
    path: 'business_types',
    select: 'name '
  });

  res.status(200).send({
    status: 'Success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.getUser = catchAsyncFunc(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  // const user = await User.findOne({user_name: req.params.user_name});
  if (!user) {
    return next(new AppError('There isno user with that id', 404));
  }
  res.status(200).send({
    status: 'Success',
    data: {
      user
    }
  });
});

exports.deleteUser = catchAsyncFunc(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  // const user = await User.findOneAndDelete({user_name: req.params.user_name});
  if (!user) {
    return next(new AppError('There isno user with that id', 404));
  }
  res.status(204).send({
    status: 'Success',
    data: null
  });
});

exports.updateUser = catchAsyncFunc(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new AppError('There isno user with that id', 404));
  }
  // const user = await User.findOne({user_name: req.params.user_name});
  res.status(200).send({
    status: 'Success',
    data: {
      user
    }
  });
});
