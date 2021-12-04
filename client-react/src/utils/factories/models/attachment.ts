import faker from 'faker/locale/en_US';

import type { IAttachment } from '~/redux/chat/types';

interface IOptions {
  useConstValues: boolean;
}

export default (
  override?: Partial<IAttachment>,
  options?: Partial<IOptions>,
): IAttachment => {
  let originalName = faker.system.commonFileName();
  if (options?.useConstValues) originalName = 'Test file';

  let size = faker.datatype.number({ min: 500, max: 5000 });
  if (options?.useConstValues) size = 10000;

  let path = faker.system.filePath();
  if (options?.useConstValues) path = '/hello/world';

  let mimeType = faker.system.mimeType();
  if (options?.useConstValues) mimeType = 'png';

  let imageDimensions: { width: number; height: number } | undefined =
    Math.random() < 0.5
      ? undefined
      : {
          width: faker.datatype.number({ min: 100, max: 500 }),
          height: faker.datatype.number({ min: 100, max: 500 }),
        };
  if (options?.useConstValues) imageDimensions = { width: 100, height: 100 };

  return {
    originalName,
    size,
    path,
    mimeType,
    imageDimensions,
    ...(override || {}),
  } as IAttachment;
};

export type { IOptions };
