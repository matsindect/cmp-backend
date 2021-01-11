const APIresourceFunc = require('../../utils/APIresourceFunc');
const catchAsyncFunc = require('../../utils/catchAsyncFuncs');
const AppError = require('../../utils/appError');
const Profile = require('./../../models/profile');
const Product = require('./../../models/products');
const Sector = require('./../../models/sectors');
const User = require('./../../models/userModel');
const slugify = require('slugify');
const factory = require('./../handleFactory');

exports.createProfile = catchAsyncFunc(async (req, res, next) => {
  //Get fields
  const profileFields = {};
  profileFields.user = req.user.id;
  if (req.body.name) profileFields.company.name = req.body.name;
  if (req.body.number) profileFields.company.number = req.body.number;
  if (req.body.about) profileFields.company.about = req.body.about;
  if (req.body.location) profileFields.company.location = req.body.location;
  if (req.body.address) profileFields.company.address = req.body.address;
  if (req.body.tel) profileFields.company.tel = req.body.tel;
  if (req.body.fax) profileFields.company.fax = req.body.fax;
  if (req.body.website) profileFields.company.website = req.body.website;
  if (req.body.email) profileFields.company.email = req.body.email;
  if (req.body.businesstype)
    profileFields.company.businesstype = req.body.businesstype;
  if (req.body.logo) profileFields.company.logo = req.body.logo;
  if (req.body.license) profileFields.company.license = req.body.license;
  if (req.body.email) profileFields.company.email = req.body.email;

  //social
  profileFields.social = {};
  if (req.body.youtube) profileFields.youtube = req.body.youtube;
  if (req.body.twitter) profileFields.twitter = req.body.twitter;
  if (req.body.facebook) profileFields.facebook = req.body.facebook;
  if (req.body.linkedin) profileFields.linkedin = req.body.linkedin;
  if (req.body.instagram) profileFields.instagram = req.body.instagram;

  let profile = await Profile.findOne({ user: req.user.id });
  if (profile) {
    //Update
    let doc = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: profileFields },
      { new: true }
    );

    res.status(200).send({
      status: 'Success',
      data: {
        doc
      }
    });
  } else {
    //Create
    let profile = await Profile.findOne({ slug: profileFields.slug });
    if (profile) {
      return next(new AppError('Company name already taken', 400));
    }

    //save Profile
    const doc = new Profile(profileFields);
    await doc.save();

    res.status(200).send({
      status: 'Success',
      data: {
        doc
      }
    });
  }
});

exports.postProducts = catchAsyncFunc(async (req, res, next) => {
  const product = await Product.create(req.body.product);
  const profile = await Profile.findOne({ user: req.user.id });
  if (product && profile) {
    profile.products.push(product._id);
    await profile.save();
  }
  res.status(200).send({
    status: 'Success',
    product: profile.products
  });
});

exports.getProfileProducts = catchAsyncFunc(async (req, res, next) => {
  const profile = await Profile.findOne({ user: req.user.id });
  if (!profile) return next(new AppError('Profile n ot found', 404));
  res.status(200).send({
    status: 'Success',
    product: profile.products
  });
});

exports.deleteProduct = catchAsyncFunc(async (req, res, next) => {
  let profile = await Profile.findOne({ user: req.user.id });
  if (!profile) {
    return next(new AppError('profile does not exist', 404));
  }
  // Delete the product
  const removeIndex = profile.products
    .map(product => product)
    .indexOf(req.params.product_id);
  //splice out of array
  profile.products.splice(removeIndex, 1);
  //save
  await profile.save();
  res.status(200).send({
    status: 'Success',
    data: {
      products: profile.products
    }
  });
});

exports.postSectors = catchAsyncFunc(async (req, res, next) => {
  const sector = await Sector.create(req.body.sector);
  const profile = await Profile.findOne({ user: req.user.id });
  if (sector && profile) {
    profile.sectors.push(sector._id);
    await profile.save();
  }
  res.status(200).send({
    status: 'Success',
    sectors: profile.sectors
  });
});

exports.getProfileSectors = catchAsyncFunc(async (req, res, next) => {
  const profile = await Profile.findOne({ user: req.user.id });
  if (!profile) return next(new AppError('Profile n ot found', 404));
  res.status(200).send({
    status: 'Success',
    sectors: profile.sectors
  });
});

exports.deleteSector = catchAsyncFunc(async (req, res, next) => {
  let profile = await Profile.findOne({ user: req.user.id });
  if (!profile) {
    return next(new AppError('profile does not exist', 404));
  }
  // Delete the sector
  const removeIndex = profile.sectors
    .map(sector => sector)
    .indexOf(req.params.sector_id);
  //splice out of array
  profile.sectors.splice(removeIndex, 1);
  //save
  await profile.save();
  res.status(200).send({
    status: 'Success',
    data: {
      sectors: profile.sectors
    }
  });
});

exports.getAllProfiles = factory.getAll(Profile);

exports.getProfile = catchAsyncFunc(async (req, res, next) => {
  let data = await Profile.findById(req.params.id)
    .populate('sectors')
    .populate('business_type')
    .populated('categories')
    .populate('services')
    .populate('city')
    .populate('country');

  if (!data) {
    return next(new AppError('There is no dataument with that id', 404));
  }
  res.status(200).send({
    status: 'Success',
    data
  });
});

//@route    Delete api/v1/profile/
//@desc     Delete user and profile
//@access   Private

exports.deleteProfile = catchAsyncFunc(async (req, res, next) => {
  await Profile.findOneAndRemove({ user: req.user.id });
  await User.findByIdAndRemove({ _id: req.user.id });
  res.json({ success: true });
});
