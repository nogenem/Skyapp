import { TUserStatus } from '~/constants/user_status';

interface IChangeStatusRequestBody {
  newStatus: TUserStatus;
}

interface IChangeThoughtsRequestBody {
  newThoughts: string;
}

export type { IChangeStatusRequestBody, IChangeThoughtsRequestBody };
