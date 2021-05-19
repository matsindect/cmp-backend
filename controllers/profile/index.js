const APIresourceFunc = require('../../utils/APIresourceFunc');
const catchAsyncFunc = require('../../utils/catchAsyncFuncs');
const AppError = require('../../utils/appError');
const Profile = require('./../../models/profile');
const Product = require('./../../models/products');
const Sector = require('./../../models/sectors');
const User = require('./../../models/userModel');
const slugify = require('slugify');
const factory = require('./../handleFactory');
const sharp = require('sharp');
const fs = require('fs');
const pdf2base64 = require('pdf-to-base64');

const removeSpace = item => {
  return item.replace(/\s/g, '-');
};
exports.createProfile = catchAsyncFunc(async (req, res, next) => {
  //Get fields
  let profile = await Profile.findOne({ user: req.user.id });
  var user = await User.findById(req.user.id);
  if (profile) {
    //Update

    if (req.body.name) profile.company.name = req.body.company.name;
    if (req.body.about) profile.company.about = req.body.company.about;
    if (req.body.location) profile.company.location = req.body.company.location;
    if (req.body.address) profile.company.address = req.body.company.address;
    if (req.body.tel) profile.company.tel = req.body.company.tel;
    if (req.body.fax) profile.company.fax = req.body.company.fax;
    if (req.body.website) profile.company.website = req.body.company.website;
    if (req.body.email) profile.company.email = req.body.company.email;
    if (req.body.business_types) {
      req.body.business_types.forEach(element => {
        if (!user.business_types.includes(String(element.value))) {
          user.business_types.push(element.value);
        }
      });
      await user.save();
    }
    if (req.body.services) {
      let services = [];
      req.body.services.map(item => {
        services.push(item.value);
        if (services.length === req.body.services.length) {
          req.body.services = services;
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
    if (req.body.logo) {
      if (req.body.logo.startsWith('profile-logo/')) {
        profile.logo = req.body.logo;
      } else {
        var logo = req.body.logo.replace(/^data:.+;base64,/, '');
        var buffer = new Buffer.from(logo, 'base64');
        var filenane = `profile-logo/${removeSpace(
          req.body.company.name
        )}-logo-${Date.now()}.jpeg`;
        await sharp(buffer)
          .resize(200, 200)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/${filenane}`);

        profile.logo = filenane;
      }
    }
    if (req.body.license) {
      if (req.body.license.startsWith('profile-license/')) {
        profile.license = req.body.license;
      } else {
        var license = req.body.license.replace(/^data:.+;base64,/, '');
        var trade_licenceBuffer = new Buffer.from(license, 'base64');
        var filename = `profile-license/${removeSpace(
          req.body.company.name
        )}-${Date.now()}-license.pdf`;
        await fs.writeFile(
          `public/${filename}`,
          trade_licenceBuffer,
          'binary',
          function(err) {
            if (err) {
              console.log(err);
            } else {
              console.log('The trade_licence file was saved!');
            }
          }
        );
        profile.license = filename;
      }
    }
    if (req.body.images) {
      let images = [];
      await Promise.all(
        req.body.images.map(async (file, i) => {
          if (file.url.startsWith('gallary/')) {
            images.push(file);
          } else {
            const filename = `gallary/${removeSpace(
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
      profile.images = images;
    }
    if (req.body.products_catalogue) {
      let products_catalogue = [];
      await Promise.all(
        req.body.products_catalogue.map(async (file, i) => {
          if (file.url.startsWith('profile-catalogues/')) {
            products_catalogue.push(file);
          } else {
            const filename = `profile-catalogues/${removeSpace(
              req.body.name
            )}-${Date.now()}-${i + 1}.pdf`;
            var catalogue = file.url.replace(/^data:.+;base64,/, '');
            var catalogueeBuffer = new Buffer.from(catalogue, 'base64');
            await fs.writeFile(`public/${filename}`, catalogueeBuffer, function(
              err
            ) {
              if (err) {
                console.log(err);
              } else {
                console.log('The trade_licence file was saved!');
              }
            });
            file.url = filename;
            products_catalogue.push(file);
          }
        })
      );
      profile.products_catalogue = products_catalogue;
    }

    //social

    if (req.body.youtube) profile.social.youtube = req.body.youtube;
    if (req.body.twitter) profile.social.twitter = req.body.twitter;
    if (req.body.facebook) profile.social.facebook = req.body.facebook;
    if (req.body.linkedin) profile.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profile.social.instagram = req.body.instagram;

    var doc = await profile.save();

    res.status(200).send({
      status: 'Success',
      data: doc
    });
  } else {
    //Create

    let profile = await Profile.findOne({
      slug: slugify(req.body.company.name, {
        replacement: '-',
        remove: /[*+~.()'"!:@]/g,
        lower: true
      })
    });
    if (profile) {
      return next(new AppError('Company name already taken', 400));
    }
    if (req.body.services) {
      let services = [];
      req.body.services.map(item => {
        services.push(item.value);
        if (services.length === req.body.services.length) {
          req.body.services = services;
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
    if (req.body.businesstype) {
      req.body.company.businesstype.forEach(element => {
        if (!user.businesstype.includes(String(element))) {
          user.businesstype.push(element);
        }
      });
      await user.save();
    }
    req.body.user = req.user.id;
    //save Profile
    const doc = new Profile(req.body);
    await doc.save();

    res.status(200).send({
      status: 'Success',
      data: doc
    });
  }
});

exports.postProducts = catchAsyncFunc(async (req, res, next) => {
  const product = await Product.create(req.body.product);
  const profile = await Profile.findOne({ user: req.user.id });
  if (product && profile) {
    profile.products.push(product._id);
    await profile.save();
  }
  res.status(200).send({
    status: 'Success',
    product: profile.products
  });
});

exports.getProfileProducts = catchAsyncFunc(async (req, res, next) => {
  const profile = await Profile.findOne({ user: req.user.id });
  if (!profile) return next(new AppError('Profile n ot found', 404));
  res.status(200).send({
    status: 'Success',
    product: profile.products
  });
});

exports.deleteProduct = catchAsyncFunc(async (req, res, next) => {
  let profile = await Profile.findOne({ user: req.user.id });
  if (!profile) {
    return next(new AppError('profile does not exist', 404));
  }
  // Delete the product
  const removeIndex = profile.products
    .map(product => product)
    .indexOf(req.params.product_id);
  //splice out of array
  profile.products.splice(removeIndex, 1);
  //save
  await profile.save();
  res.status(200).send({
    status: 'Success',
    data: {
      products: profile.products
    }
  });
});

exports.postSectors = catchAsyncFunc(async (req, res, next) => {
  const sector = await Sector.create(req.body.sector);
  const profile = await Profile.findOne({ user: req.user.id });
  if (sector && profile) {
    profile.sectors.push(sector._id);
    await profile.save();
  }
  res.status(200).send({
    status: 'Success',
    sectors: profile.sectors
  });
});

exports.getProfileSectors = catchAsyncFunc(async (req, res, next) => {
  const profile = await Profile.findOne({ user: req.user.id });
  if (!profile) return next(new AppError('Profile n ot found', 404));
  res.status(200).send({
    status: 'Success',
    sectors: profile.sectors
  });
});

exports.deleteSector = catchAsyncFunc(async (req, res, next) => {
  let profile = await Profile.findOne({ user: req.user.id });
  if (!profile) {
    return next(new AppError('profile does not exist', 404));
  }
  // Delete the sector
  const removeIndex = profile.sectors
    .map(sector => sector)
    .indexOf(req.params.sector_id);
  //splice out of array
  profile.sectors.splice(removeIndex, 1);
  //save
  await profile.save();
  res.status(200).send({
    status: 'Success',
    data: {
      sectors: profile.sectors
    }
  });
});

exports.getAllProfiles = catchAsyncFunc(async (req, res, next) => {
  let filter = { is_active: true };
  const tax_terms = new APIresourceFunc(Profile.find(filter), req.query)
    .AdvancedFilter()
    .sort()
    .fieldSort()
    .paginate();

  const data = await tax_terms.query;
  // console.log(data);
  res.status(200).send({
    status: 'Success',
    results: data.length,
    data
  });
});

exports.getProfile = catchAsyncFunc(async (req, res, next) => {
  let data = await Profile.findById(req.params.id);
  // .populate('sectors')
  // .populate('business_type')
  // .populate('categories')
  // .populate('services')
  // .populate('city')
  // .populate('country');

  var license = await pdf2base64(`public/${data.license}`);

  data.license = `data:application/octet-stream;base64,${license}`;

  if (!data) {
    return next(new AppError('There is no dataument with that id', 404));
  }
  res.status(200).send({
    status: 'Success',
    data
  });
});

//@route    Delete api/v1/profile/
//@desc     Delete user and profile
//@access   Private

exports.deleteProfile = catchAsyncFunc(async (req, res, next) => {
  await Profile.findOneAndRemove({ user: req.user.id });
  await User.findByIdAndRemove({ _id: req.user.id });
  res.json({ success: true });
});
