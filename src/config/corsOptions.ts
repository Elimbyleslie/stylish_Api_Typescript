import env from './env.js';

const corsOptions = {
  origin: function (origin: any, callback: any) {
    if ((!env.nodeProduction && !origin) || env.allowOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

export default corsOptions;
