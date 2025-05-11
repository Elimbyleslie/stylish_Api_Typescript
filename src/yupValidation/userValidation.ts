import * as yup from 'yup';
export const userSchema = yup.object().shape({
  userName: yup.string().required('name is required'),
  email: yup.string().email('invalid email').required('email is required'),
  password: yup
    .string()
    .min(6, 'password must be at least 6 characters long')
    .matches(/[A-Z]/, 'password must contain at least one uppercase')
    .matches(/\d/, 'password must be contain at least one number')
    .matches(/[!@#$%^&*(),.<>;:{}]/, 'password must contain at least one special character')
    .required('password is required'),
});
