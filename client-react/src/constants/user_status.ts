export const USER_STATUS = {
  ACTIVE: 1,
  AWAY: 2,
  DO_NOT_DISTURB: 3,
  INVISIBLE: 4,
} as const;

export const USER_STATUS_2_TEXT = {
  [USER_STATUS.ACTIVE]: 'Active',
  [USER_STATUS.AWAY]: 'Away',
  [USER_STATUS.DO_NOT_DISTURB]: 'Do not disturb',
  [USER_STATUS.INVISIBLE]: 'Invisible',
} as const;

type TUserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

export type { TUserStatus };
