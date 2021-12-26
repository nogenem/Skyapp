interface IStorePrivateChannelRequestBody {
  otherUserId: string;
}

interface IStoreGroupChannelRequestBody {
  name: string;
  members: string[];
  admins: string[];
}

interface IUpdateGroupChannelRequestParams {
  channelId: string;
}

interface IUpdateGroupChannelRequestBody {
  name: string;
  members: string[];
  admins: string[];
}

type IUpdateGroupChannelRequest = IUpdateGroupChannelRequestParams &
  IUpdateGroupChannelRequestBody;

interface ILeaveGroupChannelRequestParams {
  channelId: string;
}

export type {
  IStorePrivateChannelRequestBody,
  IStoreGroupChannelRequestBody,
  IUpdateGroupChannelRequestParams,
  IUpdateGroupChannelRequestBody,
  IUpdateGroupChannelRequest,
  ILeaveGroupChannelRequestParams,
};
