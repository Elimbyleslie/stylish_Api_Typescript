import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { UploadedFile } from 'express-fileupload';
import { format, parseISO } from 'date-fns';
import { Request, Response } from 'express';

// Conversion de __filename et __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
class Utils {
  static formatErrorValidation = (error: Record<string, any> = {}) => {
    const errors = error.inner.reduce((acc: Record<string, any>, err: Record<string, any>) => {
      if (err.path && !acc[err.path]) {
        acc[err.path] = err.message;
      }
      return acc;
    }, {});
    return errors;
  };

  static successReponse = (res: Response, message: string, data: any, status: number = 200) => {
    return res.status(status).json({
      meta: {
        status,
        message,
      },
      data: data,
    });
  };

  static successResponse = (code: number, message: string, data: any) => {
    return {
      meta: {
        status: code,
        message,
      },
      data,
    };
  };

  static errorResponse = (code: number, message: string, error?: any) => {
    return {
      meta: {
        status: code,
        message,
      },
      error,
    };
  };

  static fileExists = async (path: string) => {
    return !!(await fs.promises.stat(path).catch(() => {
      return false;
    }));
  };

  static saveFile = async (file: Record<string, any>, savePath: string) => {
    try {
      const name: string = Date.now() + '.' + file.mimetype.split('/')[1];

      if (fs.existsSync(savePath)) {
        await file.mv(path.join(savePath, name));
        return `/uploads/${name}`;
      } else {
        throw new Error('The directory does not exist');
      }
    } catch (error) {
      console.log('err', error);
      throw new Error('Failed to save file in the folder.');
    }
  };

  /**
   * Saves multiple images in the "uploads" folder and returns their paths.
   * @param files - Files sent via express-fileupload.
   * @param uploadDir - Destination folder for images (default: "uploads").
   * @returns Promise<string[]> - Array of saved image paths.
   */
  static async saveImages(files: UploadedFile | UploadedFile[], uploadDir: string = 'uploads'): Promise<string[]> {
    try {
      const _uploadDir = path.join(__dirname, '../..', `public/${uploadDir}`);
      // Ensure the upload directory exists
      await fsp.mkdir(_uploadDir, { recursive: true });

      // Normalize files input to an array
      const imageFiles: UploadedFile[] = Array.isArray(files) ? files : [files];
      const savedPaths: string[] = [];

      // Process and save each image
      for (const image of imageFiles) {
        const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}${path.extname(image.name)}`;
        const filePath = path.join(_uploadDir, filename);

        await image.mv(filePath); // Move file asynchronously
        savedPaths.push(`/${uploadDir}/${filename}`); // Save relative path
      }

      return savedPaths;
    } catch (error) {
      throw new Error(`Failed to save images: ${(error as Error).message}`);
    }
  }

  static resolveFileUrl(req: Request, relativePath: string): string {
    if (relativePath.startsWith('data') || relativePath.startsWith('https') || relativePath.startsWith('http')) {
      return relativePath;
    } else {
      return `${req.protocol}://${req.get('host')}/public${relativePath}`;
    }
  }

  static resolveFileUrls(req: Request, relativePaths: string[]): string[] {
    return relativePaths.map((relativePath) => {
      const url = this.resolveFileUrl(req, relativePath);
      return url;
    });
  }

  static cleanObject = (obj: Record<string, any>): Record<string, any> => {
    return Object.keys(obj).reduce((acc: Record<string, any>, key: string) => {
      // Utilise trim() pour nettoyer les clés et les valeurs
      acc[key.trim()] = typeof obj[key] === 'string' ? obj[key].trim() : obj[key];
      return acc;
    }, {});
  };

  static formatDate(date: string | Date): string {
    // Vérifie si la date est une chaîne de caractères et la convertit en objet Date
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'yyyy-MM-dd HH:mm:ss');
  }

  static generateRandomInteger = (min = 1000, max = 10000) => {
    return Math.floor(min + Math.random() * (max - min + 1));
  };

  static generatePasswordHash = async (password: string) => {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  };
}

// const crypto = require("crypto")
//  crypto.createHash('sha256').update("getsmarter").digest('hex')
// '9f2ee7a068b33033b44802c4dc88062a279291ccb57ed1d39f4e24c93329e2e5'
//  crypto.createHash('sha256').update("getsmarter-refresh").digest('hex')
// '4f68905fe736ef33d3458af360f3486799940f0f3833ce33fe81c5fba8593e16'

export default Utils;
