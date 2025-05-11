export type ProductCreateDto = {
  name: string;
  categoryId: string;
  description?: string;
  price: number;
  image: string;
};
