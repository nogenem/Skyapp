interface IErrors {
  [x: string]: string;
}

interface IServerErrorsObject {
  [x: string]: string | string[];
}

interface IServerError {
  errors: IServerErrorsObject;
}

interface IPartialAxiosError {
  response?: {
    data: IServerError;
  };
}

// TODO: Think a way to translate the errors coming from the server
export default (err: IPartialAxiosError): IErrors => {
  if (
    !err ||
    !err.response ||
    !err.response.data ||
    !err.response.data.errors
  ) {
    if (process.env.NODE_ENV !== 'test') console.error(err);
    return { global: 'Internal server error' };
  }

  const { errors } = err.response.data;
  const ret = {} as IErrors;

  Object.keys(errors).forEach((key: string) => {
    const error: string = (
      Array.isArray(errors[key]) ? errors[key][0] : errors[key]
    ) as string;
    ret[key] = error;
  });
  return ret;
};

export type { IErrors, IServerErrorsObject, IServerError, IPartialAxiosError };
