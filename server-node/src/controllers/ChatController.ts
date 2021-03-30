import { Response } from 'express';

import type { IAuthRequest } from '~/middlewares/auth';

export default {
  // TODO: Remove later
  async test(req: IAuthRequest, res: Response): Promise<Response<unknown>> {
    return res.status(200).json({
      user: req.currentUser,
    });
  },
};
