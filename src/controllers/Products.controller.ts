import { ProductCreateDto } from '../dto/product.dto.js';
import prisma from '../models/prismaClient.js';
import ResponseApi from '../helpers/response.js';
import { UploadedFile } from 'express-fileupload';
import Utils from '../helpers/utils.js';
import { NextFunction, Request, Response } from 'express';

export const createProduct = async (req: Request<any, any, ProductCreateDto>, res: Response, next: NextFunction) => {
  const { name, description, categoryId,price } = req.body;

  try {
    const images = req.files ? (req.files.images as UploadedFile | UploadedFile[]) : [];

    const imagesPaths = await Utils.saveImages(images);

    const product = await prisma.product.create({
      data: {
        name,
        categoryId,
        description,
        price,
        images: JSON.stringify(imagesPaths),
      },
    });

    product.images = Utils.resolveFileUrls(req, imagesPaths);

    ResponseApi.success(res, 'Course created successfully !!!', 201, product);
  } catch (error) {
    next(error);
  }
};
export const getAllProduct = async (
  req: Request<
    any,
    any,
    any,
    {
      search: string;
      startDate: Date;
      endDate: Date;
      page: number;
      limit: number;
    }
  >,
  res: Response,
  next: NextFunction,
) => {
  const { search, startDate, endDate } = req.query;

  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const offset = (+page - 1) * +limit;
  try {
    const result = await prisma.product.findMany({
      skip: +offset,
      take: +limit,
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        AND: [
          search
            ? {
                name: {
                  contains: String(search),
                },
              }
            : {},
          startDate
            ? {
                createdAt: {
                  gte: new Date(startDate),
                },
              }
            : {},
          endDate
            ? {
                createdAt: {
                  lte: new Date(endDate),
                },
              }
            : {},
        ],
      },
    });

    const total = await prisma.product.count({
      where: {
        AND: [
          search
            ? {
                name: {
                  contains: String(search),
                },
              }
            : {},
          startDate
            ? {
                createdAt: {
                  gte: new Date(startDate),
                },
              }
            : {},
          endDate
            ? {
                createdAt: {
                  lte: new Date(endDate),
                },
              }
            : {},
        ],
      },
    });

    ResponseApi.success(res, 'courses retrieved successfuly', 200, {
      courses: result,
      pagination: {
        limit: limit,
        previousPage: +page - 1 ? +page - 1 : null,
        currentPage: page,
        nextPage: +page < Math.ceil(total / +limit) ? +page + 1 : null,
        totalPage: limit ? Math.ceil(total / +limit) : 1,
        totalItems: total,
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    if (!id) {
      console.log('id is missing');
      return ResponseApi.error(res, 'id is missing!!!', 404);
    }
    const result = await prisma.product.findFirst({
      where: {
        id: id,
      },
    });
    if (!result) ResponseApi.error(res, 'Course not found!!!', 404);
    else {
      return ResponseApi.success(res, 'product was successfuly found!!!', 200, result);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const courses = await prisma.product.findFirst({
      where: {
        id: id,
      },
    });

    if (!courses) {
      return ResponseApi.error(res, 'Course not found', 404);
    }

    const result = await prisma.product.update({
      where: {
        id: id,
      },
      data,
    });
    ResponseApi.success(res, ' product updated successfully', 200, result);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
//adddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
export const destroyProduct = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const courses = await prisma.product.findFirst({
      where: {
        id: id,
      },
    });
    if (!courses) {
      return ResponseApi.error(res, 'Course not found', 404);
    }
    const result = await prisma.product.delete({
      where: {
        id: id,
      },
    });
    ResponseApi.success(res, ' product deleted successfully', 200, result);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
