import React from 'react';

import { getRenderWithRedux } from '~/utils/testUtils';

import Sidebar from '../Sidebar';

const renderWithRedux = getRenderWithRedux();

describe('Sidebar', () => {
  it('renders correctly when `isUserEmailConfirmed` is true', () => {
    const { container } = renderWithRedux(
      <Sidebar isUserEmailConfirmed={true} />,
    );

    expect(container).toMatchSnapshot();
  });
  it('renders correctly when `isUserEmailConfirmed` is false', () => {
    const { container } = renderWithRedux(
      <Sidebar isUserEmailConfirmed={false} />,
    );

    expect(container).toMatchSnapshot();
  });
});
