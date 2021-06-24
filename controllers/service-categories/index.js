const ServiceCategory = require('../../models/services/service_categories');
const catchAsyncFunc = require('../../utils/catchAsyncFuncs');
const AppError = require('../../utils/appError');
const factory = require('../handleFactory');
const AAPIresourceFunc = require('../../utils/APIresourceFunc');
const sharp = require('sharp');
const fs = require('fs');

const removeSpace = item => {
  return item.replace(/\s/g, '-');
};
exports.createServiceCategory = catchAsyncFunc(async(req,res, next)=>{
  let data;
if (req.body._id != null || req.body._id != undefined) {
  console.log(req.body._id);
  data = await ServiceCategory.findByIdAndUpdate({ _id: req.body.id }, req.body, {
    new: true,
    runValidators: true
  });
} else {
  if (req.body.images) {
    let images = [];
    await Promise.all(
      req.body.images.map(async (file, i) => {
        if (file.url.startsWith('Service-categories/')) {
          images.push(file);
        } else {
          const filename = `Service-categories/${removeSpace(
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
  data = await ServiceCategory.create(req.body);
}

res.status(201).send({
  status: 'success',
  data
});
})


exports.getAllServiceCategories = catchAsyncFunc(async (req, res, next) => {
  let filter = { is_active: true };
  const tax_terms = new AAPIresourceFunc(
    ServiceCategory.find(filter),
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

exports.getOneServiceCategory = catchAsyncFunc(async (req, res, next) => {
  let query = ServiceCategory.findById(req.params.id);
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

exports.updateServiceCategory = factory.updateOne(ServiceCategory);

exports.deleteServiceCategory = factory.deleteOne(ServiceCategory);
