import multer, { ErrorCode } from 'multer';

import parseMulterErrors from '~/utils/parseMulterErrors';

// Got from Multer
const EMulterErrorCodes: { [key: string]: ErrorCode } = {
  LIMIT_PART_COUNT: 'LIMIT_PART_COUNT',
  LIMIT_FILE_SIZE: 'LIMIT_FILE_SIZE',
  LIMIT_FILE_COUNT: 'LIMIT_FILE_COUNT',
  LIMIT_FIELD_KEY: 'LIMIT_FIELD_KEY',
  LIMIT_FIELD_VALUE: 'LIMIT_FIELD_VALUE',
  LIMIT_FIELD_COUNT: 'LIMIT_FIELD_COUNT',
  LIMIT_UNEXPECTED_FILE: 'LIMIT_UNEXPECTED_FILE',
};

describe('parseMulterErrors', () => {
  it('should return an object with the errors from Multer', async () => {
    let multerError = new multer.MulterError(EMulterErrorCodes.LIMIT_FILE_SIZE);
    let errors = parseMulterErrors(multerError);
    expect(errors.length).toBe(1);
    expect(errors[0].global).toBeTruthy();

    multerError = new multer.MulterError(EMulterErrorCodes.LIMIT_FILE_COUNT);
    errors = parseMulterErrors(multerError);
    expect(errors.length).toBe(1);
    expect(errors[0].global).toBeTruthy();

    multerError = new multer.MulterError(EMulterErrorCodes.LIMIT_FIELD_COUNT);
    errors = parseMulterErrors(multerError);
    expect(errors.length).toBe(2);
    expect(errors[0].global).toBeTruthy();
    expect(errors[1]).toBe(500);
  });
});
