import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

import Utils from '../src/helpers/utils.js';
const prisma = new PrismaClient();

// Types
interface User {
  id: string;
  fullName: string;
  userName: string;
  email: string;
  password: string;
  profilePicture?: string;
  otp?: string;
  secretOtp?: string;
  fcmToken?: string;
  isVerified: boolean;
}

interface Image {
  url: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  short_description?: string;
  images: {
    create: Image[];
  };
  categoryId: string;
  userId: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  userId: string;
}

async function main() {
  const permissions = [
    // Category permissions
    {
      name: 'CATEGORY_GET_ALL',
      description: 'description 1',
    },
    {
      name: 'CATEGORY_GET_BY_ID',
      description: 'description 2',
    },
    {
      name: 'CATEGORY_CREATE',
      description: 'description 2',
    },
    {
      name: 'CATEGORY_UPDATE',
      description: 'description 2',
    },
    {
      name: 'CATEGORY_DELETE',
      description: 'description 2',
    },

    // Product permissions
    {
      name: 'COURSE_GET_ALL',
      description: 'description 1',
    },
    {
      name: 'COURSE_GET_BY_ID',
      description: 'description 2',
    },
    {
      name: 'COURSE_CREATE',
      description: 'description 2',
    },
    {
      name: 'COURSE_UPDATE',
      description: 'description 2',
    },
    {
      name: 'COURSE_DELETE',
      description: 'description 2',
    },

    // Role permissions
    {
      name: 'ROLE_GET_ALL',
      description: 'description 1',
    },
    {
      name: 'ROLE_GET_BY_ID',
      description: 'description 2',
    },
    {
      name: 'ROLE_CREATE',
      description: 'description 2',
    },
    {
      name: 'ROLE_UPDATE',
      description: 'description 2',
    },
    {
      name: 'ROLE_DELETE',
      description: 'description 2',
    },
    {
      name: 'ASSIGN_ROLE_TO_USER',
      description: 'description 2',
    },

    //  permissions
    {
      name: 'PERMISSION_GET_ALL',
      description: 'description 1',
    },
    {
      name: 'PERMISSION_GET_BY_ID',
      description: 'description 2',
    },
    {
      name: 'PERMISSION_CREATE',
      description: 'description 2',
    },
    {
      name: 'PERMISSION_UPDATE',
      description: 'description 2',
    },
    {
      name: 'PERMISSION_DELETE',
      description: 'description 2',
    },
    {
      name: 'ASSIGN_PERMISSION_TO_ROLE',
      description: 'description 2',
    },
  ];

  await permissions.forEach(async (item) => {
    await prisma.permission.upsert({
      where: {
        name: item.name,
      },
      update: {},
      create: {
        name: item.name,
        description: item.description,
      },
    });
  });

  const roles = [
    {
      name: 'SUPERADMIN',
      description: 'superadmin',
    },
    {
      name: 'ADMIN',
      description: 'Administrateur',
    },
    {
      name: 'USER',
      description: 'Simple user',
    },
    {
      name: 'STUDENT',
      description: 'student',
    },
  ];

  await prisma.role.createMany({
    data: roles,
    skipDuplicates: true,
  });

  const users = [
    {
      fullName: 'Nodem',
      userName: 'jires',
      email: 'nodemjires@gmail.com',
      isVerified: true,
      password: await Utils.generatePasswordHash('Get@.123'),
    },
    {
      fullName: 'Dev Mecano',
      userName: 'dev mecano',
      email: 'jiresnodem@gmail.com',
      isVerified: true,
      password: await Utils.generatePasswordHash('Get@.123'),
    },
    {
      fullName: 'Meranda',
      userName: 'Kingghost',
      email: 'louisMerande@gmail.com',
      isVerified: true,
      password: await Utils.generatePasswordHash('Get@.123'),
    },
  ];

  console.log('====================================');
  console.log('Debut de seeding de 03 utilisateurs');
  console.log('====================================');
  // Enregistrement des utilisateurs
  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  const _oldUsers = await prisma.user.findMany();

  // Fonction pour générer un utilisateur
  const generateUser = async (): Promise<User> => {
    const user: User = {
      id: faker.string.uuid(),
      fullName: `${faker.person.firstName()} ${faker.person.lastName()}`,
      userName: faker.internet.username(),
      email: faker.internet.email(),
      password: await Utils.generatePasswordHash('Get@.123'),
      profilePicture: faker.image.avatar(),
      isVerified: faker.datatype.boolean(),
    };

    return user;
  };

  const _roles = await prisma.role.findMany();
  const roleUserAssignements: {
    userId: string;
    roleId: string;
    assignedBy: string;
  }[] = [];

  console.log('====================================');
  console.log('Debut de seeding de 10 utilisateurs');
  console.log('====================================');
  // Générer 100 utilisateurs
  Promise.all(
    Array.from({ length: 10 }).map(() => {
      return generateUser();
    }),
  )
    .then(async (result) => {
      await prisma.user.createMany({
        data: result,
        skipDuplicates: true,
      });
    })
    .then(async () => {
      const _users = await prisma.user.findMany();

      // Assignation des roles de manière aléatoire aux utilisateurs (préparation)
      const indexAleatoire = Math.floor(Math.random() * _roles.length);
      const roleAleatoire = _roles[indexAleatoire];
      _users.forEach((user) => {
        roleUserAssignements.push({
          userId: user.id,
          roleId: roleAleatoire.id,
          assignedBy: users[0].fullName,
        });
      });
    });

  const _permissions = await prisma.permission.findMany();
  const _users = await prisma.user.findMany();
  const roleAdmin = await prisma.role.findFirst({
    where: {
      name: 'ADMIN',
    },
  });

  // Assignation du role Admin au 3 premiers utilisateurs (préparation)
  _roles.forEach((role) => {
    _oldUsers.forEach((user) => {
      roleUserAssignements.push({
        userId: user.id,
        roleId: role.id,
        assignedBy: users[0].fullName,
      });
    });
  });

  // Assignation des roles aux aux utilisateurs
  await prisma.usersOnRoles.createMany({
    data: roleUserAssignements,
    skipDuplicates: true,
  });

  // Assignation des permissions aux roles
  if (roleAdmin) {
    const permissionIds = _permissions.map((item) => {
      return item.id;
    });

    const assignments = permissionIds.map((permissionId) => {
      return {
        assignedBy: users[0].fullName,
        roleId: roleAdmin.id,
        permissionId: permissionId,
      };
    });

    await prisma.permissionsOnRoles.createMany({
      data: assignments,
      skipDuplicates: true,
    });
  }

  // const generatedCourseNames = new Set<string>(); // Set pour stocker les noms uniques générés

  // // Fonction pour générer un produit
  // const generateCourse = async (categoryId: string, userId: string): Promise<Course> => {
  //   let productName = faker.commerce.productName();

  //   // Vérifie que le nom généré n'existe pas déjà dans le Set
  //   while (generatedCourseNames.has(productName)) {
  //     productName = faker.commerce.productName(); // Si le nom existe déjà, génère un nouveau nom
  //   }

  //   // Ajoute le nom au Set pour garantir qu'il est unique
  //   generatedCourseNames.add(productName);

  //   const product: Product = {
  //     id: faker.string.uuid(),
  //     name: productName,
  //     price: parseFloat(faker.commerce.price()),
  //     quantity: faker.number.int({ min: 10, max: 100 }),
  //     short_description: faker.lorem.sentence(),
  //     images: {
  //       create: Array.from({ length: 2 }).map(() => ({
  //         url: faker.image.url({
  //           width: 300,
  //           height: 300,
  //         }),
  //         // url: faker.image.dataUri({
  //         //   width: 300,
  //         //   height: 300,
  //         // }),
  //       })),
  //     },
  //     categoryId: categoryId,
  //     userId: userId,
  //   };
  //   return product;
  // };

  // const generatedCategoryNames = new Set<string>(); // Set pour stocker les noms uniques générés

  // // Fonction pour générer une catégorie
  // const generateCategory = async (userId: string): Promise<Category> => {
  //   let categoryName = faker.commerce.department();

  //   // Vérifie que le nom généré n'existe pas déjà dans le Set
  //   while (generatedCategoryNames.has(categoryName)) {
  //     categoryName = faker.commerce.department(); // Si le nom existe déjà, génère un nouveau nom
  //   }

  //   // Ajoute le nom au Set pour garantir qu'il est unique
  //   generatedCategoryNames.add(categoryName);

  //   const category: Category = {
  //     id: faker.string.uuid(),
  //     name: categoryName,
  //     description: faker.lorem.sentence(),
  //     userId: userId,
  //   };

  //   return category;
  // };

  // console.log('====================================');
  // console.log('Début de seeding des categories');
  // console.log('====================================');
  // // Générer 10 catégories
  // Promise.all(Array.from({ length: 10 }).map(() => generateCategory(_users[0].id)))
  //   .then(async (result) => {
  //     const data = await prisma.category.createMany({
  //       data: result,
  //       skipDuplicates: true,
  //     });
  //   })
  //   .then(async () => {
  //     const _categories = await prisma.category.findMany();

  //     console.log('====================================');
  //     console.log('Début de seeding des produits par categorie');
  //     console.log('====================================');
  //     // Générer 100 produits pour cette catégorie
  //     _categories.forEach(async (category) => {
  //       Promise.all(Array.from({ length: 100 }).map(() => generateProduct(category.id, _users[0].id))).then(
  //         async (result) => {
  //           console.log('====================================');
  //           console.log('Category', category.name);
  //           console.log('====================================');
  //           result.forEach(async (product) => {
  //             await prisma.product.create({
  //               data: product,
  //             });
  //           });
  //         },
  //       );
  //     });
  //   });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
