import prisma from '../models/prismaClient.js';
import ResponseApi from '../helpers/response.js';

const checkPermission = (permissionKey) => {
  return async (req, res, next) => {
    const userId = req.user.id;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        return ResponseApi.error(res, 'User not found', 404);
      }

      const userPermissions = user.roles.flatMap((userRole) => {
        return userRole.role.permissions.map((permission) => {
          return permission.permission.name;
        });
      });

      if (!userPermissions.includes(permissionKey)) {
        return ResponseApi.error(res, 'Forbidden: You do not have the required permission', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default checkPermission;
