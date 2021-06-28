const APIresourceFunc = require('../../utils/APIresourceFunc');
const catchAsyncFunc = require('../../utils/catchAsyncFuncs');
const AppError = require('../../utils/appError');
const Navigation = require('./../../models/navigations');
const factory = require('../handleFactory');
const slugify = require('slugify');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  //  console.log(file);
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('File not an image', 400), false);
  }
};
const removeSpace = item => {
  return item.replace(/\s/g, '-');
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
  { name: 'navigations_catalogue', maxCount: 1 },
  { name: 'images', maxCount: 5 }
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.processImages = catchAsyncFunc(async (req, res, next) => {
  if (!req.files.navigations_catalogue || !req.files.images) return next();

  // 1) Cover image
  req.body.navigations_catalogue = `navigation-${req.params.id
    }-${Date.now()}-cover.jpeg`;
  await sharp(req.files.navigations_catalogue[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/navigations/${req.body.navigations_catalogue}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `public/img/tours/tour-${req.params.id
        }-${Date.now()}-${i + 1}.jpeg`;
      var img = {
        url: filename
      };
      await sharp(file.buffer)
        .resize(200, 200)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

exports.createNavigation = catchAsyncFunc(async (req, res, next) => {
  const navigationFields = {};

  if (req.body.navItem) navigationFields.navItem = req.body.navItem;
  if (req.body.navItem)
    navigationFields.slug = slugify(req.body.navItem, {
      replacement: '-',
      remove: /[*+~.()'"!:@]/g,
      lower: true
    });
  if (req.body.subLinks) navigationFields.subLinks = req.body.subLinks;

  let navigations = await Navigation.findOne({ _id: req.body._id });

  if (navigations) {
    let data = await Navigation.findByIdAndUpdate(
      req.body._id,
      { $set: navigationFields },
      { new: true }
    );
    res.status(200).send({
      status: 'Success',
      data
    });
  } else {
    const newNavigation = new Navigation(navigationFields);
    await newNavigation.save();
    res.status(200).send({
      status: 'Success',
      data: {
        newNavigation
      }
    });
  }
});

exports.getAllNavigations = catchAsyncFunc(async (req, res, next) => {
  let query = Navigation.find();

  const data = await query
    .populate({
      path: 'sectors',
      select: 'name _id'
    })
    .populate({
      path: 'business_types',
      select: 'name _id'
    })
    .populate({
      path: 'navigation_categories',
      select: 'name _id'
    })
    .populate({
      path: 'categories',
      select: 'name _id'
    })
    .populate({
      path: 'navigation_attributes'
    });

  if (!data) {
    return next(new AppError('There is no dataument with that id', 404));
  }
  res.status(200).send({
    status: 'Success',
    data
  });
});

exports.getOneNavigation = catchAsyncFunc(async (req, res, next) => {
  let query = Navigation.findById(req.params.id);

  const data = await query
    .populate({
      path: 'sectors',
      select: 'name _id'
    })
    .populate({
      path: 'business_types',
      select: 'name _id'
    })
    .populate({
      path: 'navigation_categories',
      select: 'name _id'
    })
    .populate({
      path: 'categories',
      select: 'name _id'
    })
    .populate({
      path: 'navigation_attributes'
    });
  if (!data) {
    return next(new AppError('There is no dataument with that id', 404));
  }
  res.status(200).send({
    status: 'Success',
    data
  });
});

exports.delleteNavigation = factory.deleteOne(Navigation);
