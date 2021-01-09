import { Dispatch } from 'redux';

export const signin = () => (dispatch: Dispatch) => {};

export interface ICredentials {
  nickname: string;
  email: string;
  password: string;
  password_confirmation: string;
}
export const signup = (credentials: ICredentials) => (dispatch: Dispatch) => {
  console.log('credentials', credentials);
};
