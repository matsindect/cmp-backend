const BusinessType = require('../../models/business');
const APIresourceFunc = require('../../utils/APIresourceFunc');
const catchAsyncFunc = require('../../utils/catchAsyncFuncs');
const AppError = require('../../utils/appError');
const factory = require('./../handleFactory');
const sharp = require('sharp');
const fs = require('fs');
var _ = require('underscore');

const removeSpace = item => {
  return item.replace(/\s/g, '-');
};
exports.createBusinessType = catchAsyncFunc(async (req, res, next) => {
  if (req.body._id) {
    if (req.body.categories) {
      let categories = [];
      req.body.categories.map(item => {
        if (item.value) {
          categories.push(item.value);
        } else {
          categories.push(item._id);
        }

        if (categories.length === req.body.categories.length) {
          req.body.categories = categories;
        }
      });
    }

    const doc = await BusinessType.findByIdAndUpdate(req.body._id, req.body, {
      new: true,
      runValidators: true
    })
      .populate({
        path: 'parent',
        select: 'name _id'
      })
      .populate({
        path: 'children',
        select: 'name _id',
        path: 'categories',
        select: 'name _id'
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
    // console.log(doc);
    if (req.body.categories) {
      let categories = [];
      req.body.categories.map(item => {
        if (item.value) {
          categories.push(item.value);
        } else {
          categories.push(item._id);
        }

        if (categories.length === req.body.categories.length) {
          req.body.categories = categories;
        }
      });
    }

    let btype = await BusinessType.create(req.body);
    let data = await BusinessType.findById(btype._id)
      .populate({
        path: 'parent',
        select: 'name _id'
      })
      .populate({
        path: 'categories',
        select: 'name _id'
      });
    res.status(201).send({
      status: 'success',
      data
    });
  }
});

exports.getAllBusinessTypes = catchAsyncFunc(async (req, res, next) => {
  let filter = { active: true };
  if (req.params.id) {
    filter = {
      active: true,
      categories: req.params.id
    };
  }
  const tax_terms = new APIresourceFunc(BusinessType.find(filter), req.query)
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
      path: 'categories',
      select: 'name _id'
    })
    .populate({
      path: 'children',
      select: 'name _id'
    });
  // console.log(data);
  res.status(200).send({
    status: 'Success',
    results: data.length,
    data
  });
});

exports.getOneBusinessType = factory.getOne(BusinessType, {
  path: 'parent',
  select: 'name _id',
  path: 'categories',
  select: 'name _id'
});

exports.updateBusinessType = catchAsyncFunc(async (req, res, next) => {
  if (req.body.images) {
    let images = [];
    await Promise.all(
      req.body.images.map(async (file, i) => {
        if (file.url.startsWith('business-type/')) {
          images.push(file);
        } else {
          const filename = `business-type/${removeSpace(
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
  const doc = await BusinessType.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate({
      path: 'parent',
      select: 'name _id'
    })
    .populate({
      path: 'children',
      select: 'name _id'
    });

  if (!doc) {
    return next(new AppError('There is no document with that id', 404));
  }

  res.status(200).send({
    status: 'Success',
    data: doc
  });
});

exports.getClassifiedBusinessTypes = catchAsyncFunc(async (req, res, next) => {
  let classified = [];
  const tax_terms = new APIresourceFunc(BusinessType.find(), req.query)
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
      path: 'categories',
      select: 'name _id'
    })
    .populate({
      path: 'children',
      select: 'name _id'
    });
  data.map(fil => {
    if (classified.length < 1) {
      classified.push({
        id: fil.categories[0]._id,
        filter_label: fil.categories[0].name,
        data: [fil]
      });
    } else {
      classified.map(element => {
        // console.log(classified)
        if (element['id'] === fil.categories[0]._id) {
          element['data'] = [...element['data'], fil];
        } else {
          classified.push({
            id: fil.categories[0]._id,
            filter_label: fil.categories[0].name,
            data: [fil]
          });
        }
      });
    }
  });

  classified = _.uniq(classified, function(v) {
    return v.id;
  });
  res.status(200).send({
    status: 'Success',
    data: classified
  });
});

exports.deleteBusinessType = factory.deleteOne(BusinessType);
