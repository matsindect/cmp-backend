const BusinessType = require('../../models/business');
const APIresourceFunc = require('../../utils/APIresourceFunc')
const catchAsyncFunc = require('../../utils/catchAsyncFuncs');
const AppError = require('../../utils/appError');
const factory = require('./../handleFactory');
const sharp = require('sharp');
const fs = require('fs');

const removeSpace = item => {
  return item.replace(/\s/g, '-');
};
exports.createBusinessType = catchAsyncFunc(async(req,res, next)=>{
 
  
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
    let data = await BusinessType.create(req.body);
    res.status(201).send({
    status: 'success',
    data
  });
  
})

exports.getAllBusinessTypes = catchAsyncFunc(async (req, res, next) => {
  let filter = { active: true };
  const tax_terms = new APIresourceFunc(BusinessType.find(filter), req.query)
    .AdvancedFilter()
    .sort()
    .fieldSort()
    .paginate();

  const data = await tax_terms.query.populate({
    path:'parent',
    select: 'name _id'
  }).populate({
    path:'children',
    select: 'name _id'
  });
  // console.log(data);
  res.status(200).send({
    status: 'Success',
    results: data.length,
    data
  });
});;

exports.getOneBusinessType = factory.getOne(BusinessType, {
  path:'parent',
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
  }).populate({
    path:'parent',
    select: 'name _id'
  }).populate({
    path:'children',
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
});;

exports.deleteBusinessType = factory.deleteOne(BusinessType);
