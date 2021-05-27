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
const removeSpace = item => {
  return item.replace(/\s/g, '-');
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
  if (req.body.description) productFields.description = req.body.description;
  if (req.body.product_name)
    productFields.slug = slugify(req.body.product_name, {
      replacement: '-',
      remove: /[*+~.()'"!:@]/g,
      lower: true
    });
  if (req.body.sectors) {
    let sectors = [];
    req.body.sectors.map(item => {
      if (item.value) {
        sectors.push(item.value);
      } else {
        sectors.push(item._id);
      }

      if (sectors.length === req.body.sectors.length) {
        productFields.sectors = sectors;
      }
    });
  }
  if (req.body.product_attributes) {
    let product_attributes = [];
    req.body.product_attributes.map(item => {
      if (item.value) {
        product_attributes.push(item.value);
      } else {
        product_attributes.push(item._id);
      }
      if (product_attributes.length === req.body.product_attributes.length) {
        productFields.product_attributes = product_attributes;
      }
    });
  }
  if (req.body.product_categories) {
    let product_categories = [];
    req.body.product_categories.map(item => {
      if (item.value) {
        product_categories.push(item.value);
      } else {
        product_categories.push(item._id);
      }
      if (product_categories.length === req.body.product_categories.length) {
        productFields.product_categories = product_categories;
      }
    });
  }
  if (req.body.business_types) {
    let business_types = [];
    req.body.business_types.map(item => {
      if (item.value) {
        business_types.push(item.value);
      } else {
        business_types.push(item._id);
      }

      if (business_types.length === req.body.business_types.length) {
        productFields.business_types = business_types;
      }
    });
  }
  if (req.body.categories) {
    let categories = [];
    req.body.categories.map(item => {
      if (item.value) {
        categories.push(item.value);
      } else {
        categories.push(item._id);
      }
      if (categories.length === req.body.categories.length) {
        productFields.categories = categories;
      }
    });
  }
  if (req.body.images) {
    let images = [];
    await Promise.all(
      req.body.images.map(async (file, i) => {
        if (file.url.startsWith('products/')) {
          images.push(file);
        } else {
          const filename = `products/${removeSpace(
            req.body.product_name
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
    productFields.images = images;
  }

  let products = await Product.findOne({ _id: req.body._id });

  if (products) {
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

exports.getAllProducts = catchAsyncFunc(async (req, res, next) => {
  let query = Product.find();

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
      path: 'product_categories',
      select: 'name _id'
    })
    .populate({
      path: 'categories',
      select: 'name _id'
    })
    .populate({
      path: 'product_attributes'
    });

  if (!data) {
    return next(new AppError('There is no dataument with that id', 404));
  }
  res.status(200).send({
    status: 'Success',
    data
  });
});

exports.getOneProduct = catchAsyncFunc(async (req, res, next) => {
  let query = Product.findById(req.params.id);

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
      path: 'product_categories',
      select: 'name _id'
    })
    .populate({
      path: 'categories',
      select: 'name _id'
    })
    .populate({
      path: 'product_attributes'
    });
  if (!data) {
    return next(new AppError('There is no dataument with that id', 404));
  }
  res.status(200).send({
    status: 'Success',
    data
  });
});

exports.delleteProduct = factory.deleteOne(Product);
