import React from 'react';

import { getRenderWithRedux } from '~/utils/testUtils';

import { SignIn as SignInPage } from '../index';

const renderWithRedux = getRenderWithRedux();

// TODO: Add better tests for this !?
// The ./Form is already being tested by this
// and the ~/components/Form is being tested there, so...
describe('SignInPage', () => {
  it('renders correctly', () => {
    const { container } = renderWithRedux(<SignInPage />);

    expect(container).toMatchSnapshot();
  });
});
