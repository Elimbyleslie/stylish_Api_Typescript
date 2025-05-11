import { addMinutes } from 'date-fns';
import bcrypt from 'bcrypt';
import Email from '../helpers/nodemailer.js';
import env from '../config/env.js';
import jwt from 'jsonwebtoken';
import prisma from '../models/prismaClient.js';
import speakeasy from 'speakeasy';
import { User } from '../models/user.js';
import Utils from '../helpers/utils.js';
import { ApiErrorResponse, ApiResponse } from '../types/index.js';
import { CreateUserDto, LoginUser } from '../dto/user.dto.js';
import { NextFunction, Request, Response } from 'express';

export class AuthUser {
  static register = async (
    req: Request<any, any, CreateUserDto>,
    res: Response<ApiResponse<Omit<User, 'password'>> | ApiErrorResponse<{}>>,
    next: NextFunction,
  ) => {
    const data = req.body;

    try {
      const existingUser = await prisma.user.findUnique({
        where: {
          email: data.email,
        },
      });

      if (existingUser) {
        res.status(409).json(Utils.errorResponse(409, 'User already exists'));
      }

      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(data.password, salt);
      data.password = hash;

      // Générer un secret pour l'OTP
      const secretKey = speakeasy.generateSecret({ name: data.email }).base32;

      // Générer un OTP avec une durée de validité de 5 minutes (300 secondes)
      const otp = speakeasy.totp({
        secret: secretKey,
        encoding: 'base32',
        digits: 5,
      });

      data.profilePicture = `/uploads/profile_picture`;

      const user = await prisma.user.create({
        data: { ...data, otp: otp, secretOtp: secretKey },
      });

      const html = `<h1>Confirm your Registration account !!!</h1>
              <p>Use this opt code to confirm your account</p>
              <p>Expiration time : 5 minutes</p>
              <p>Otp Code : <strong>${otp}</strong></p>
              <p>Thanks</p>`;

      await Email.sendEmail({
        email: data.email,
        subject: 'Validate our account',
        html,
      });

      user.otp = '';
      user.password = '';
      user.fcmToken = '';

      res.status(201).json(Utils.successResponse(201, 'User created successfully', user));
    } catch (error) {
      next(error);
    }
  };

  static resendOtp = async (req: Request, res: Response) => {
    const { email } = req.body;

    const data = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!data) {
      res.status(409).json(Utils.errorResponse(404, 'This user does not exist !!!'));
      return;
    }

    // Générer un secret pour l'OTP
    const secretKey = speakeasy.generateSecret({ name: data.email }).base32;

    // Générer un OTP avec une durée de validité de 5 minutes (300 secondes)
    const otp = speakeasy.totp({
      secret: secretKey,
      encoding: 'base32',
      digits: 5,
    });

    // Marquer comme vérifié
    const userVerified = await prisma.user.update({
      where: { id: data.id },
      data: {
        otp,
        secretOtp: secretKey,
        isVerified: false,
      },
    });

    const html = `<h1>Confirm your Registration account !!!</h1>
            <p>Use this opt code to confirm your account</p>
            <p>Expiration time : 5 minutes</p>
            <p>Otp Code : <strong>${otp}</strong></p>
            <p>Thanks</p>`;

    await Email.sendEmail({
      email: data.email,
      subject: 'Validate our account',
      html,
    });

