export const MENU_STATES = {
  MAIN: 1,
  CHANGING_LANGUAGE: 2,
  CHANGING_USER_STATUS: 3,
  CHANGING_USER_THOUGHTS: 4,
} as const;
type TMenuStates = typeof MENU_STATES[keyof typeof MENU_STATES];

export type { TMenuStates };
