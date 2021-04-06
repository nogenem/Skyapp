export const USER_STATUS = {
  ACTIVE: 1,
  AWAY: 2,
  DO_NOT_DISTURB: 3,
  INVISIBLE: 4,
} as const;
type TUserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

export type { TUserStatus };
