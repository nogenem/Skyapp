import multer from 'multer';

import {
  INTERNAL_SERVER_ERROR,
  uploadIsTooBig,
  uploadHasTooManyFiles,
} from '~/constants/error_messages';
import fileUploadLimits from '~/constants/file_upload_limits';

import type { IMsgObj, TMsgObjTypes } from './errors';

export default (err: multer.MulterError): [IMsgObj<TMsgObjTypes>, number?] => {
  // https://github.com/expressjs/multer/blob/master/lib/multer-error.js#L3
  if (err.code === 'LIMIT_FILE_SIZE')
    return [
      { global: uploadIsTooBig(fileUploadLimits.fileSize / 1024 / 1024) },
    ];
  if (err.code === 'LIMIT_FILE_COUNT')
    return [{ global: uploadHasTooManyFiles(fileUploadLimits.files) }];

  if (process.env.NODE_ENV !== 'test') console.error(err);
  return [{ global: INTERNAL_SERVER_ERROR }, 500];
};
