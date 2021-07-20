const Service = require('../../models/services');
const catchAsyncFunc = require('../../utils/catchAsyncFuncs');
const AppError = require('../../utils/appError');
const factory = require('./../handleFactory');
const AAPIresourceFunc = require('../../utils/APIresourceFunc');
const sharp = require('sharp');
const fs = require('fs');

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
          // console.log(business_types);
          req.body.business_types = business_types;
        }
      });
    }
    if (req.body.service_categories) {
      let service_categories = [];
      req.body.service_categories.map(item => {
        if (item.value) {
          service_categories.push(item.value);
        } else {
          service_categories.push(item._id);
        }

        if (service_categories.length === req.body.service_categories.length) {
          // console.log(service_categories);
          req.body.service_categories = service_categories;
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
    let service = await Service.findByIdAndUpdate(
      { _id: req.body.id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    data = await Service.findById(service._id)
      .populate({
        path: 'sectors',
        select: 'name _id'
      })
      .populate({
        path: 'parent',
        select: 'name _id'
      })
      .populate({
        path: 'business_types',
        select: 'name _id'
      })
      .populate({
        path: 'service_categories',
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
    if (req.body.service_categories) {
      let service_categories = [];
      req.body.service_categories.map(item => {
        if (item.value) {
          service_categories.push(item.value);
        } else {
          service_categories.push(item._id);
        }

        if (service_categories.length === req.body.service_categories.length) {
          // console.log(service_categories);
          req.body.service_categories = service_categories;
        }
      });
    }
    var service = await Service.create(req.body);
    data = await Service.findById(service._id)
      .populate({
        path: 'sectors',
        select: 'name _id'
      })
      .populate({
        path: 'parent',
        select: 'name _id'
      })
      .populate({
        path: 'business_types',
        select: 'name _id'
      })
      .populate({
        path: 'service_categories',
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

  const data = await tax_terms.query
    .populate({
      path: 'sectors',
      select: 'name _id'
    })
    .populate({
      path: 'parent',
      select: 'name _id'
    })
    .populate({
      path: 'business_types',
      select: 'name _id'
    })
    .populate({
      path: 'service_categories',
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
      path: 'sectors',
      select: 'name _id'
    })
    .populate({
      path: 'parent',
      select: 'name _id'
    })
    .populate({
      path: 'business_types',
      select: 'name _id'
    })
    .populate({
      path: 'service_categories',
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
    s.push(t.value);
  });
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
      if (service.business_types.includes(bt.value)) {
        console.log(bt.value);
        if (servicesByBT.length < 1) {
          servicesByBT.push({
            value: bt.value,
            label: bt.label,
            data: [service]
          });
        } else {
          servicesByBT.map(element => {
            // console.log(servicesByBT);
            if (element['value'] === bt.value) {
              element['data'] = [...element['data'], service];
            } else {
              servicesByBT.push({ value: bt.value, data: [service] });
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
