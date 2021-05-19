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
  if (req.body._id) {
    if (req.body.parent) {
      let parent = [];
      req.body.parent.map(item => {
        parent.push(item._id);
        if (parent.length === req.body.parent.length) {
          req.body.parent = parent;
        }
      });
    }
    if (req.body.sectors) {
      let sectors = [];
      req.body.sectors.map(item => {
        sectors.push(item._id);
        if (sectors.length === req.body.sectors.length) {
          req.body.sectors = sectors;
        }
      });
    }
    if (req.body.business_types) {
      let business_types = [];
      req.body.business_types.map(item => {
        business_types.push(item._id);
        if (business_types.length === req.body.business_types.length) {
          req.body.business_types = business_types;
        }
      });
    }
    if (req.body.images) {
      let images = [];
      await Promise.all(
        req.body.images.map(async (file, i) => {
          if (file.url.startsWith('sectors/')) {
            images.push(file);
          } else {
            const filename = `sectors/${removeSpace(
              req.body.name
            )}-${Date.now()}-${i + 1}.jpeg`;
            var image = file.url.replace(/^data:.+;base64,/, '');
            var imageeBuffer = new Buffer.from(image, 'base64');
            await sharp(imageeBuffer)
              .resize(2000, 1333)
              .toFormat('jpeg')
              .jpeg({ quality: 90 })
              .toFile(`public/${filename}`);

            file.url = filename;
            images.push(file);
          }
        })
      );
      req.body.images = images;
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
      data: {
        doc
      }
    });
  } else {
    console.log(req.body);
    if (req.body.parent) {
      let parent = [];
      req.body.parent.map(item => {
        parent.push(item.value);
        if (parent.length === req.body.parent.length) {
          req.body.parent = parent;
        }
      });
    }
    if (req.body.sectors) {
      let sectors = [];
      req.body.sectors.map(item => {
        sectors.push(item.value);
        if (sectors.length === req.body.sectors.length) {
          req.body.sectors = sectors;
        }
      });
    }
    if (req.body.business_types) {
      let business_types = [];
      req.body.business_types.map(item => {
        business_types.push(item.value);
        if (business_types.length === req.body.business_types.length) {
          req.body.business_types = business_types;
        }
      });
    }
    if (req.body.images) {
      let images = [];
      await Promise.all(
        req.body.images.map(async (file, i) => {
          if (file.url.startsWith('sectors/')) {
            images.push(file);
          } else {
            const filename = `sectors/${removeSpace(
              req.body.name
            )}-${Date.now()}-${i + 1}.jpeg`;
            var image = file.url.replace(/^data:.+;base64,/, '');
            var imageeBuffer = new Buffer.from(image, 'base64');
            await sharp(imageeBuffer)
              .resize(2000, 1333)
              .toFormat('jpeg')
              .jpeg({ quality: 90 })
              .toFile(`public/${filename}`);

            file.url = filename;
            images.push(file);
          }
        })
      );
      req.body.images = images;
    }
    let data = await Sectors.create(req.body)
      .populate({
        path: 'parent',
        select: 'name _id'
      })
      .populate({
        path: 'business_types',
        select: 'name _id'
      });
    res.status(201).send({
      status: 'success',
      data
    });
  }
});

exports.getAllSectors = catchAsyncFunc(async (req, res, next) => {
  let filter = { active: true };
  const tax_terms = new APIresourceFunc(Sectors.find(filter), req.query)
    .AdvancedFilter()
    .sort()
    .fieldSort()
    .paginate();

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

exports.getOneSector = factory.getOne(Sectors, {
  path: 'business_types',
  select: 'name _id'
});

exports.updateSector = catchAsyncFunc(async (req, res, next) => {
  if (req.body.images) {
    let images = [];
    await Promise.all(
      req.body.images.map(async (file, i) => {
        if (file.url.startsWith('sectors/')) {
          images.push(file);
        } else {
          const filename = `sectors/${removeSpace(
            req.body.name
          )}-${Date.now()}-${i + 1}.jpeg`;
          var image = file.url.replace(/^data:.+;base64,/, '');
          var imageeBuffer = new Buffer.from(image, 'base64');
          await sharp(imageeBuffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/${filename}`);

          file.url = filename;
          images.push(file);
        }
      })
    );
    req.body.images = images;
  }
  const doc = await Sectors.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!doc) {
    return next(new AppError('There is no document with that id', 404));
  }

  res.status(200).send({
    status: 'Success',
    data: {
      doc
    }
  });
});

exports.deleteSector = factory.deleteOne(Sectors);
