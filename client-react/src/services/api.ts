import axios from 'axios';

import { ICredentials } from '~/redux/user/types';

export const END_POINTS = {
  auth: {
    signup: 'api/auth/signup',
  },
};

export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_API_URL,
});

export default {
  auth: {
    signup: (credentials: ICredentials) =>
      axiosInstance
        .post(END_POINTS.auth.signup, { ...credentials })
        .then(res => res.data),
  },
};
