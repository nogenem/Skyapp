import React from 'react';

import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { IMessage } from '~/redux/chat/types';
import FACTORIES from '~/utils/factories';
import { getRenderWithRedux } from '~/utils/testUtils';

import { ChatInput } from '../index';

const renderWithRedux = getRenderWithRedux();

describe('ChatInput', () => {
  it('handles submitting a text message', () => {
    const handleSubmit = jest.fn();

    const { getByLabelText } = renderWithRedux(
      <ChatInput
        handleSubmit={handleSubmit}
        handleSendingFiles={(filesData: FormData) => {}}
        startEditingLoggedUserLastestMessage={() => {}}
        stopEditingMessage={() => {}}
      />,
    );

    const message = 'a message';

    fireEvent.change(getByLabelText(/type here/i), {
      target: { value: message },
    });
    fireEvent.click(getByLabelText(/send/i));

    expect(handleSubmit).toHaveBeenCalled();
    expect(handleSubmit).toHaveBeenCalledWith(message);
  });

  it("shows the editing message's text", () => {
    const editingMessage: IMessage = FACTORIES.models.message(
      {
        body: 'message 1',
      },
      { useConstValues: true },
    );

    const { getByLabelText } = renderWithRedux(
      <ChatInput
        editingMessage={editingMessage}
        handleSubmit={(message: string) => {}}
        handleSendingFiles={(filesData: FormData) => {}}
        startEditingLoggedUserLastestMessage={() => {}}
        stopEditingMessage={() => {}}
      />,
    );

    const input = getByLabelText(/type here/i) as HTMLTextAreaElement;
    expect(input.value).toBe(editingMessage.body);
  });

  it('handles keybord commands', () => {
    const editingMessage: IMessage = FACTORIES.models.message(
      {},
      { useConstValues: true },
    );
    const handleSubmit = jest.fn();
    const startEditingLoggedUserLastestMessage = jest.fn();
    const stopEditingMessage = jest.fn();

    const { getByLabelText } = renderWithRedux(
      <ChatInput
        editingMessage={editingMessage}
        handleSubmit={handleSubmit}
        handleSendingFiles={(filesData: FormData) => {}}
        startEditingLoggedUserLastestMessage={
          startEditingLoggedUserLastestMessage
        }
        stopEditingMessage={stopEditingMessage}
      />,
    );

    fireEvent.keyDown(getByLabelText(/type here/i), {
      key: 'Enter',
      shiftKey: false,
    });
    expect(handleSubmit).toHaveBeenCalled();

    fireEvent.keyDown(getByLabelText(/type here/i), {
      key: 'ArrowUp',
      shiftKey: true,
    });
    expect(startEditingLoggedUserLastestMessage).toHaveBeenCalled();

    fireEvent.keyDown(getByLabelText(/type here/i), { key: 'Escape' });
    expect(stopEditingMessage).toHaveBeenCalled();
  });

  it('shows a preview of the file to be uploaded and handles submitting it', () => {
    const handleSendingFiles = jest.fn();

    const { baseElement, getByLabelText, getByText } = renderWithRedux(
      <ChatInput
        handleSubmit={(message: string) => {}}
        handleSendingFiles={handleSendingFiles}
        startEditingLoggedUserLastestMessage={() => {}}
        stopEditingMessage={() => {}}
      />,
    );

    fireEvent.click(getByLabelText(/more options/i));

    const file = new File(['hello file'], 'hello.txt', { type: 'text/plain' });
    const input = baseElement.querySelector(
      'input[name="files"]',
    ) as HTMLInputElement;
    userEvent.upload(input, file);

    expect(getByText(file.name)).toBeInTheDocument();

    fireEvent.click(getByLabelText(/send/i));

    expect(handleSendingFiles).toHaveBeenCalled();
  });
});
