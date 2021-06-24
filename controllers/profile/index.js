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
  let profile = {};

  if (
    req.user.role === 'admin' &&
    String(req.body.user) != String(req.user.id)
  ) {
    profile = await Profile.findOne({ user: req.body.user });
  } else {
    profile = await Profile.findOne({ user: req.user.id });
  }

  var user = await User.findById(req.user.id);
  if (profile) {
    //Update

    if (req.body.company.name) profile.company.name = req.body.company.name;
    if (req.body.company.about) profile.company.about = req.body.company.about;
    if (req.body.company.location)
      profile.company.location = req.body.company.location;
    if (req.body.company.address)
      profile.company.address = req.body.company.address;
    if (req.body.company.tel) profile.company.tel = req.body.company.tel;
    if (req.body.company.fax) profile.company.fax = req.body.company.fax;
    if (req.body.company.website)
      profile.company.website = req.body.company.website;
    if (req.body.company.email) profile.company.email = req.body.company.email;
    if (req.body.user_types) {
      if (!user.business_types === String(req.body.user_types.value)) {
        user.business_types = req.body.user_types.value;
      }
      await user.save();
    }
    if (req.body.services) {
      let services = [];
      req.body.services.map(item => {
        if (item.value) {
          services.push(item.value);
        } else {
          services.push(item._id);
        }

        if (services.length === req.body.services.length) {
          profile.services = services;
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
          profile.sectors = sectors;
        }
      });
    }
    if (req.body.contact_person) {
      let persons = [];
      req.body.contact_person.map(item => {
        persons.push(item.value);
        if (persons.length === req.body.contact_person.length) {
          profile.contact_person = persons;
        }
      });
    }
    if (req.body.categories) {
      let categories = [];
      req.body.categories.map(item => {
        if (item.value) {
          categories.push(item.value);
        } else {
          categories.push(item._id);
        }

        if (categories.length === req.body.categories.length) {
          //req.body.categories = categories;
          profile.categories = categories;
        }
      });
    }

    if (req.body.logo) {
      if (req.body.logo.startsWith('profile-logo/')) {
        profile.logo = req.body.logo;
      } else {
        AppError;
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
        profile.license = fileAppErrorname;
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
    if (req.body.social) {
      if (req.body.social.youtube)
        profile.social.youtube = req.body.social.youtube;
      if (req.body.social.twitter)
        profile.social.twitter = req.body.social.twitter;
      if (req.body.social.facebook)
        profile.social.facebook = req.body.social.facebook;
      if (req.body.social.linkedin)
        profile.social.linkedin = req.body.social.linkedin;
      if (req.body.social.instagram)
        profile.social.instagram = req.body.social.instagram;
    }

    var doc = await profile.save();

    res.status(200).send({
      status: 'Success',
      data: doc
    });
  } else {
    //Create
    if (
      req.body.company !== undefined &&
      req.body.company !== null &&
      req.body.company !== ''
    ) {
      console.log(req.body.company);

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
    if (req.body.categories) {
      let categories = [];
      req.body.categories.map(item => {
        categories.push(item.value);
        if (categories.length === req.body.categories.length) {
          req.body.categories = categories;
        }
      });
    }
    if (req.body.user_types) {
      if (!user.business_types === String(req.body.user_types.value)) {
        user.business_types = req.body.user_types.value;
      }
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
  if (req.params.id === 'me') {
    let data = await Profile.findOne({ user: req.user.id })
      .populate({
        path: 'services',
        select: 'name _id'
      })
      .populate({
        path: 'sectors',
        select: 'name _id'
      })
      .populate({
        path: 'parent',
        select: 'name _id'
      });

    // var license = await pdf2base64(`public/${data.license}`);

    // data.license = `data:application/octet-stream;base64,${license}`;

    if (!data) {
      return next(new AppError('There is no dataument with that id', 404));
    }
    res.status(200).send({
      status: 'Success',
      data
    });
  } else {
    let data = await Profile.findById(req.params.id);
    // .populate('sectors')
    // .populate('business_type')
    // .populate('categories')
    // .populate('services')
    // .populate('city')
    // .populate('country');

    // var license = await pdf2base64(`public/${data.license}`);

    // data.license = `data:application/octet-stream;base64,${license}`;

    if (!data) {
      return next(new AppError('There is no dataument with that id', 404));
    }
    res.status(200).send({
      status: 'Success',
      data
    });
  }
});

//@route    Delete api/v1/profile/
//@desc     Delete user and profile
//@access   Private

exports.deleteProfile = catchAsyncFunc(async (req, res, next) => {
  await Profile.findOneAndRemove({ user: req.user.id });
  await User.findByIdAndRemove({ _id: req.user.id });
  res.json({ success: true });
});
