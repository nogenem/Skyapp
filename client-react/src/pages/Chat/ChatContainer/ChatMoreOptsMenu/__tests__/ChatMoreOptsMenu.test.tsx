import React from 'react';

import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ChatMoreOptsMenu } from '../index';

describe('ChatMoreOptsMenu', () => {
  it('handles clicking in `more options`', () => {
    const { getByLabelText, getByText } = render(
      <ChatMoreOptsMenu addFiles={(files: File[]) => {}} />,
    );

    fireEvent.click(getByLabelText(/more options/i));

    expect(getByText(/add files/i)).toBeInTheDocument();
    expect(getByText(/record/i)).toBeInTheDocument();
  });

  it('calls `addFiles` after user tries to upload a file', () => {
    const addFiles = jest.fn();
    const { baseElement, getByLabelText } = render(
      <ChatMoreOptsMenu addFiles={addFiles} />,
    );

    fireEvent.click(getByLabelText(/more options/i));

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = baseElement.querySelector(
      'input[name="files"]',
    ) as HTMLInputElement;
    userEvent.upload(input, file);

    expect(addFiles).toHaveBeenCalled();
    expect(addFiles).toHaveBeenCalledWith([file]);
  });
});
