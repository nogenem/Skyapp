export interface IClientInfo {
  socketId: string;
}
export interface IClientMap {
  [userId: string]: IClientInfo;
}
