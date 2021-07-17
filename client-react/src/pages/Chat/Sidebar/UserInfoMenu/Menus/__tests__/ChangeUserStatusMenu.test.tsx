import React from 'react';

import { fireEvent, render } from '@testing-library/react';

import { USER_STATUS, USER_STATUS_2_TEXT } from '~/constants/user_status';

import ChangeUserStatusMenu from '../ChangeUserStatusMenu';
import type { TProps } from '../ChangeUserStatusMenu';

describe('ChangeUserStatusMenu', () => {
  it('calls `handleUserStatusChange` when clicking on a `Status` menu item', () => {
    const props: TProps = {
      userStatus: USER_STATUS.ACTIVE,
      anchorEl: document.body,
      handleUserStatusChange: jest.fn(() => Promise.resolve()),
      handleClose: jest.fn(),
      setMenuState: jest.fn(),
    };

    const { getByText, getByTestId } = render(
      <ChangeUserStatusMenu {...props} />,
    );

    const regex = new RegExp(`.+${USER_STATUS_2_TEXT[USER_STATUS.AWAY]}$`, 'i');
    fireEvent.click(getByText(regex));
    fireEvent.click(getByTestId(/change_menu_header_action/i));

    expect(props.handleUserStatusChange).toHaveBeenCalledTimes(1);
    expect(props.handleUserStatusChange).toHaveBeenCalledWith(USER_STATUS.AWAY);
  });
});
