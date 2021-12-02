import React from 'react';

import { fireEvent, render } from '@testing-library/react';

import { MENU_STATES } from '~/constants/chat_menu_states';
import FACTORIES from '~/utils/factories';

import MainMenu from '../MainMenu';
import type { TProps } from '../MainMenu';

describe('MainMenu', () => {
  it('calls `handleSignOut` when clicking on `Sign Out` menu item', () => {
    const user = FACTORIES.models.user();

    const props: TProps = {
      userStatus: user.status,
      anchorEl: document.body,
      themeMode: 'dark',
      handleSignOut: jest.fn(),
      handleSwitchThemeMode: jest.fn(),
      handleClose: jest.fn(),
      setMenuState: jest.fn(),
    };

    const { getByText } = render(<MainMenu {...props} />);

    fireEvent.click(getByText(/sign out/i));

    expect(props.handleSignOut).toHaveBeenCalledTimes(1);
  });

  it('calls `handleSwitchThemeMode` when clicking on `Theme Toggler` component', () => {
    const user = FACTORIES.models.user();

    const props: TProps = {
      userStatus: user.status,
      anchorEl: document.body,
      themeMode: 'dark',
      handleSignOut: jest.fn(),
      handleSwitchThemeMode: jest.fn(),
      handleClose: jest.fn(),
      setMenuState: jest.fn(),
    };

    const { getByTestId } = render(<MainMenu {...props} />);

    const element = getByTestId(/theme_toggler/i).querySelector(
      'input[type="checkbox"]',
    ) as Element;
    fireEvent.click(element);

    expect(props.handleSwitchThemeMode).toHaveBeenCalledTimes(1);
  });

  it('calls `setMenuState` when clicking on `Lang Changer` component', () => {
    const user = FACTORIES.models.user();

    const props: TProps = {
      userStatus: user.status,
      anchorEl: document.body,
      themeMode: 'dark',
      handleSignOut: jest.fn(),
      handleSwitchThemeMode: jest.fn(),
      handleClose: jest.fn(),
      setMenuState: jest.fn(),
    };

    const { getByTestId } = render(<MainMenu {...props} />);

    fireEvent.click(getByTestId(/lang_changer/i));

    expect(props.setMenuState).toHaveBeenCalledTimes(1);
    expect(props.setMenuState).toHaveBeenCalledWith(
      MENU_STATES.CHANGING_LANGUAGE,
    );
  });

  it('calls `setMenuState` when clicking on `User Status Changer` component', () => {
    const user = FACTORIES.models.user();

    const props: TProps = {
      userStatus: user.status,
      anchorEl: document.body,
      themeMode: 'dark',
      handleSignOut: jest.fn(),
      handleSwitchThemeMode: jest.fn(),
      handleClose: jest.fn(),
      setMenuState: jest.fn(),
    };

    const { getByTestId } = render(<MainMenu {...props} />);

    fireEvent.click(getByTestId(/user_status_changer/i));

    expect(props.setMenuState).toHaveBeenCalledTimes(1);
    expect(props.setMenuState).toHaveBeenCalledWith(
      MENU_STATES.CHANGING_USER_STATUS,
    );
  });
});
