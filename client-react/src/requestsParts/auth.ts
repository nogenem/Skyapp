interface ISignUpRequestBody {
  nickname: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

interface ISignInRequestBody {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface IConfirmationRequestBody {
  token: string;
}

interface IResendConfirmationRequestBody {
  token: string;
}

interface IValidateTokenRequestBody {
  token: string;
}

interface IForgotPasswordRequestBody {
  email: string;
}

interface IResetPasswordRequestBody {
  newPassword: string;
  newPasswordConfirmation: string;
  token: string;
}

export type {
  ISignUpRequestBody,
  ISignInRequestBody,
  IConfirmationRequestBody,
  IResendConfirmationRequestBody,
  IValidateTokenRequestBody,
  IForgotPasswordRequestBody,
  IResetPasswordRequestBody,
};
