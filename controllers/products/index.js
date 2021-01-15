const APIresourceFunc = require('../../utils/APIresourceFunc');
const catchAsyncFunc = require('../../utils/catchAsyncFuncs');
const AppError = require('../../utils/appError');
const Product = require('./../../models/products');
const factory = require('./../handleFactory');
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

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
  { name: 'products_catalogue', maxCount: 1 },
  { name: 'images', maxCount: 5 }
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.processImages = catchAsyncFunc(async (req, res, next) => {
  if (!req.files.products_catalogue || !req.files.images) return next();

  // 1) Cover image
  req.body.products_catalogue = `product-${
    req.params.id
  }-${Date.now()}-cover.jpeg`;
  await sharp(req.files.products_catalogue[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/products/${req.body.products_catalogue}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `public/img/tours/tour-${
        req.params.id
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

exports.createProduct = catchAsyncFunc(async (req, res, next) => {
  const productFields = {};
  productFields.user = req.user.id;
  if (req.body.product_name) productFields.product_name = req.body.product_name;
  if (req.body.product_name)
    productFields.slug = slugify(req.body.product_name, {
      replacement: '-',
      remove: /[*+~.()'"!:@]/g,
      lower: true
    });
  if (req.body.quantity) productFields.quantity = req.body.quantity;
  if (req.body.origin) productFields.origin = req.body.origin;
  if (req.body.product_pricing)
    productFields.product_pricing = req.body.product_pricing;
  if (req.body.location) productFields.product_location = req.body.location;
  if (req.body.product_attributes) {
    req.body.product_attributes.forEach(element => {
      productFields.product_attributes.unshift(element);
    });
  }

  if (req.body.images) productFields.images = req.body.images;

  if (req.body.products_catalogue)
    productFields.products_catalogue = req.body.products_catalogue;

  if (req.body.sectors) {
    req.body.sectors.forEach(sector => {
      productFields.sectors.push(sector);
    });
  }
  if (req.body.product_categories) {
    req.body.product_categories.forEach(category => {
      productFields.product_categories.push(category);
    });
  }
  let products = await Product.findOne({ _id: req.body._id });

  if (products) {
    console.log(products);
    let data = await Product.findByIdAndUpdate(
      req.body._id,
      { $set: productFields },
      { new: true }
    );
    res.status(200).send({
      status: 'Success',
      data
    });
  } else {
    const newProduct = new Product(productFields);
    await newProduct.save();
    res.status(200).send({
      status: 'Success',
      data: {
        newProduct
      }
    });
  }
});

exports.getAllProducts = factory.getAll(Product);

exports.getOneProduct = factory.getOne(Product);

exports.delleteProduct = factory.deleteOne(Product);
