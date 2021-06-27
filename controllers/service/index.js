const Service = require('../../models/services');
const catchAsyncFunc = require('../../utils/catchAsyncFuncs');
const AppError = require('../../utils/appError');
const factory = require('./../handleFactory');
const AAPIresourceFunc = require('../../utils/APIresourceFunc');
const sharp = require('sharp');
const fs = require('fs');

const removeSpace = item => {
  return item.replace(/\s/g, '-');
};
exports.createService = catchAsyncFunc(async (req, res, next) => {
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
    data = await Service.findByIdAndUpdate({ _id: req.body.id }, req.body, {
      new: true,
      runValidators: true
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
    if (req.body.images) {
      let images = [];
      await Promise.all(
        req.body.images.map(async (file, i) => {
          if (file.url.startsWith('service/')) {
            images.push(file);
          } else {
            const filename = `service/${removeSpace(
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
    var service = await Service.create(req.body);
    data = Service.findById(service._id).populate({
      path: 'parent',
      select: 'name _id',
      path: 'business_types',
      select: 'name _id',
      path: 'sectors',
      select: 'name _id'
    });
  }

  res.status(201).send({
    status: 'success',
    data
  });
});

exports.getAllServices = catchAsyncFunc(async (req, res, next) => {
  let filter = { is_active: true };
  const tax_terms = new AAPIresourceFunc(Service.find(filter), req.query)
    .AdvancedFilter()
    .sort()
    .fieldSort()
    .paginate();

  const data = await tax_terms.query.populate({
    path: 'parent',
    select: 'name _id',
    path: 'business_types',
    select: 'name _id',
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

exports.getOneService = catchAsyncFunc(async (req, res, next) => {
  let query = Service.findById(req.params.id);

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

exports.updateService = factory.updateOne(Service);

exports.deleteService = factory.deleteOne(Service);

exports.getServiceByBusinessType = catchAsyncFunc(async (req, res, next) => {
  var s = [];
  req.body.sectors.map(t => {
    s.push(t.value ? t.value : t.id);
  });
  console.log(req.body);
  // get the services
  let filter = { is_active: true, sectors: { $in: s } };
  const tax_terms = new AAPIresourceFunc(Service.find(filter), req.query)
    .AdvancedFilter()
    .sort()
    .fieldSort()
    .paginate();

  const data = await tax_terms.query.populate({
    path: 'parent',
    select: 'name _id',
    path: 'business_types',
    select: 'name _id',
    path: 'sectors',
    select: 'name _id'
  });

  //Classify the services by business type
  var servicesByBT = [];
  data.map(service => {
    console.log(service.business_types);
    req.body.business_types.map(bt => {
      var btValue = bt.value ? bt.value : bt.id;
      var btLabel = bt.label ? bt.label : bt.name;
      if (service.business_types.includes(btValue)) {
        console.log(btValue);
        if (servicesByBT.length < 1) {
          servicesByBT.push({
            value: btValue,
            label: btLabel,
            data: [service]
          });
        } else {
          servicesByBT.map(element => {
            // console.log(servicesByBT);
            if (element['value'] === btValue) {
              element['data'] = [...element['data'], service];
            } else {
              servicesByBT.push({ value: btValue, data: [service] });
              console.log(servicesByBT);
            }
          });
        }
      }
    });
  });
  // Classify by sector

  // return classified

  res.status(200).send({
    status: 'Success',
    data: servicesByBT
  });
});
