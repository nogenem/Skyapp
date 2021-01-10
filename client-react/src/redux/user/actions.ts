import { Dispatch } from 'redux';

interface ICredentials {
  nickname: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export const signin = () => (dispatch: Dispatch) => {};

export const signup = (credentials: ICredentials) => (dispatch: Dispatch) => {
  console.log('credentials', credentials);
};

export type { ICredentials };
