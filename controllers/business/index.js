const BusinessType = require('../../models/business');
const catchAsyncFunc = require('../../utils/catchAsyncFuncs');
const AppError = require('../../utils/appError');
const factory = require('./../handleFactory');
const sharp = require('sharp');
const fs = require('fs');

const removeSpace = item => {
  return item.replace(/\s/g, '-');
};
exports.createBusinessType = catchAsyncFunc(async(req,res, next)=>{
    let data;
  if (req.body._id != null || req.body._id != undefined) {
    console.log(req.body._id);
    data = await BusinessType.findByIdAndUpdate({ _id: req.body.id }, req.body, {
      new: true,
      runValidators: true
    });
  } else {
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
    data = await BusinessType.create(req.body);
  }

  res.status(201).send({
    status: 'success',
    data
  });
})

exports.getAllBusinessTypes = factory.getAll(BusinessType);

exports.getOneBusinessType = factory.getOne(BusinessType);

exports.updateBusinessType = factory.updateOne(BusinessType);

exports.deleteBusinessType = factory.deleteOne(BusinessType);
