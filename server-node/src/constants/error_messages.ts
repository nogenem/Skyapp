type TTranslatableError = { msg: string; params: Record<string, unknown> };

export const INVALID_EMAIL = 'Invalid email';
export const PASSWORDS_MUST_MATCH = 'Passwords must match';
export const fieldIsTooShort = (n: number): TTranslatableError => ({
  msg: 'This field must have at least {{count}} character',
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
export const groupHasTooFewMembers = (n: number): TTranslatableError => ({
  msg: 'You need at least {{count}} member to create a group',
  params: { count: n },
});
export const USER_IS_NOT_GROUP_ADM =
  'You are not an administrator of this group';
export const NOT_MEMBER_OF_GROUP = 'You are not a member of this group';
export const OFFSET_HAS_TO_BE_A_NUMBER_GREATER_OR_EQUAL_TO_0 =
  '`Offset` query param has to be a number greater or equal to 0';
export const FIELD_CANT_BE_EMPY = 'Field cant be empty';
export const uploadIsTooBig = (n: number): TTranslatableError => ({
  msg: "Can't upload files bigger than {{count}}MB",
  params: { count: n },
});
export const uploadHasTooManyFiles = (n: number): TTranslatableError => ({
  msg: "Can't upload more than {{count}} file at the same time",
  params: { count: n },
});
export const CANT_EDIT_THIS_MESSAGE = "You can't edit this message";
export const CANT_UPDATE_THIS_GROUP_CHANNEL =
  "You can't update this group channel";
export const CANT_LEAVE_THIS_CHANNEL = "You can't leave this channel";
export const CANT_DELETE_THIS_MESSAGE = "You can't delete this message";

export type { TTranslatableError };
