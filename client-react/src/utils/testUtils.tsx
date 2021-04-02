import React from 'react';
import { Provider } from 'react-redux';

import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import type { IAppState } from '~/redux/store';

export const getMockStore = () => {
  const middlewares = [thunk];
  return configureStore(middlewares);
};

export const getRenderWithRedux = () => {
  const emptyState: Partial<IAppState> = {};
  const mockStore = getMockStore();

  return (
    ui: React.ReactNode,
    initialState: Partial<IAppState> = emptyState,
  ) => {
    const store = mockStore(initialState);
    return {
      ...render(<Provider store={store}>{ui}</Provider>),
    };
  };
};
