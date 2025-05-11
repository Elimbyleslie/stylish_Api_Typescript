import * as yup from 'yup';

export const updateFcmTokenValidation = yup.object({
  id: yup.string().required(),
  fcmToken: yup.string().required(),
});
