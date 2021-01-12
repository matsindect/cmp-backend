const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
let SALT_WORK_FACTOR = 12;

const userSchema = new mongoose.Schema({
  password: {
    type: String,
    required: [true, 'User password is required'],
    select: false,
    minlength: 8
  },
  confirmpassword: {
    type: String,
    required: [true, 'User Confirm password is required'],
    select: false,
    minlength: 8,
    validate: {
      // this kind of validation only works for create and save
      validator: function(pwd) {
        return pwd === this.password;
      },
      message: 'Passwords do not match'
    }
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'customer', 'store-manager', 'accounts-admin'],
    default: 'user'
  },
  user_passwordChangedAt: Date,

  data: {
    email: {
      type: String,
      required: [true, 'Email address is requred'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please enter a valid email']
    },
    displayName: {
      type: String,
      required: [true, 'Username is required'],
      unique: true
    },
    photoURL: {
      type: String,
      default: 'assets/images/avatars/Abbott.jpg'
    },
    settings: {
      layout: {
        style: {
          type: String
        },
        config: {
          scroll: { type: String },
          navbar: {
            display: { type: Boolean, default: true },
            folded: { type: Boolean, default: true },
            position: { type: String }
          },
          toolbar: {
            display: { type: Boolean, default: true },
            style: { type: String },
            position: { type: String }
          },
          footer: {
            display: { type: Boolean, default: true },
            style: { type: String },
            position: { type: String }
          },
          mode: { type: String }
        }
      },
      customScrollbars: { type: Boolean, default: true },
      theme: {
        main: { type: String },
        navbar: { type: String },
        toolbar: { type: String },
        footer: { type: String }
      }
    }
  },
  shortcuts: [String],
  date_created: {
    type: Date,
    required: [true, 'Date is neccessary'],
    default: Date.now()
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpire: {
    type: Date,
    select: false
  },
  is_active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      user.confirmpassword = undefined;
      next();
    });
  });
});

userSchema.pre(/^find/, function(next) {
  this.find({ is_active: { $ne: false } });
  next();
});
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.user_passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.comparePassword = async function(
  recievedPassword,
  userPassword
) {
  return await bcrypt.compare(recievedPassword, userPassword);
};

userSchema.methods.passwordChanged = function(JWTTimestamp) {
  if (this.user_passwordChangedAt) {
    const changeTimestamp = parseInt(
      this.user_passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changeTimestamp;
  }
  return false;
};

userSchema.methods.creatUserResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
