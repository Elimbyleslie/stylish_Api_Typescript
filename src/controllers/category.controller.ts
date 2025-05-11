import { CategoryCreateDto } from '../dto/category.dto.js';
import prisma from '../models/prismaClient.js';
import ResponseApi from '../helpers/response.js';
import { NextFunction, Request, Response } from 'express';
import Utils from '../helpers/utils.js';
import { UploadedFile } from 'express-fileupload';
/**
 * Create a new category.
 */

export const createCategory = async (req: Request<any, any, CategoryCreateDto>, res: Response, next: NextFunction) => {
  const { name } = req.body;

  try {
    const images = req.files ? (req.files.images as UploadedFile | UploadedFile[]) : [];

    const imagesPaths = await Utils.saveImages(images);

    const category = await prisma.category.create({
      data: {
        name,
        userId: req.user.id,
        images: JSON.stringify(imagesPaths),
      },
    });

    category.images = Utils.resolveFileUrls(req, imagesPaths);

    ResponseApi.success(res, 'Category created successfully !!!', 201, category);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve all categories with filter and pagination.
 */
export const getAllCategory = async (
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
    const result = await prisma.category.findMany({
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

    const total = await prisma.category.count({
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

    ResponseApi.success(res, 'Categories retrieved successfuly', 200, {
      categories: result,
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
    next(error);
  }
};

/**
 * Retrieve a catgory by ID.
 */
export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const category = await prisma.category.findFirst({
      where: {
        id: id,
      },
    });

    if (!category) ResponseApi.notFound(res, `Category with ID ${id} not found`);

    ResponseApi.success(res, 'Category updated successfuly !!!', 200, category);
  } catch (error) {
    next(error);
  }
};

/**
 * Update category by ID.
 */
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, image } = req.body;

  try {
    if (!id) ResponseApi.error(res, 'Id is missing !!!', 422);

    const category = await prisma.category.findFirst({
      where: {
        id: id,
      },
    });

    if (!category) ResponseApi.notFound(res, `Category with ID ${id} not found`);

    const result = await prisma.category.update({
      where: {
        id: id,
      },
      data: {
        name,
        images: image,
      },
    });

    ResponseApi.success(res, 'Category updated successfuly !!!', 200, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete category by ID.
 */
export const destroyCategory = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    if (!id) ResponseApi.error(res, 'Id is missing !!!', 422);

    const result = await prisma.category.findFirst({
      where: {
        id: id,
      },
    });

    await prisma.category.delete({
      where: {
        id: id,
      },
    });

    ResponseApi.success(res, 'Category deleted successfully !!!', 200, result);
  } catch (error) {
    if (error == 'P2003') ResponseApi.error(res, 'you cannot delete a category that already belongs to the course');
    next(error);
  }
};
