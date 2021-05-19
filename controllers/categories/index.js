const multer = require('multer');
const sharp = require('sharp');
const Categories = require('../../models/categories');
const catchAsyncFunc = require('../../utils/catchAsyncFuncs');
const APIresourceFunc = require('../../utils/APIresourceFunc');
const AppError = require('../../utils/appError');
const factory = require('./../handleFactory');

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
    .toFile(`public/categories/${req.file.filename}`);

  next();
});

exports.createCategory = catchAsyncFunc(async (req, res, next) => {
  let data;
  if (req.body._id != null || req.body._id != undefined) {
    // console.log(req.body);
    if (req.body.parent_categories.length > 0) {
      req.body.parent_categories.forEach(async category => {
        console.log(category.value);
        Categories.updateOne(
          {
            _id: category.value,
            'child_categories.value': { $ne: req.body._id }
          },
          {
            $push: {
              child_categories: { value: req.body._id, label: req.body.name }
            }
          },
          function(err, documents) {
            console.log(documents);
          }
        );
      });
    }
    data = await Categories.findByIdAndUpdate({ _id: req.body.id }, req.body, {
      new: true,
      runValidators: true
    });
  } else {
    data = await Categories.create(req.body);
    if (data.parent_categories.length > 0) {
      data.parent_categories.forEach(async category => {
        await Categories.updateOne(
          {
            _id: category.value,
            'child_categories.value': { $ne: data._id }
          },
          {
            $push: {
              child_categories: { value: data._id, label: data.name }
            }
          }
        );
      });
    }
  }

  res.status(201).send({
    status: 'success',
    data
  });
});

exports.getAllCategories = catchAsyncFunc(async (req, res, next) => {
  let filter = { active: true };
  const categoriees = new APIresourceFunc(Categories.find(filter), req.query)
    .AdvancedFilter()
    .sort()
    .fieldSort()
    .paginate();

  const data = await categoriees.query
    .populate({
      path: 'parent_categories.value',
      select: 'name'
    })
    .populate({
      path: 'child_categories.value',
      select: 'name'
    });
  // console.log(data);
  res.status(200).send({
    status: 'Success',
    results: data.length,
    data
  });
});

exports.getSubCategories = catchAsyncFunc(async (req, res, next) => {
  let subCategries = [];
  req.body.value.map(async category => {
    var data = await Categories.findById(category.value._id);
    subCategries.push({ value: { _id: data._id, name: data.name } });
    if (subCategries.length === req.body.value.length) {
      res.status(200).send({
        status: 'Success',
        results: subCategries.length,
        data: subCategries
      });
    }
  });
  // console.log(data);
});

exports.getOneCategory = factory.getOne(Categories, {
  path: 'parent_categories.value',
  select: 'name'
});

exports.updateCategory = factory.updateOne(Categories);

exports.deleteCategory = factory.deleteOne(Categories);
