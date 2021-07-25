const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsyncFunc = require('./../utils/catchAsyncFuncs');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/emailHandler');

const signtoken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const handshakeToken = (user, statusCode, res) => {
  const token = signtoken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  user.password = undefined;
  // res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).send({
    status: 'success',
    access_token: token,
    user
  });
};

exports.signup = catchAsyncFunc(async (req, res, next) => {
  // console.log(req.body);
  const user = {
    password: req.body.password,
    role: req.body.role ? req.body.role : 'admin',
    confirmpassword: req.body.password,
    data: {
      displayName: req.body.displayName,
      photoURL: 'assets/images/avatars/Abbott.jpg',
      email: req.body.email,
      settings: {
        layout: {
          style: 'layout1',
          config: {
            footer: { display: true, style: 'fixed', position: 'below' },
            navbar: { display: true, folded: true, position: 'left' },
            scroll: 'content',
            toolbar: { display: true, style: 'fixed', position: 'below' }
          }
        },
        customScrollbars: true,
        direction: 'ltr',
        theme: {
          main: 'default',
          navbar: 'greyDark',
          toolbar: 'mainThemeLight',
          footer: 'mainThemeDark'
        }
      },
      shortcuts: []
    }
  };
  const newUser = await User.create(user);
  handshakeToken(newUser, 201, res);
});

exports.login = catchAsyncFunc(async (req, res, next) => {
  const { email, password } = req.body.data;

  if (!email || !password) {
    next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ 'data.email': email })
    .select('+password')
    .populate({
      path: 'business_types',
      select: 'name _id'
    });

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError('Incorrect Password or Email', 401));
  }

  handshakeToken(user, 200, res);
});

exports.protect = catchAsyncFunc(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are nopt logged in, Please login to get access', 401)
    );
  }

  const decodedtoken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // Check if user still exist
  const currentUser = await User.findById(decodedtoken.id).populate({
    path: 'business_types',
    select: 'name '
  });
  // console.log(currentUser);
  if (!currentUser) {
    return new AppError(
      'User no longer exists, Please signup and get new token',
      401
    );
  }

  if (currentUser.passwordChanged(decodedtoken.iat)) {
    return new AppError('Password chande, Please login aagain', 401);
  }

  req.user = currentUser;
  next();
});

exports.verifyToken = catchAsyncFunc(async (req, res, next) => {
  const access_token = req.params.token;
  // console.log(access_token);

  const decodedtoken = await promisify(jwt.verify)(
    access_token,
    process.env.JWT_SECRET
  );

  // Check if user still exist
  const currentUser = await User.findById(decodedtoken.id).populate({
    path: 'business_types',
    select: 'name '
  });

  const updatedAccessToken = signtoken(decodedtoken.id);
  // return [200, response];
  res.status(200).send({
    status: 'success',
    access_token: updatedAccessToken,
    user: currentUser
  });
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return new AppError('You are not allowed to perform this action', 403);
    }
    next();
  };
};

exports.fogortPassword = catchAsyncFunc(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email
  });
  if (!user) {
    return next(new AppError('User email address not found', 404));
  }

  const resetToken = user.creatUserResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `Forgot your password? Submit a patch request ursing the link provided and confirm password using:${resetUrl}`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: 'You have only 10min to use reset link',
      message
    });

    res.status(200).json({
      success: 'success',
      message: 'Token sent to email'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending email', 500));
  }
});
exports.resetPassword = catchAsyncFunc(async (req, res, next) => {
  // Get user by token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gte: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token has expired or is invalid', 401));
  }

  user.password = req.body.password;
  user.confirmpassword = req.body.confirmpassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();

  handshakeToken(user, 201, res);
});

exports.updatePassword = catchAsyncFunc(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (
    !(await user.comparePassword(req.body.user_Currentpassword, user.password))
  ) {
    return next(new AppError('Your current password is wrong', 401));
  }

  user.password = req.body.password;
  user.confirmpassword = req.body.confirmpassword;

  await user.save();

  handshakeToken(user, 201, res);
});
