interface IFetchMessagesRequestParams {
  channelId: string;
}

interface IFetchMessagesRequestQuery {
  offset: number;
  limit?: number;
  sort?: string;
}

type IFetchMessagesRequest = IFetchMessagesRequestParams &
  IFetchMessagesRequestQuery;

interface IStoreMessageRequestParams {
  channelId: string;
}

interface IStoreMessageRequestBody {
  body: string;
}

type IStoreMessageRequest = IStoreMessageRequestParams &
  IStoreMessageRequestBody;

interface IStoreFilesRequestParams {
  channelId: string;
}

interface IStoreFilesRequestBody {
  files: FormData;
}

type IStoreFilesRequest = IStoreFilesRequestParams & IStoreFilesRequestBody;

interface IUpdateMessageBodyRequestParams {
  channelId: string;
  messageId: string;
}

interface IUpdateMessageBodyRequestBody {
  newBody: string;
}

type IUpdateMessageBodyRequest = IUpdateMessageBodyRequestParams &
  IUpdateMessageBodyRequestBody;

interface IDeleteMessageRequestParams {
  channelId: string;
  messageId: string;
}

export type {
  IFetchMessagesRequestParams,
  IFetchMessagesRequestQuery,
  IFetchMessagesRequest,
  IStoreMessageRequestParams,
  IStoreMessageRequestBody,
  IStoreMessageRequest,
  IStoreFilesRequestParams,
  IStoreFilesRequestBody,
  IStoreFilesRequest,
  IUpdateMessageBodyRequestParams,
  IUpdateMessageBodyRequestBody,
  IUpdateMessageBodyRequest,
  IDeleteMessageRequestParams,
};
