import React from 'react';

import { getRenderWithRedux } from '~/utils/testUtils';

import {
  Chat as ChatPage,
  UnconnectedChat as UnconnectedChatPage,
} from '../index';

const renderWithRedux = getRenderWithRedux();

describe('Connected ChatPage', () => {
  it('renders correctly', () => {
    const { container } = renderWithRedux(<ChatPage />);

    expect(container).toMatchSnapshot();
  });
});

describe('Unconnected ChatPage', () => {
  it('renders CTA when `isUserEmailConfirmed` is false', () => {
    const { getByText } = renderWithRedux(
      <UnconnectedChatPage
        isUserEmailConfirmed={false}
        activeChannel={undefined}
      />,
    );

    expect(getByText(/confirm your email/i)).toBeInTheDocument();
  });

  it("doesn't render CTA when `isUserEmailConfirmed` is true", () => {
    const { queryByText } = renderWithRedux(
      <UnconnectedChatPage isUserEmailConfirmed activeChannel={undefined} />,
    );

    expect(queryByText(/confirm your email/i)).not.toBeInTheDocument();
  });
});
