import React from 'react';
import { Provider } from 'react-redux';

import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import type { IAppState } from '~/redux/store';

import { SignUp as SignUpPage } from '../index';

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

// TODO: Add better tests for this !?
// The ./Form is already being tested by this
// and the ~/components/Form is being tested there, so...
describe('SignUpPage', () => {
  it('renders correctly', () => {
    const { container } = renderWithRedux(<SignUpPage />);

    expect(container).toMatchSnapshot();
  });
});
