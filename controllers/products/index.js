const APIresourceFunc = require('../../utils/APIresourceFunc');
const catchAsyncFunc = require('../../utils/catchAsyncFuncs');
const AppError = require('../../utils/appError');
const Product = require('./../../models/products');
const factory = require('./../handleFactory');
const slugify = require('slugify');
const multer = require('multer');
const sharp = require('sharp');

exports.createProduct = catchAsyncFunc(async (req, res, next) => {
  const productFields = {};
  // productFields.user = req.user.id;

  if (req.body.images) productFields.images = req.body.images;
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

  let products = await Product.findOne({ _id: req.body._id });

  if (products) {
    let data = await Product.findByIdAndUpdate(
      req.body._id,
      { $set: productFields },
      { new: true }
    )
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
    res.status(200).send({
      status: 'Success',
      data
    });
  } else {
    const newProduct = await Product.create(productFields);
    let data = await Product.findById(newProduct._id)
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

    res.status(200).send({
      status: 'Success',
      data
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
  // console.log(query);
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
