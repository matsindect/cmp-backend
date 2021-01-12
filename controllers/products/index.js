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
  if (req.body.city) productFields.origin.city = req.body.city;
  if (req.body.country) productFields.origin.country = req.body.country;
  if (req.body.currency)
    productFields.product_pricing.currency = req.body.currency;
  if (req.body.price) productFields.product_pricing.price = req.body.price;
  if (req.body.location) productFields.product_location = req.body.location;
  if (req.body.product_attributes) {
    req.body.product_attributes.forEach(element => {
      productFields.product_attributes.unshift(element);
    });
  }

  if (req.files) {
    req.body.images.forEach(el => {
      productFields.images.unshift(el);
    });
    productFields.products_catalogue.push(req.body.products_catalogue);
  }
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
  let products = await Product.findOne({ slug: productFields.slug });

  if (products) {
    let update = await Product.findOneAndUpdate(
      { slug: productFields.slug },
      { $set: productFields },
      { new: true }
    );
    res.status(200).send({
      status: 'Success',
      data: {
        update
      }
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
