export interface IClientInfo {
  socketId: string;
  currentChannelId: string | undefined;
}
export interface IClientMap {
  [userId: string]: IClientInfo;
}
