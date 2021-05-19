const ProductCategory = require('../../models/products/product_categories');
const catchAsyncFunc = require('../../utils/catchAsyncFuncs');
const AppError = require('../../utils/appError');
const factory = require('./../handleFactory');
const AAPIresourceFunc = require('../../utils/APIresourceFunc');
const sharp = require('sharp');
const fs = require('fs');

const removeSpace = item => {
  return item.replace(/\s/g, '-');
};
exports.createProductCategory = catchAsyncFunc(async (req, res, next) => {
  let data;
  if (req.body._id != null || req.body._id != undefined) {
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
          if (file.url.startsWith('Product-categories/')) {
            images.push(file);
          } else {
            const filename = `Product-categories/${removeSpace(
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
    data = await ProductCategory.findByIdAndUpdate(
      { _id: req.body.id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
  } else {
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
          if (file.url.startsWith('Product-categories/')) {
            images.push(file);
          } else {
            const filename = `Product-categories/${removeSpace(
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
    let data = await ProductCategory.create(req.body);
    res.status(201).send({
      status: 'success',
      data
    });
  }
});

exports.getAllProductCategories = catchAsyncFunc(async (req, res, next) => {
  let filter = { is_active: true };
  const tax_terms = new AAPIresourceFunc(
    ProductCategory.find(filter),
    req.query
  )
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
    })
    .populate({
      path: 'sectors',
      select: 'name _id'
    });
  // console.log(data);
  res.status(200).send({
    status: 'Success',
    results: data.length,
    data
  });
});

exports.getOneProductCategory = catchAsyncFunc(async (req, res, next) => {
  let query = ProductCategory.findById(req.params.id);
  const data = await query
    .populate({
      path: 'parent',
      select: 'name _id'
    })
    .populate({
      path: 'business_types',
      select: 'name _id'
    })
    .populate({
      path: 'sectors',
      select: 'name _id'
    });
  if (!data) {
    return next(new AppError('There is no dataument with that id', 404));
  }
  res.status(200).send({
    status: 'Success',
    data
  });
});

exports.updateProductCategory = factory.updateOne(ProductCategory);

exports.deleteProductCategory = factory.deleteOne(ProductCategory);
