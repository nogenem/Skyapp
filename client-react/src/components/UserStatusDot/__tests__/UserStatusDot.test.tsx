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
      const { container } = render(<UserStatusDot online status={status} />);
      expect(container).toMatchSnapshot();
    });
  });
});
