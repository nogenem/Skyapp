import axios from 'axios';

import type {
  ISignUpCredentials,
  ISignInCredentials,
} from '~/redux/user/types';

export const END_POINTS = {
  auth: {
    signup: 'api/auth/signup',
    signin: 'api/auth/signin',
  },
};

export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_API_URL,
});

export default {
  auth: {
    signup: (credentials: ISignUpCredentials) =>
      axiosInstance
        .post(END_POINTS.auth.signup, { ...credentials })
        .then(res => res.data),
    signin: (credentials: ISignInCredentials) =>
      axiosInstance
        .post(END_POINTS.auth.signin, { ...credentials })
        .then(res => res.data),
  },
};
