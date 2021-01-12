const multer = require('multer');
const sharp = require('sharp');
const Sectors = require('../../models/sectors');
const catchAsyncFunc = require('../../utils/catchAsyncFuncs');
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
    .toFile(`public/sectors/${req.file.filename}`);

  next();
});

exports.createSector = factory.createOne(Sectors);

exports.getAllSectors = factory.getAll(Sectors);

exports.getOneSector = factory.getOne(Sectors);

exports.updateSector = factory.updateOne(Sectors);

exports.deleteSector = factory.deleteOne(Sectors);
