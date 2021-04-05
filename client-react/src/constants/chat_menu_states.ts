export const MENU_STATES = {
  MAIN: 1,
  CHANGING_LANGUAGE: 2,
} as const;
type TMenuStates = typeof MENU_STATES[keyof typeof MENU_STATES];

export type { TMenuStates };
