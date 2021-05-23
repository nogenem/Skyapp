import React from 'react';

import { render } from '@testing-library/react';

import { USER_STATUS } from '~/constants/user_status';

import { UserStatusDot } from '../index';

describe('UserStatusDot', () => {
  it('renders all status correctly', () => {
    const { container } = render(
      <UserStatusDot online={false} status={USER_STATUS.ACTIVE} />,
    );
    expect(container).toMatchSnapshot();

    Object.values(USER_STATUS).forEach(status => {
      const { container } = render(
        <UserStatusDot online status={status} showInvisible />,
      );
      expect(container).toMatchSnapshot();
    });
  });

  it('renders correctly when `showInvisible` = false, `online` = true and `status` = INVISIBLE', () => {
    const { container } = render(
      <UserStatusDot
        online={true}
        status={USER_STATUS.INVISIBLE}
        showInvisible={false}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
