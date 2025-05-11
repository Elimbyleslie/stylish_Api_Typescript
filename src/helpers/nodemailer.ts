import { EmailData } from '../types/index.js';
import env from '../config/env.js';
import { ErrorResponse } from './errorReponse.js';
import nodemailer from 'nodemailer';

class Email {
  private static transporter = nodemailer.createTransport({
    host: env.mailHost,
    port: parseInt(env.mailPort, 10),
    secure: env.mailSecure === 'true',
    auth: {
      user: env.mailUser, // L'adresse email à utiliser
      pass: env.mailPassword, // Le mot de passe ou un App Password pour plus de sécurité
    },
  });

  static sendEmail = async (data: EmailData) => {
    try {
      await this.transporter.sendMail({
        from: env.mailUser,
        to: data.email,
        subject: data.subject,
        html: data.html,
      });
    } catch (error: any) {
      // Gestion spécifique des erreurs Nodemailer
      if (error.code === 'EAUTH') {
        throw new ErrorResponse(401, "Erreur d'authentification : vérifiez vos identifiants d'email.");
      } else if (error.code === 'ECONNECTION') {
        throw new ErrorResponse(403, 'Erreur de connexion : impossible de se connecter au serveur SMTP.');
      } else if (error.responseCode === 550) {
        throw new ErrorResponse(404, 'Adresse email invalide ou refusée par le serveur.');
      } else {
        throw new ErrorResponse(500, "Une erreur inconnue s'est produite lors de l'envoi de l'email.");
      }
    }
  };
}

export default Email;
