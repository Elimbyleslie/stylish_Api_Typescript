import { UploadedFile } from 'express-fileupload';
import yup, { AnySchema } from 'yup';

export const createCategorySchema: AnySchema = yup.object({
  name: yup.string().required(),
  description: yup.string(),
  images: yup.mixed<UploadedFile>().required("L'image est obligatoire")
  .test(
    'fileType',
    'Format non supporté (seuls PNG, JPEG, JPG autorisés)',
    (value: UploadedFile) =>  value && ['image/jpg', 'image/jpeg', 'image/png'].includes(value.mimetype )
    
  )
  .test(
    'fileSize',
    'Taille maximale de 5MB',
    (value) => value && value.size <= 5 * 1024 * 1024 // 5MB
  ),
});
