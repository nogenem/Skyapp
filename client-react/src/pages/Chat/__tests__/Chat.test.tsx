import React from 'react';
import { Provider } from 'react-redux';

import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import type { IAppState } from '~/redux/store';

import {
  Chat as ChatPage,
  UnconnectedChat as UnconnectedChatPage,
} from '../index';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const emptyState: Partial<IAppState> = {};
const renderWithRedux = (
  ui: React.ReactNode,
  initialState: Partial<IAppState> = emptyState,
) => {
  const store = mockStore(initialState);
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
  };
};

describe('Connected ChatPage', () => {
  it('renders correctly', () => {
    const { container } = renderWithRedux(<ChatPage />);

    expect(container).toMatchSnapshot();
  });
});

describe('Unconnected ChatPage', () => {
  it('renders CTA when `isUserEmailConfirmed` is false', () => {
    const { getByText } = renderWithRedux(
      <UnconnectedChatPage isUserEmailConfirmed={false} />,
    );

    expect(getByText(/confirm your email/i)).toBeInTheDocument();
  });

  it("doesn't render CTA when `isUserEmailConfirmed` is true", () => {
    const { queryByText } = renderWithRedux(
      <UnconnectedChatPage isUserEmailConfirmed />,
    );

    expect(queryByText(/confirm your email/i)).not.toBeInTheDocument();
  });
});
