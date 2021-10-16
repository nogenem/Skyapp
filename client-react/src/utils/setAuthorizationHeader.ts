import { axiosInstance } from '~/services/ApiService';

export default (token?: string) => {
  if (token) {
    axiosInstance.defaults.headers.common.authorization = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common.authorization;
  }
};
