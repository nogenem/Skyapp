import React from 'react';

import { fireEvent, render } from '@testing-library/react';

import ChangeLanguageMenu from '../ChangeLanguageMenu';
import type { TProps } from '../ChangeLanguageMenu';

describe('ChangeLanguageMenu', () => {
  it('calls `handleLanguageChange` when clicking on a `Language` menu item', () => {
    const props: TProps = {
      anchorEl: document.body,
      handleLanguageChange: jest.fn(),
      handleClose: jest.fn(),
      setMenuState: jest.fn(),
    };

    const { getByText, getByTestId } = render(
      <ChangeLanguageMenu {...props} />,
    );

    fireEvent.click(getByText(/.+pt-br$/i));
    fireEvent.click(getByTestId(/change_menu_header_action/i));

    expect(props.handleLanguageChange).toHaveBeenCalledTimes(1);
    expect(props.handleLanguageChange).toHaveBeenCalledWith('pt-BR');
  });
});
