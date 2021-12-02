import faker from 'faker/locale/en_US';

import type { IAttachment } from '~/redux/chat/types';

export default (override?: Partial<IAttachment>): IAttachment =>
  ({
    originalName: faker.system.commonFileName(),
    size: faker.datatype.number({ min: 500, max: 5000 }),
    path: faker.system.filePath(),
    mimeType: faker.system.mimeType(),
    imageDimensions:
      Math.random() < 0.5
        ? undefined
        : {
            width: faker.datatype.number({ min: 100, max: 500 }),
            height: faker.datatype.number({ min: 100, max: 500 }),
          },
    ...(override || {}),
  } as IAttachment);
