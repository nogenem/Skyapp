type TTranslatableError = { msg: string; params: Record<string, unknown> };

export const INVALID_EMAIL = 'Invalid email';
export const PASSWORDS_MUST_MATCH = 'Passwords must match';
export const fieldIsTooShort = (n: number): TTranslatableError => ({
  msg: 'This field must have at least {{count}} characters',
  params: { count: n },
});
export const INTERNAL_SERVER_ERROR = 'Internal server error';
export const EMAIL_ALREADY_TAKEN = 'This email is already taken';
export const INVALID_ID = 'Invalid id';
export const ROUTE_NOT_FOUND_ERROR = 'Route not found';
export const INVALID_CREDENTIALS = 'Invalid credentials';
export const INVALID_EXPIRED_TOKEN = 'Invalid or expired token';
export const LAST_EMAIL_SENT_IS_STILL_VALID =
  'The last email sent is still valid. Please, check your email account';
export const NO_USER_WITH_SUCH_EMAIL = 'There is no user with such email';
export const NO_TOKEN = 'Token not provided';

export type { TTranslatableError };
