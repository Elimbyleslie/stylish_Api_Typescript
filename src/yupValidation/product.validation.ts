import * as yup from 'yup';
import { UploadedFile } from 'express-fileupload';


export const productSchema = yup.object().shape({
  name: yup.string().required('Name is required').max(100, "Name can't be longer than 100 characters"),
  price: yup.string().required('Price is required'),
  description: yup.string().max(500, "Description can't be longer than 500 characters"),
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
  categoryId: yup.string().required('Veuillez selectionner une catégory.'),
  userId: yup.string().required('Veuillez selectionner une catégory.'),
});
