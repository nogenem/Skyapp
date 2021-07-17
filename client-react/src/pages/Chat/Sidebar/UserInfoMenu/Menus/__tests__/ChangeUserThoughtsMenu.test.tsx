import React from 'react';

import { fireEvent, render } from '@testing-library/react';

import ChangeUserThoughtsMenu from '../ChangeUserThoughtsMenu';
import type { TProps } from '../ChangeUserThoughtsMenu';

describe('ChangeUserThoughtsMenu', () => {
  it('calls `handleUserThoughtsChange` when changing the user thoughts', () => {
    const props: TProps = {
      userThoughts: 'hello',
      anchorEl: document.body,
      handleUserThoughtsChange: jest.fn(() => Promise.resolve()),
      handleClose: jest.fn(),
      setMenuState: jest.fn(),
    };
    const newThoughts = 'hello world';

    const { baseElement, getByTestId } = render(
      <ChangeUserThoughtsMenu {...props} />,
    );

    const input = baseElement.querySelector('#change-user-thoughts') as Element;
    fireEvent.change(input, { target: { value: newThoughts } });
    fireEvent.click(getByTestId(/change_menu_header_action/i));

    expect(props.handleUserThoughtsChange).toHaveBeenCalledTimes(1);
    expect(props.handleUserThoughtsChange).toHaveBeenCalledWith(newThoughts);
  });
});
