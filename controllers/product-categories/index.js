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
  // console.log(req.body);
  let data;
  if (req.body._id != null || req.body._id != undefined) {
    if (req.body.business_types) {
      let business_types = [];
      req.body.business_types.map(item => {
        if (item.value) {
          business_types.push(item.value);
        } else {
          business_types.push(item._id);
        }

        if (business_types.length === req.body.business_types.length) {
          req.body.business_types = business_types;
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

    let saved = await ProductCategory.findByIdAndUpdate(
      { _id: req.body.id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    data = await ProductCategory.findById(saved._id)
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
  } else {
    if (req.body.business_types) {
      let business_types = [];
      req.body.business_types.map(item => {
        if (item.value) {
          business_types.push(item.value);
        } else {
          business_types.push(item._id);
        }

        if (business_types.length === req.body.business_types.length) {
          req.body.business_types = business_types;
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

    let prodcategory = await ProductCategory.create(req.body);
    data = await ProductCategory.findById(prodcategory._id)
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
  }
  res.status(201).send({
    status: 'success',
    data
  });
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
