const ProductAttribute = require('../../models/products/attributes');
const catchAsyncFunc = require('../../utils/catchAsyncFuncs');
const AppError = require('../../utils/appError');
const factory = require('./../handleFactory');
const AAPIresourceFunc = require('../../utils/APIresourceFunc');
const sharp = require('sharp');
const fs = require('fs');

const removeSpace = item => {
  return item.replace(/\s/g, '-');
};
exports.createProductAttribute = catchAsyncFunc(async (req, res, next) => {
  let data;
  if (req.body._id != null || req.body._id != undefined) {
    if (req.body.business_type) {
      let business_type = [];
      req.body.business_type.map(item => {
        if (item.value) {
          business_type.push(item.value);
        } else {
          business_type.push(item._id);
        }

        if (business_type.length === req.body.business_type.length) {
          req.body.business_type = business_type;
        }
      });
    }
    if (req.body.sectors) {
      let sectors = [];
      req.body.sectors.map(item => {
        if (item.value) {
          sectors.push(item.value);
        } else {
          sectors.push(item._id);
        }

        if (sectors.length === req.body.sectors.length) {
          req.body.sectors = sectors;
        }
      });
    }
    if (req.body.product_category) {
      let product_category = [];
      req.body.product_category.map(item => {
        if (item.value) {
          product_category.push(item.value);
        } else {
          product_category.push(item._id);
        }

        if (product_category.length === req.body.product_category.length) {
          req.body.product_category = product_category;
        }
      });
    }
    if (req.body.images) {
      let images = [];
      await Promise.all(
        req.body.images.map(async (file, i) => {
          if (file.url.startsWith('Product-attribute/')) {
            images.push(file);
          } else {
            const filename = `Product-attribute/${removeSpace(
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
    await ProductAttribute.findByIdAndUpdate({ _id: req.body.id }, req.body, {
      new: true,
      runValidators: true
    });
    let data = await ProductAttribute.findOne({ _id: req.body.id });
    res.status(201).send({
      status: 'success',
      data
    });
  } else {
    if (req.body.business_type) {
      let business_type = [];
      req.body.business_type.map(item => {
        if (item.value) {
          business_type.push(item.value);
        } else {
          business_type.push(item._id);
        }

        if (business_type.length === req.body.business_type.length) {
          req.body.business_type = business_type;
        }
      });
    }
    if (req.body.sectors) {
      let sectors = [];
      req.body.sectors.map(item => {
        if (item.value) {
          sectors.push(item.value);
        } else {
          sectors.push(item._id);
        }

        if (sectors.length === req.body.sectors.length) {
          req.body.sectors = sectors;
        }
      });
    }
    if (req.body.product_category) {
      let product_category = [];
      req.body.product_category.map(item => {
        if (item.value) {
          product_category.push(item.value);
        } else {
          product_category.push(item._id);
        }

        if (product_category.length === req.body.product_category.length) {
          req.body.product_category = product_category;
        }
      });
    }
    if (req.body.images) {
      let images = [];
      await Promise.all(
        req.body.images.map(async (file, i) => {
          if (file.url.startsWith('Product-attribute/')) {
            images.push(file);
          } else {
            const filename = `Product-attribute/${removeSpace(
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
    let attribute = await ProductAttribute.create(req.body);
    let data = await ProductAttribute.findOne({ _id: attribute._id })
      .populate({
        path: 'sectors',
        select: 'name _id'
      })
      .populate({
        path: 'business_type',
        select: 'name _id'
      })
      .populate({
        path: 'product_category',
        select: 'name _id'
      });
    res.status(201).send({
      status: 'success',
      data
    });
  }
});

exports.getAllProductAttributes = catchAsyncFunc(async (req, res, next) => {
  let filter = { is_active: true };
  const tax_terms = new AAPIresourceFunc(
    ProductAttribute.find(filter),
    req.query
  )
    .AdvancedFilter()
    .sort()
    .fieldSort()
    .paginate();

  const data = await tax_terms.query
    .populate({
      path: 'sectors',
      select: 'name _id'
    })
    .populate({
      path: 'business_type',
      select: 'name _id'
    })
    .populate({
      path: 'product_category',
      select: 'name _id'
    });
  // console.log(data);
  res.status(200).send({
    status: 'Success',
    results: data.length,
    data
  });
});

exports.getOneProductAttribute = catchAsyncFunc(async (req, res, next) => {
  let query = ProductAttribute.findById(req.params.id);
  const data = await query
    .populate({
      path: 'sectors',
      select: 'name _id'
    })
    .populate({
      path: 'business_type',
      select: 'name _id'
    })
    .populate({
      path: 'product_category',
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

exports.updateProductAttribute = factory.updateOne(ProductAttribute);

exports.deleteProductAttribute = factory.deleteOne(ProductAttribute);
