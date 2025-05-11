import authRouter from './routers/authUser.router.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import corsOptions from './config/corsOptions.js';
import credentials from './middlewares/credentials.js';
import env from './config/env.js';
import errorHandler from './middlewares/errorHandle.js';
import fileUpload from 'express-fileupload';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import morgan from 'morgan';
import { notFound } from './middlewares/notFound.js';
import path from 'path';
import router from './routers/index.js';
import verifyJWT from './middlewares/verifyJWT.js';
import express, { Application } from 'express';

// Conversion de __filename et __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express();

app.use(morgan('dev'));
// Utiliser Helmet pour appliquer une protection par défaut
app.use(
  helmet({
    contentSecurityPolicy: false, // Désactive CSP car il n'est pas nécessaire pour les API REST
    frameguard: false, // Désactive Frameguard (protection contre le clickjacking)
    hsts: true, // Active HTTP Strict Transport Security (HSTS) pour forcer HTTPS
    noSniff: true, // Active X-Content-Type-Options pour empêcher l'interprétation des types MIME
    xssFilter: true, // Active X-XSS-Protection pour le filtre XSS des navigateurs
    hidePoweredBy: true, // Cache l'en-tête "X-Powered-By"
  }),
);
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());
app.use('/public', express.static(path.join(__dirname, '..', 'public'))); // Configuration pour servir les fichiers statiques (images, etc.)

app.use('/api/auth', authRouter);

// Protected our enpoints
app.use(verifyJWT);
app.use('/api/users', router.user);
app.use('/api/categories', router.category);
app.use('/api/courses', router.product);

app.use(errorHandler);
app.use(notFound);

app.listen(+env.port!, env.hostname!, () => {
  console.log('==============================================================');
  console.log(`Our application running on: http://${env.hostname}:${env.port}`);
  console.log('==============================================================');
});
