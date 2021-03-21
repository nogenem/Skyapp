import handleServerErrors from '../handleServerErrors';
import type {
  IServerErrorsObject,
  IPartialAxiosError,
} from '../handleServerErrors';

const mockServerResponse = (
  errors: IServerErrorsObject,
): IPartialAxiosError => ({
  response: {
    data: {
      errors,
    },
  },
});

describe('handleServerErrors', () => {
  it('returns the errors correctly when passing strings', () => {
    const err = mockServerResponse({
      global: 'Internal server error',
      email: 'Invalid email',
    });
    const errors = handleServerErrors(err);

    expect(errors.global).toBe('Internal server error');
    expect(errors.email).toBe('Invalid email');
  });

  it('returns the errors correctly when passing arrays', () => {
    const err = mockServerResponse({
      global: ['Invalid token', 'Internal server error'],
      email: ['Cant be blank', 'Invalid email'],
    });
    const errors = handleServerErrors(err);

    expect(errors.global).toBe('Invalid token');
    expect(errors.email).toBe('Cant be blank');
  });

  it('returns `Internal server error` when passing an invalid error', () => {
    const err = {};
    const errors = handleServerErrors(err);

    expect(errors.global).toBe('Internal server error');
  });
});
