import bcrypt from 'bcrypt';
import prisma from '../models/prismaClient.js';
import ResponseApi from '../helpers/response.js';
import { NextFunction, Request, Response } from 'express';

export const getAllUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await prisma.user.findMany({});
    ResponseApi.success(res, 'Categories retrieved successfully !!!', 200, result);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  const { id }: any = req.params;
  try {
    if (!id)
      res.status(422).json({
        message: 'Id is missing !!!',
        data: null,
      });
    const result = await prisma.user.findFirst({
      where: {
        id: id,
      },
    });
    if (!result)
      res.status(404).json({
        message: 'User not found!!!',
        data: null,
      });

    res.status(200).json({
      message: 'User retrieved successfully !!!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const data = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.username }, { userName: data.username }],
      },
    });
    if (user) ResponseApi.error(res, 'User already exists', 409);

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(data.password, salt);
    data.password = hash;

    delete data.passwordConfirmation;
    const result = await prisma.user.create({ data });
    ResponseApi.success(res, 'User created successfully !!!', 201, result);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: any, res: any, next: any) => {
  const { id }: any = req.params;
  const data: string = req.body;

  try {
    if (!id)
      res.status(422).json({
        message: 'Id is missing !!!',
        data: null,
      });
    const result = await prisma.user.update({
      where: {
        id: id,
      },
      data,
    });

    if (!result) ResponseApi.error(res, 'Course not found !!!', 404);
    res.status(200).json({
      message: 'User updated successfully !!!',
      data: result ? result : null,
    });
  } catch (error) {
    next(error);
  }
};

export const destroyUser = async (req: any, res: any, next: any) => {
  const { id }: any = req.params;

  try {
    if (!id)
      res.status(422).json({
        message: 'Id is missing !!!',
        data: null,
      });
    const result = await prisma.user.findFirst({
      where: {
        id: id,
      },
    });
    await prisma.user.delete({
      where: {
        id: id,
      },
    });
    res.status(200).json({
      message: 'User deleted successfully !!!',
      data: result ? result : null,
    });
  } catch (error) {
    next(error);
  }
};

// export const createUser = async (
//   req: Request<{}, {}, { username: string; password: string; passwordConfirmation: string; email: string}>,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const data1 = req.body;

//   try {

//     const user = await prisma.user.findFirst({
//       where: {
//         OR: [{ email: data1.email }, { username: data1.username }],
//       },
//     });
//     if (user) ResponseApi.error(res, 'User already exists', 409);
//     if (!data1.password)
//       ResponseApi.error(res, 'Password is required', 400);

//     if (data1.password !== data1.passwordConfirmation)
//       ResponseApi.error(res, 'Passwords do not match', 400);

//     const data : string = req.body.password;
//     const saltRounds: number = 10;
//     const salt = await bcrypt.genSalt(saltRounds);
//     const hash = await bcrypt.hash(data, salt);

//     if (!data || !salt) {
//       res.status(404).json({ message: " data and salt argumens are required" });
//     }

//     const result = await prisma.user.create({
//       data: {
//         email: data1.email,
//         password: hash ,
//         username: data1.username
//       },
//     });
//     ResponseApi.success(res, 'User created successfully !!!', 201, result);
//   } catch (error) {
//     next(error);
//   }
// };
