import axios from 'axios';

import type {
  ISignUpCredentials,
  ISignInCredentials,
} from '~/redux/user/types';

export const END_POINTS = {
  auth: {
    signUp: 'api/auth/signup',
    signIn: 'api/auth/signin',
  },
};

export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_API_URL,
});

export default {
  auth: {
    signUp: (credentials: ISignUpCredentials) =>
      axiosInstance
        .post(END_POINTS.auth.signUp, { ...credentials })
        .then(res => res.data),
    signIn: (credentials: ISignInCredentials) =>
      axiosInstance
        .post(END_POINTS.auth.signIn, { ...credentials })
        .then(res => res.data),
  },
};
