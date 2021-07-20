const multer = require('multer');
const sharp = require('sharp');
const Sectors = require('../../models/sectors');
const catchAsyncFunc = require('../../utils/catchAsyncFuncs');
const AppError = require('../../utils/appError');
const factory = require('./../handleFactory');
const APIresourceFunc = require('../../utils/APIresourceFunc');
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  //  console.log(file);
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('File not an image', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
exports.uploadIcon = upload.single('icon');

const removeSpace = item => {
  return item.replace(/\s/g, '-');
};
exports.resizeIcon = catchAsyncFunc(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `tax-${removeSpace(req.body.label)}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(200, 200)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/sectors/${req.file.filename}`);

  next();
});

exports.createSector = catchAsyncFunc(async (req, res, next) => {
  // console.log(req.body);
  if (req.body._id) {
    if (req.body.parent) {
      let parent = [];
      req.body.parent.map(item => {
        if (item.value) {
          parent.push(item.value);
        } else {
          parent.push(item._id);
        }

        if (parent.length === req.body.parent.length) {
          req.body.parent = parent;
        }
      });
    }

    const doc = await Sectors.findByIdAndUpdate(req.body._id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('There is no document with that id', 404));
    }

    res.status(200).send({
      status: 'Success',
      data: doc
    });
  } else {
    // console.log(req.body);

    if (req.body.parent) {
      let parent = [];
      req.body.parent.map(item => {
        if (item.value) {
          parent.push(item.value);
        } else {
          parent.push(item._id);
        }

        if (parent.length === req.body.parent.length) {
          req.body.parent = parent;
        }
      });
    }

    let sector = await Sectors.create(req.body);

    data = await Sectors.findById(sector._id).populate({
      path: 'parent',
      select: 'name _id'
    });
    // console.log(data);
    res.status(201).send({
      status: 'success',
      data
    });
  }
});

exports.getAllSectors = catchAsyncFunc(async (req, res, next) => {
  let filter = {};
  const tax_terms = new APIresourceFunc(Sectors.find(filter), req.query)
    .AdvancedFilter()
    .sort()
    .fieldSort();
  // .paginate();

  const data = await tax_terms.query
    .populate({
      path: 'parent',
      select: 'name _id'
    })
    .populate({
      path: 'business_types',
      select: 'name _id'
    });
  // console.log(data);
  res.status(200).send({
    status: 'Success',
    results: data.length,
    data
  });
});

exports.getOneSector = catchAsyncFunc(async (req, res, next) => {
  query = Sectors.findById(req.params.id).populate({
    path: 'parent',
    select: 'name _id'
  });

  const data = await query;
  if (!data) {
    return next(new AppError('There is no dataument with that id', 404));
  }
  res.status(200).send({
    status: 'Success',
    data
  });
});

exports.updateSector = catchAsyncFunc(async (req, res, next) => {
  const doc = await Sectors.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!doc) {
    return next(new AppError('There is no document with that id', 404));
  }

  res.status(200).send({
    status: 'Success',
    data: doc
  });
});

exports.deleteSector = factory.deleteOne(Sectors);
