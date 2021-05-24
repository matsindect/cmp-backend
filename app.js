const path = require('path');
const express = require('express');
const bodyparser = require('body-parser');
const morgan = require('morgan');
const ratelimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
var cors = require('cors');

const AppError = require('./utils/appError');
const uniErrorHamndler = require('./controllers/errorContoller');

const userRouter = require('./routes/userRouter');
const profileRouter = require('./routes/profileRouter');
const productRouter = require('./routes/productsRouter');
const categoriesRouter = require('./routes/categoriesRouter');
const sectorsRouter = require('./routes/sectorsRouter');
const settingsRouter = require('./routes/settingsRouter');
const businessTypeRouter = require('./routes/businessRouter');
const serviceRouter = require('./routes/serviceRouter');
const productAttributeRouter = require('./routes/productAttributesrouter');
const productCatergoriesRouter = require('./routes/productCattegoriesRouter');
const analyticsRouter = require('./routes/analyticsRouter');
const postRouter = require('./routes/postRouter');

const server = express();
// Serving static files
server.use(express.static(path.join(__dirname, 'public')));

var whitelist = [
  'http://localhost:3000',
  'http://localhost',
  'https://constructionmarketuae.com',
  'https://constructmeplace.com',
  'https://crimson-moon-246465.postman.co/',
  '*'
];
var corsOptions = {
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

server.use(cors(corsOptions));
// http security
server.use(helmet());
if (process.env.NNODE_ENV === 'development') {
  server.use(morgan('dev'));
}

//limit number of api request to 100
const limiter = ratelimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'You have exceeded the number of request, Try in an hour'
});
// server.use('/api', limiter);

//body parser
server.use(bodyparser.json({ limit: '1000000kb' }));

//Data sanitization
server.use(mongoSanitize());
server.use(xss());

// Prevent parameter polution
server.use(hpp());

//ROUTES;
server.use('/api/v1/users', userRouter);
server.use('/api/v1/profiles', profileRouter);
server.use('/api/v1/products', productRouter);
server.use('/api/v1/categories', categoriesRouter);
server.use('/api/v1/sectors', sectorsRouter);
server.use('/api/v1/settings', settingsRouter);
server.use('/api/v1/business-types', businessTypeRouter);
server.use('/api/v1/services', serviceRouter);
server.use('/api/v1/product-attributes', productAttributeRouter);
server.use('/api/v1/product-categories', productCatergoriesRouter);
server.use('/api/v1/analytics', analyticsRouter);
server.use('/api/v1/posts', postRouter);

server.all('*', (req, res, next) => {
  next(new AppError(`Cannot Find ${req.originalUrl} on this server`, 404));
});

server.use(uniErrorHamndler);

module.exports = server;