    res.status(201).json(Utils.successResponse(201, 'Otp resend successfully', userVerified));
  };

  static verifyOtp = async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) {
      res.status(409).json(Utils.errorResponse(404, 'This user does not exist !!!'));
      return;
    }

    // Vérifier si l'OTP est dans le store
    if (!user.otp) {
      res.status(400).json({ message: 'OTP not found or expired' });
      return;
    }

    // Vérifier l'OTP reçu avec celui stocké
    const isValid = speakeasy.totp.verify({
      secret: user.secretOtp || '',
      encoding: 'base32',
      token: otp,
      digits: 5,
      window: 10, // Fenêtre de 10 intervalles (300 secondes soit 5 minutes)
    });

    if (isValid) {
      // Marquer comme vérifié
      const userVerified = await prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          secretOtp: null,
        },
      });
      res.status(200).json(Utils.successResponse(201, 'OTP verified successfully', userVerified));
    } else {
      res.status(400).json(Utils.errorResponse(400, 'Invalid OTP'));
      return;
    }
  };

  static login = async (
    req: Request<any, any, LoginUser>,
    res: Response<ApiResponse<{ user: Omit<User, 'password'>; token: {} }> | ApiErrorResponse<{}>>,
    next: NextFunction,
  ) => {
    const data = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { email: data.email },
        include: {
          roles: {
            // Include the UsersOnRoles relation
            include: {
              role: {
                // Include the Role model
                include: {
                  permissions: {
                    // Include the PermissionsOnRoles relation
                    include: {
                      permission: true, // Include the Permission model
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        res.status(400).json(Utils.errorResponse(400, 'This user does not exist !!'));
        return;
      }

      const match = await bcrypt.compare(data.password, user.password);

      if (!match) {
        res.status(401).json(Utils.errorResponse(401, 'Unauthenticated !!!', {}));
        return;
      }

      const accessToken = jwt.sign(
        {
          user: { id: user.id, email: user.email, userName: user.userName },
        },
        env.accessTokenSecretKey,
        { expiresIn: +env.accessTokenSecretKeyExpireIn },
      );

      const refreshToken = jwt.sign(
        {
          user: { id: user.id, email: user.email, userName: user.userName },
        },
        env.refreshTokenSecretKey,
        { expiresIn: +env.refreshTokenSecretKeyExpireIn },
      );

      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 24 * 60 * 60 * 1000, // 01 jour
      });

      user.password = '';
      user.otp = null;

      // Extract role names and their associated permissions
      const roles = user.roles.map((userRole) => {
        return userRole.role.name;
      });

      const permissions = user.roles.map((userRole) => {
        {
          return userRole.role.permissions.map((rolePermission) => {
            return rolePermission.permission.name;
          });
        }
      });

      res.status(200).json(
        Utils.successResponse(201, 'User authenticated successfully !!!', {
          user,
          roles: roles,
          permissions: permissions.flat(),
          token: {
            type: 'Bearer',
            accessToken,
            // refreshToken,
            expiresIn: Math.floor(addMinutes(Date.now(), +env.accessTokenSecretKeyExpireIn).getTime() / 1000),
          },
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  static refreshToken = async (
    req: Request<{}, {}, { refresh_token: string }>,
    res: Response<ApiResponse<{ user: Omit<User, 'password'>; token: {} }> | ApiErrorResponse<{}>>,
    next: NextFunction,
  ) => {
    const { cookies } = req;

    try {
      if (!cookies?.jwt) {
        res.status(401).json(Utils.errorResponse(401, 'Not cookies or refresh token yet.', {}));
        return;
      }

      const refreshToken = cookies.jwt;

      const decoded = jwt.verify(refreshToken, env.refreshTokenSecretKey);
      if (!decoded) {
        res.status(401).json(Utils.errorResponse(401, 'invalid token', {}));
        return;
      }

      let user = null;
      if (typeof decoded === 'object' && decoded.user && decoded.user?.id) {
        user = await prisma.user.findFirst({
          where: {
            id: decoded.user?.id,
          },
        });
      }

      if (!user) {
        res.status(403).json(Utils.errorResponse(403, 'Forbiden'));
        return;
      }

      const accessToken = jwt.sign(
        {
          user: { id: user.id, email: user.email, fullName: user.fullName },
        },
        env.accessTokenSecretKey,
        { expiresIn: env.accessTokenSecretKeyExpireIn },
      );

      res.status(200).json(
        Utils.successResponse(200, 'Token resfresh successfuly !!!', {
          token: {
            type: 'Bearer',
            accessToken,
          },
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  static logout = (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
      });

      res.status(200).json(Utils.successResponse(200, 'User logged out successfully.', {}));
      return;
    } catch (error) {
      next(error);
    }
  };
}
