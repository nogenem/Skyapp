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
export const INVALID_USER_STATUS = 'Invalid user status';
export const CHANNEL_ALREADY_EXISTS = 'Channel already exists';
export const NEED_AT_LEAST_2_MEMBERS_TO_CREATE_GROUP =
  'You need at least 2 members to create a group';
export const USER_IS_NOT_GROUP_ADM =
  'You are not an administrator of this group';
export const NOT_MEMBER_OF_GROUP = 'You are not a member of this group';
export const OFFSET_HAS_TO_BE_A_NUMBER_GREATER_OR_EQUAL_TO_0 =
  '`Offset` query param has to be a number greater or equal to 0';
export const FIELD_CANT_BE_EMPY = 'Field cant be empty';

export type { TTranslatableError };
