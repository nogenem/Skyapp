import React from 'react';

import { render, fireEvent, waitFor, getByText } from '@testing-library/react';
import i18n from 'i18next';

import { SUPPORTED_LANGUAGES } from '~/i18n';
import { TThemeMode } from '~/redux/theme/types';
import { TUserState } from '~/redux/user/types';
import FACTORIES from '~/utils/factories';
import { getRenderWithRedux } from '~/utils/testUtils';

import {
  UnauthenticatedNavBar,
  UnconnectedUnauthenticatedNavBar,
} from '../index';
import type { TProps } from '../index';

const renderWithRedux = getRenderWithRedux();

describe('UnauthenticatedNavBar', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders correctly when `isAuthenticated` is false', () => {
    const { getByText } = renderWithRedux(<UnauthenticatedNavBar />);
    expect(getByText(/skyapp/i)).toBeInTheDocument();
  });

  it('renders nothing when `isAuthenticated` is true', () => {
    const initialUser: TUserState = FACTORIES.states.user();
    const initialState = { user: initialUser };

    const { queryByText } = renderWithRedux(
      <UnauthenticatedNavBar />,
      initialState,
    );
    expect(queryByText(/skyapp/i)).not.toBeInTheDocument();
  });

  it('can switch themes', () => {
    const props: TProps = {
      isAuthenticated: false,
      theme: 'light' as TThemeMode,
      themeModeSwitched: jest.fn(),
    };
    const { getByTestId } = render(
      <UnconnectedUnauthenticatedNavBar {...props} />,
    );

    fireEvent.click(getByTestId('toggle_theme_btn'));

    expect(props.themeModeSwitched).toHaveBeenCalledTimes(1);
    expect(props.themeModeSwitched).toHaveBeenCalledWith('dark');
  });

  it('can change language', async () => {
    const props: TProps = {
      isAuthenticated: false,
      theme: 'dark' as TThemeMode,
      themeModeSwitched: jest.fn(),
    };
    const { getByTestId, baseElement } = render(
      <UnconnectedUnauthenticatedNavBar {...props} />,
    );

    const spyWindowReload = jest
      .spyOn(window.location, 'reload')
      .mockImplementationOnce(() => {});

    fireEvent.click(getByTestId('open_lang_menu'));

    const notSelectedLanguage = SUPPORTED_LANGUAGES.filter(
      lang => lang !== i18n.language,
    )[0];
    const notSelectedLanguageRegex = new RegExp(
      notSelectedLanguage.toLowerCase(),
      'i',
    );

    await waitFor(() =>
      expect(
        getByText(
          baseElement.querySelector('#language-menu') as HTMLElement,
          notSelectedLanguageRegex,
        ),
      ).toBeInTheDocument(),
    );

    fireEvent.click(
      getByText(
        baseElement.querySelector('#language-menu') as HTMLElement,
        notSelectedLanguageRegex,
      ),
    );

    expect(i18n.language).toBe(notSelectedLanguage);
    expect(spyWindowReload).toHaveBeenCalledTimes(1);
  });
});
