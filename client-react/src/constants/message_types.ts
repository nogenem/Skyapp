export const MESSAGE_TYPES = {
  TEXT: 1,
  UPLOADED_FILE: 2,
} as const;
type TMessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES];

export type { TMessageType };
