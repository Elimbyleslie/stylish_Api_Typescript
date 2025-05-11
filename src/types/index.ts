import Mail from 'nodemailer/lib/mailer';
import internal from 'stream';

export type ApiResponse<T> = {
  meta: {
    status: number;
    message: string;
  };
  data: T;
};

interface Meta {
  status: number;
  message: string;
}

export type ApiErrorResponse<T> = {
  meta: Meta;
  error: T;
};

export type EmailData = {
  email: string | Mail.Address | (string | Mail.Address)[] | undefined;
  subject: string;
  html: string | Buffer | internal.Readable | Mail.AttachmentLike | undefined;
};
