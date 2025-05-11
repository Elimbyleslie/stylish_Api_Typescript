import yup from 'yup';

const passwordRules: RegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/;

export const createdUserSchema = yup.object({
  email: yup.string().email().required(),
  username: yup.string().required().min(2),
  fullname: yup.string().required(),
  profile: yup.string().email().nullable(),
  password: yup
    .string()
    .matches(passwordRules, { message: 'Please create a stronger password' })
    .required()
    .min(8) as yup.StringSchema,
  passwordConfirmation: yup
    .string()
    .oneOf([yup.ref('password')])
    .required(),
});
